// POST /api/admin/criar-manual — Criar agendamento manual pelo admin
import { env } from 'cloudflare:workers';
import type { APIRoute } from 'astro';
import { createManualAppointment, updateGcalEventId } from '../../../lib/db';
import { createCalendarEvent, buildCalendarEvent } from '../../../lib/gcal';
import { verifyAdminToken, getAdminTokenFromRequest } from '../../../lib/auth';
import { GCAL_ENV_MAP } from '../../../lib/constants';
import { sendAdminNotificationEmail } from '../../../lib/email';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const cfEnv = env as unknown as Env;

  const token = getAdminTokenFromRequest(request);
  if (!token || !(await verifyAdminToken(cfEnv.ADMIN_JWT_SECRET, token))) {
    return new Response(JSON.stringify({ error: 'Não autorizado.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'JSON inválido.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const {
    patient_name, patient_phone, patient_email,
    unit, specialty, health_plan,
    appointment_date, appointment_hour, appointment_minute,
    appointment_type, notes, status,
  } = body as Record<string, string | number | null | undefined>;

  if (!patient_name || !patient_phone || !unit || !specialty ||
      !appointment_date || appointment_hour === undefined) {
    return new Response(JSON.stringify({ error: 'Campos obrigatórios ausentes.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const db = cfEnv.DB;

    const { id, cancel_token } = await createManualAppointment(db, {
      patient_name: String(patient_name),
      patient_phone: String(patient_phone),
      patient_email: patient_email ? String(patient_email) : null,
      unit: String(unit),
      specialty: String(specialty),
      health_plan: String(health_plan ?? 'Particular'),
      appointment_date: String(appointment_date),
      appointment_hour: Number(appointment_hour),
      appointment_minute: Number(appointment_minute ?? 0),
      appointment_type: String(appointment_type ?? 'primeira_vez'),
      notes: notes ? String(notes) : null,
      status: (status === 'pending' ? 'pending' : 'confirmed') as 'pending' | 'confirmed',
    });

    // Google Calendar
    const calEnvKey = GCAL_ENV_MAP[String(unit)];
    const calendarId = calEnvKey ? (cfEnv as unknown as Record<string, string>)[calEnvKey] : null;
    if (calendarId) {
      try {
        const event = buildCalendarEvent({
          patient_name: String(patient_name),
          patient_phone: String(patient_phone),
          patient_email: patient_email ? String(patient_email) : null,
          unit: String(unit),
          specialty: String(specialty),
          health_plan: String(health_plan ?? 'Particular'),
          appointment_date: String(appointment_date),
          appointment_hour: Number(appointment_hour),
          appointment_minute: Number(appointment_minute ?? 0),
          appointment_type: String(appointment_type ?? 'primeira_vez'),
          notes: notes ? String(notes) : null,
        });
        const gcalId = await createCalendarEvent(cfEnv, calendarId, event);
        await updateGcalEventId(db, id, gcalId);
      } catch (gcalErr) {
        console.error('[criar-manual] GCal error (non-fatal):', gcalErr);
      }
    }

    // Notificação admin por email
    if (cfEnv.RESEND_API_KEY) {
      sendAdminNotificationEmail(cfEnv.RESEND_API_KEY, {
        patient_name: String(patient_name),
        patient_phone: String(patient_phone),
        patient_email: patient_email ? String(patient_email) : null,
        unit: String(unit),
        specialty: String(specialty),
        health_plan: String(health_plan ?? 'Particular'),
        appointment_date: String(appointment_date),
        appointment_hour: Number(appointment_hour),
        appointment_minute: Number(appointment_minute ?? 0),
        appointment_type: String(appointment_type ?? 'primeira_vez'),
        notes: notes ? String(notes) : null,
      }).catch(e => console.error('[criar-manual] Email error:', e));
    }

    return new Response(JSON.stringify({ success: true, id, cancel_token }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[criar-manual] Error:', err);
    return new Response(JSON.stringify({ error: 'Erro ao criar agendamento.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
