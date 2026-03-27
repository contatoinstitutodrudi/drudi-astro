// ============================================================
// Helpers de acesso ao banco D1 (Cloudflare)
// ============================================================

export interface Appointment {
  id: number;
  patient_name: string;
  patient_phone: string;
  patient_email: string | null;
  unit: string;
  specialty: string;
  health_plan: string;
  appointment_date: string;   // YYYY-MM-DD
  appointment_hour: number;
  appointment_minute: number;
  appointment_type: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  notes: string | null;
  cancel_token: string | null;
  gcal_event_id: string | null;
  created_at: number;
}

export interface DayBlock {
  id: number;
  unit: string;
  blocked_date: string;
  reason: string | null;
  created_at: number;
}

// Gerar token de cancelamento aleatório
export function generateCancelToken(): string {
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Buscar agendamentos por data e unidade
export async function getAppointmentsByDateUnit(
  db: D1Database,
  date: string,
  unit: string
): Promise<Appointment[]> {
  const result = await db
    .prepare(
      `SELECT * FROM appointments
       WHERE appointment_date = ? AND unit = ? AND status != 'cancelled'
       ORDER BY appointment_hour, appointment_minute`
    )
    .bind(date, unit)
    .all<Appointment>();
  return result.results;
}

// Verificar se um dia está bloqueado
export async function isDayBlocked(
  db: D1Database,
  date: string,
  unit: string
): Promise<boolean> {
  const result = await db
    .prepare(
      `SELECT id FROM day_blocks WHERE blocked_date = ? AND (unit = ? OR unit = 'all') LIMIT 1`
    )
    .bind(date, unit)
    .first<{ id: number }>();
  return result !== null;
}

// Criar agendamento
export async function createAppointment(
  db: D1Database,
  data: Omit<Appointment, 'id' | 'created_at' | 'cancel_token' | 'gcal_event_id' | 'status'>
): Promise<{ id: number; cancel_token: string }> {
  const cancelToken = generateCancelToken();
  const result = await db
    .prepare(
      `INSERT INTO appointments
        (patient_name, patient_phone, patient_email, unit, specialty, health_plan,
         appointment_date, appointment_hour, appointment_minute, appointment_type,
         status, notes, cancel_token)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)
       RETURNING id`
    )
    .bind(
      data.patient_name,
      data.patient_phone,
      data.patient_email ?? null,
      data.unit,
      data.specialty,
      data.health_plan,
      data.appointment_date,
      data.appointment_hour,
      data.appointment_minute,
      data.appointment_type,
      data.notes ?? null,
      cancelToken
    )
    .first<{ id: number }>();

  if (!result) throw new Error('Falha ao criar agendamento.');
  return { id: result.id, cancel_token: cancelToken };
}

// Atualizar status
export async function updateAppointmentStatus(
  db: D1Database,
  id: number,
  status: 'pending' | 'confirmed' | 'cancelled'
): Promise<void> {
  await db
    .prepare(`UPDATE appointments SET status = ? WHERE id = ?`)
    .bind(status, id)
    .run();
}

// Atualizar gcal_event_id
export async function updateGcalEventId(
  db: D1Database,
  id: number,
  gcalEventId: string
): Promise<void> {
  await db
    .prepare(`UPDATE appointments SET gcal_event_id = ? WHERE id = ?`)
    .bind(gcalEventId, id)
    .run();
}

// Listar agendamentos com filtros
export async function listAppointments(
  db: D1Database,
  filters: {
    status?: string;
    unit?: string;
    date?: string;
    specialty?: string;
  } = {}
): Promise<Appointment[]> {
  let query = 'SELECT * FROM appointments WHERE 1=1';
  const params: (string | number)[] = [];

  if (filters.status && filters.status !== 'all') {
    query += ' AND status = ?';
    params.push(filters.status);
  }
  if (filters.unit && filters.unit !== 'all') {
    query += ' AND unit = ?';
    params.push(filters.unit);
  }
  if (filters.date) {
    query += ' AND appointment_date = ?';
    params.push(filters.date);
  }
  if (filters.specialty && filters.specialty !== 'all') {
    query += ' AND specialty = ?';
    params.push(filters.specialty);
  }

  query += ' ORDER BY appointment_date DESC, appointment_hour, appointment_minute';

  const result = await db.prepare(query).bind(...params).all<Appointment>();
  return result.results;
}

// Buscar agendamento por cancel_token
export async function getAppointmentByCancelToken(
  db: D1Database,
  token: string
): Promise<Appointment | null> {
  return db
    .prepare(`SELECT * FROM appointments WHERE cancel_token = ? LIMIT 1`)
    .bind(token)
    .first<Appointment>();
}
