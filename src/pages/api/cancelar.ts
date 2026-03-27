// GET /api/cancelar?token=xxx
import type { APIRoute } from 'astro';
import { getAppointmentByCancelToken, updateAppointmentStatus } from '../../lib/db';
import { deleteCalendarEvent } from '../../lib/gcal';
import { GCAL_ENV_MAP } from '../../lib/constants';

export const prerender = false;

export const GET: APIRoute = async ({ request, locals }) => {
  const env = (locals as { runtime: { env: Env } }).runtime.env;
  const url = new URL(request.url);
  const token = url.searchParams.get('token');

  if (!token) {
    return new Response(JSON.stringify({ error: 'Token inválido.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const appt = await getAppointmentByCancelToken(env.DB, token);
    if (!appt) {
      return new Response(JSON.stringify({ error: 'Agendamento não encontrado.' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (appt.status === 'cancelled') {
      return new Response(JSON.stringify({ already: true }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await updateAppointmentStatus(env.DB, appt.id, 'cancelled');

    // Remover do Google Calendar
    if (appt.gcal_event_id) {
      const calEnvKey = GCAL_ENV_MAP[appt.unit];
      const calendarId = calEnvKey ? (env as unknown as Record<string, string>)[calEnvKey] : null;
      if (calendarId) {
        deleteCalendarEvent(env, calendarId, appt.gcal_event_id).catch(e =>
          console.error('[cancelar] GCal delete error:', e)
        );
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[cancelar] Error:', err);
    return new Response(JSON.stringify({ error: 'Erro interno.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
