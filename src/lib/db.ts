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

// Bloquear dia para uma unidade
export async function blockDay(
  db: D1Database,
  unit: string,
  date: string,
  reason: string | null
): Promise<{ alreadyBlocked: boolean }> {
  const existing = await db
    .prepare(`SELECT id FROM day_blocks WHERE unit = ? AND blocked_date = ? LIMIT 1`)
    .bind(unit, date)
    .first<{ id: number }>();
  if (existing) return { alreadyBlocked: true };
  await db
    .prepare(`INSERT INTO day_blocks (unit, blocked_date, reason) VALUES (?, ?, ?)`)
    .bind(unit, date, reason ?? null)
    .run();
  return { alreadyBlocked: false };
}

// Remover bloqueio de dia
export async function unblockDay(
  db: D1Database,
  id: number
): Promise<void> {
  await db.prepare(`DELETE FROM day_blocks WHERE id = ?`).bind(id).run();
}

// Listar bloqueios de dias
export async function listDayBlocks(
  db: D1Database,
  unit?: string
): Promise<DayBlock[]> {
  let query = 'SELECT * FROM day_blocks WHERE 1=1';
  const params: string[] = [];
  if (unit && unit !== 'all') {
    query += ' AND unit = ?';
    params.push(unit);
  }
  query += ' ORDER BY blocked_date DESC';
  const result = await db.prepare(query).bind(...params).all<DayBlock>();
  return result.results;
}

// Contar agendamentos por status (dashboard)
export async function countAppointmentsByStatus(
  db: D1Database
): Promise<{ pending: number; confirmed: number; cancelled: number; total: number }> {
  const result = await db
    .prepare(
      `SELECT
        SUM(CASE WHEN status='pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status='confirmed' THEN 1 ELSE 0 END) as confirmed,
        SUM(CASE WHEN status='cancelled' THEN 1 ELSE 0 END) as cancelled,
        COUNT(*) as total
       FROM appointments`
    )
    .first<{ pending: number; confirmed: number; cancelled: number; total: number }>();
  return result ?? { pending: 0, confirmed: 0, cancelled: 0, total: 0 };
}

// Agendamentos de hoje por unidade (dashboard)
export async function getTodayAppointments(
  db: D1Database,
  todayDate: string
): Promise<Appointment[]> {
  const result = await db
    .prepare(
      `SELECT * FROM appointments
       WHERE appointment_date = ? AND status != 'cancelled'
       ORDER BY unit, appointment_hour, appointment_minute`
    )
    .bind(todayDate)
    .all<Appointment>();
  return result.results;
}

// Próximos agendamentos (próximos 7 dias)
export async function getUpcomingAppointments(
  db: D1Database,
  fromDate: string,
  toDate: string
): Promise<Appointment[]> {
  const result = await db
    .prepare(
      `SELECT * FROM appointments
       WHERE appointment_date >= ? AND appointment_date <= ? AND status != 'cancelled'
       ORDER BY appointment_date, appointment_hour, appointment_minute`
    )
    .bind(fromDate, toDate)
    .all<Appointment>();
  return result.results;
}

// Criar agendamento manual (pelo admin)
export async function createManualAppointment(
  db: D1Database,
  data: {
    patient_name: string;
    patient_phone: string;
    patient_email: string | null;
    unit: string;
    specialty: string;
    health_plan: string;
    appointment_date: string;
    appointment_hour: number;
    appointment_minute: number;
    appointment_type: string;
    notes: string | null;
    status: 'pending' | 'confirmed';
  }
): Promise<{ id: number; cancel_token: string }> {
  const cancelToken = generateCancelToken();
  const result = await db
    .prepare(
      `INSERT INTO appointments
        (patient_name, patient_phone, patient_email, unit, specialty, health_plan,
         appointment_date, appointment_hour, appointment_minute, appointment_type,
         status, notes, cancel_token)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      data.status,
      data.notes ?? null,
      cancelToken
    )
    .first<{ id: number }>();
  if (!result) throw new Error('Falha ao criar agendamento.');
  return { id: result.id, cancel_token: cancelToken };
}

// Formatar data para exibição
export function formatDateBR(dateStr: string): string {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

// Formatar hora para exibição
export function formatHour(hour: number, minute: number = 0): string {
  return `${String(hour).padStart(2, '0')}h${String(minute).padStart(2, '0')}`;
}
