// GET /api/admin/stats — Dashboard metrics
import { env } from 'cloudflare:workers';
import type { APIRoute } from 'astro';
import {
  countAppointmentsByStatus,
  getTodayAppointments,
  getUpcomingAppointments,
  listDayBlocks,
  listAppointments,
} from '../../../lib/db';
import { verifyAdminToken, getAdminTokenFromRequest } from '../../../lib/auth';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const cfEnv = env as unknown as Env;

  const token = getAdminTokenFromRequest(request);
  if (!token || !(await verifyAdminToken(cfEnv.ADMIN_JWT_SECRET, token))) {
    return new Response(JSON.stringify({ error: 'Não autorizado.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const db = cfEnv.DB;
    const today = new Date().toISOString().split('T')[0];
    const in7Days = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const [counts, todayAppts, upcomingAppts, blocks] = await Promise.all([
      countAppointmentsByStatus(db),
      getTodayAppointments(db, today),
      getUpcomingAppointments(db, today, in7Days),
      listDayBlocks(db),
    ]);

    // Agendamentos por unidade (últimos 30 dias)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const recentAppts = await listAppointments(db, {});
    const byUnit: Record<string, number> = {};
    const bySpecialty: Record<string, number> = {};
    for (const a of recentAppts) {
      if (a.appointment_date >= thirtyDaysAgo) {
        byUnit[a.unit] = (byUnit[a.unit] ?? 0) + 1;
        bySpecialty[a.specialty] = (bySpecialty[a.specialty] ?? 0) + 1;
      }
    }

    return new Response(JSON.stringify({
      counts,
      todayAppointments: todayAppts,
      upcomingAppointments: upcomingAppts,
      dayBlocks: blocks,
      byUnit,
      bySpecialty,
      today,
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[admin/stats] Error:', err);
    return new Response(JSON.stringify({ error: 'Erro interno.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
