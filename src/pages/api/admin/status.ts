// PATCH /api/admin/status
import { env } from "cloudflare:workers";
import type { APIRoute } from 'astro';
import { updateAppointmentStatus, listAppointments } from '../../../lib/db';
import { deleteCalendarEvent } from '../../../lib/gcal';
import { verifyAdminToken, getAdminTokenFromRequest } from '../../../lib/auth';
import { GCAL_ENV_MAP } from '../../../lib/constants';

export const prerender = false;

export const PATCH: APIRoute = async ({ request }) => {
  const cfEnv = env as unknown as Env;

  const token = getAdminTokenFromRequest(request);
  if (!token || !(await verifyAdminToken(cfEnv.ADMIN_JWT_SECRET, token))) {
    return new Response(JSON.stringify({ error: 'Não autorizado.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body: { id?: number; status?: string };
  try {
    body = await request.json() as { id?: number; status?: string };
  } catch {
    return new Response(JSON.stringify({ error: 'JSON inválido.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { id, status } = body;
  if (!id || !status || !['pending', 'confirmed', 'cancelled'].includes(status)) {
    return new Response(JSON.stringify({ error: 'Parâmetros inválidos.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Se cancelando, remover do Google Calendar
    if (status === 'cancelled') {
      const rows = await listAppointments(cfEnv.DB, {});
      const appt = rows.find(a => a.id === id);
      if (appt?.gcal_event_id) {
        const calEnvKey = GCAL_ENV_MAP[appt.unit];
        const calendarId = calEnvKey ? (cfEnv as unknown as Record<string, string>)[calEnvKey] : null;
        if (calendarId) {
          deleteCalendarEvent(cfEnv, calendarId, appt.gcal_event_id).catch(e =>
            console.error('[status] GCal delete error:', e)
          );
        }
      }
    }

    await updateAppointmentStatus(cfEnv.DB, id, status as 'pending' | 'confirmed' | 'cancelled');

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[admin/status] Error:', err);
    return new Response(JSON.stringify({ error: 'Erro interno.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
