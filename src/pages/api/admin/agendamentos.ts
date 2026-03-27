// GET /api/admin/agendamentos?status=all&unit=all&date=&specialty=all
import { env } from "cloudflare:workers";
import type { APIRoute } from 'astro';
import { listAppointments } from '../../../lib/db';
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

  const url = new URL(request.url);
  const status = url.searchParams.get('status') ?? 'all';
  const unit = url.searchParams.get('unit') ?? 'all';
  const date = url.searchParams.get('date') ?? '';
  const specialty = url.searchParams.get('specialty') ?? 'all';

  try {
    const appointments = await listAppointments(cfEnv.DB, {
      status: status !== 'all' ? status : undefined,
      unit: unit !== 'all' ? unit : undefined,
      date: date || undefined,
      specialty: specialty !== 'all' ? specialty : undefined,
    });

    return new Response(JSON.stringify(appointments), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[admin/agendamentos] Error:', err);
    return new Response(JSON.stringify({ error: 'Erro interno.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
