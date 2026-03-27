// POST /api/admin/login
import { env } from "cloudflare:workers";
import type { APIRoute } from 'astro';
import { createAdminToken, makeAdminCookie } from '../../../lib/auth';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const cfEnv = env as unknown as Env;

  let body: { password?: string };
  try {
    body = await request.json() as { password?: string };
  } catch {
    return new Response(JSON.stringify({ error: 'JSON inválido.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!body.password || body.password !== cfEnv.ADMIN_PASSWORD) {
    return new Response(JSON.stringify({ error: 'Senha incorreta.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const token = await createAdminToken(cfEnv.ADMIN_JWT_SECRET);
  const cookie = makeAdminCookie(token);

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': cookie,
    },
  });
};
