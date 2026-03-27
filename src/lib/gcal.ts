// ============================================================
// Google Calendar helper — OAuth2 (refresh token)
// ============================================================

interface GCalEvent {
  summary: string;
  description?: string;
  start: { dateTime: string; timeZone: string };
  end: { dateTime: string; timeZone: string };
  attendees?: { email: string }[];
}

async function getAccessToken(env: Env): Promise<string> {
  const resp = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      refresh_token: env.GOOGLE_REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
  });
  if (!resp.ok) throw new Error('Falha ao obter access token do Google.');
  const data = await resp.json() as { access_token: string };
  return data.access_token;
}

export async function createCalendarEvent(
  env: Env,
  calendarId: string,
  event: GCalEvent
): Promise<string> {
  const token = await getAccessToken(env);
  const resp = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    }
  );
  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Falha ao criar evento no Google Calendar: ${err}`);
  }
  const data = await resp.json() as { id: string };
  return data.id;
}

export async function deleteCalendarEvent(
  env: Env,
  calendarId: string,
  eventId: string
): Promise<void> {
  const token = await getAccessToken(env);
  await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`,
    {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    }
  );
}

export function buildCalendarEvent(
  appointment: {
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
  }
): GCalEvent {
  const { appointment_date, appointment_hour, appointment_minute } = appointment;
  const pad = (n: number) => String(n).padStart(2, '0');
  const startISO = `${appointment_date}T${pad(appointment_hour)}:${pad(appointment_minute)}:00`;
  // Duração padrão: 30 minutos
  const endMinute = appointment_minute + 30;
  const endHour = appointment_hour + Math.floor(endMinute / 60);
  const endISO = `${appointment_date}T${pad(endHour)}:${pad(endMinute % 60)}:00`;

  const typeLabel: Record<string, string> = {
    primeira_vez: 'Primeira Consulta',
    retorno: 'Retorno',
    exame: 'Exame / Procedimento',
  };

  return {
    summary: `${appointment.patient_name} — ${appointment.specialty} (${typeLabel[appointment.appointment_type] ?? appointment.appointment_type})`,
    description: [
      `Paciente: ${appointment.patient_name}`,
      `Telefone: ${appointment.patient_phone}`,
      appointment.patient_email ? `E-mail: ${appointment.patient_email}` : null,
      `Unidade: ${appointment.unit}`,
      `Especialidade: ${appointment.specialty}`,
      `Plano: ${appointment.health_plan}`,
      `Tipo: ${typeLabel[appointment.appointment_type] ?? appointment.appointment_type}`,
      appointment.notes ? `Obs: ${appointment.notes}` : null,
    ].filter(Boolean).join('\n'),
    start: { dateTime: startISO, timeZone: 'America/Sao_Paulo' },
    end: { dateTime: endISO, timeZone: 'America/Sao_Paulo' },
    attendees: appointment.patient_email ? [{ email: appointment.patient_email }] : [],
  };
}
