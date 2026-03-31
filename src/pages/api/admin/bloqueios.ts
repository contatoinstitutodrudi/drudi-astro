// GET /api/admin/bloqueios?unit=all&month=YYYY-MM
// POST /api/admin/bloqueios  { unit, date, reason }
// DELETE /api/admin/bloqueios  { id }
import { env } from "cloudflare:workers";
import type { APIRoute } from 'astro';
import { verifyAdminToken, getAdminTokenFromRequest } from '../../../lib/auth';

export const prerender = false;

const authCheck = async (request: Request, cfEnv: Env): Promise<boolean> => {
  const token = getAdminTokenFromRequest(request);
  return !!(token && await verifyAdminToken(cfEnv.ADMIN_JWT_SECRET, token));
};

export const GET: APIRoute = async ({ request }) => {
  const cfEnv = env as unknown as Env;
  if (!(await authCheck(request, cfEnv))) {
    return new Response(JSON.stringify({ error: 'Não autorizado.' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }

  const url = new URL(request.url);
  const unit = url.searchParams.get('unit') ?? 'all';
  const month = url.searchParams.get('month') ?? '';

  try {
    let query = 'SELECT * FROM day_blocks WHERE 1=1';
    const params: string[] = [];

    if (unit && unit !== 'all') {
      query += ' AND unit = ?';
      params.push(unit);
    }
    if (month) {
      query += ' AND blocked_date LIKE ?';
      params.push(`${month}%`);
    }
    query += ' ORDER BY blocked_date DESC';

    const result = await cfEnv.DB.prepare(query).bind(...params).all();
    return new Response(JSON.stringify(result.results), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[bloqueios GET] Error:', err);
    return new Response(JSON.stringify({ error: 'Erro interno.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};

export const POST: APIRoute = async ({ request }) => {
  const cfEnv = env as unknown as Env;
  if (!(await authCheck(request, cfEnv))) {
    return new Response(JSON.stringify({ error: 'Não autorizado.' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }

  let body: { unit?: string; date?: string; reason?: string };
  try {
    body = await request.json() as typeof body;
  } catch {
    return new Response(JSON.stringify({ error: 'JSON inválido.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  const { unit, date, reason } = body;
  if (!unit || !date) {
    return new Response(JSON.stringify({ error: 'Campos unit e date são obrigatórios.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    await cfEnv.DB.prepare(
      `INSERT OR REPLACE INTO day_blocks (unit, blocked_date, reason) VALUES (?, ?, ?)`
    ).bind(unit, date, reason ?? null).run();

    return new Response(JSON.stringify({ success: true }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[bloqueios POST] Error:', err);
    return new Response(JSON.stringify({ error: 'Erro interno.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};

export const DELETE: APIRoute = async ({ request }) => {
  const cfEnv = env as unknown as Env;
  if (!(await authCheck(request, cfEnv))) {
    return new Response(JSON.stringify({ error: 'Não autorizado.' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }

  let body: { id?: number };
  try {
    body = await request.json() as typeof body;
  } catch {
    return new Response(JSON.stringify({ error: 'JSON inválido.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  if (!body.id) {
    return new Response(JSON.stringify({ error: 'ID obrigatório.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    await cfEnv.DB.prepare(`DELETE FROM day_blocks WHERE id = ?`).bind(body.id).run();
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[bloqueios DELETE] Error:', err);
    return new Response(JSON.stringify({ error: 'Erro interno.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};
