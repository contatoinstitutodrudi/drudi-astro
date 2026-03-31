// POST /api/agendamento/cancelar
// Body: { token: string }
import { env } from 'cloudflare:workers';
import type { APIRoute } from 'astro';
import {
  getAppointmentByCancelToken,
  updateAppointmentStatus,
} from '../../../lib/db';
import { deleteCalendarEvent } from '../../../lib/gcal';
import { GCAL_ENV_MAP } from '../../../lib/constants';
import { sendCancellationEmail } from '../../../lib/email';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  let body: { token?: string };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'JSON inválido.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { token } = body;
  if (!token) {
    return new Response(JSON.stringify({ error: 'Token de cancelamento obrigatório.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const cfEnv = env as unknown as Env;
    const db = cfEnv.DB;

    const appointment = await getAppointmentByCancelToken(db, token);
    if (!appointment) {
      return new Response(JSON.stringify({ error: 'Agendamento não encontrado.' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (appointment.status === 'cancelled') {
      return new Response(JSON.stringify({ error: 'Este agendamento já foi cancelado.' }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Verificar se a consulta ainda não passou
    const today = new Date().toISOString().split('T')[0];
    if (appointment.appointment_date < today) {
      return new Response(JSON.stringify({ error: 'Não é possível cancelar uma consulta que já passou.' }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Cancelar no banco
    await updateAppointmentStatus(db, appointment.id, 'cancelled');

    // E-mail de cancelamento para o paciente (não-fatal)
    if (appointment.patient_email) {
      try {
        await sendCancellationEmail(cfEnv.RESEND_API_KEY, {
          patient_name: appointment.patient_name,
          patient_email: appointment.patient_email,
          unit: appointment.unit,
          specialty: appointment.specialty,
          appointment_date: appointment.appointment_date,
          appointment_hour: appointment.appointment_hour,
          appointment_minute: appointment.appointment_minute,
        });
      } catch (emailErr) {
        console.error('[cancelar] Email error (non-fatal):', emailErr);
      }
    }

    // Remover do Google Calendar (não-fatal)
    if (appointment.gcal_event_id) {
      const calEnvKey = GCAL_ENV_MAP[appointment.unit];
      const calendarId = calEnvKey ? (cfEnv as unknown as Record<string, string>)[calEnvKey] : null;
      if (calendarId) {
        try {
          await deleteCalendarEvent(cfEnv, calendarId, appointment.gcal_event_id);
        } catch (gcalErr) {
          console.error('[cancelar] GCal delete error (non-fatal):', gcalErr);
        }
      }
    }

    return new Response(JSON.stringify({
      success: true,
      appointment: {
        patient_name: appointment.patient_name,
        unit: appointment.unit,
        appointment_date: appointment.appointment_date,
        appointment_hour: appointment.appointment_hour,
        appointment_minute: appointment.appointment_minute,
      },
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[cancelar] Error:', err);
    return new Response(JSON.stringify({ error: 'Erro ao cancelar agendamento.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
