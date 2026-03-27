// PATCH /api/admin/blog/post/[id] — atualizar post
// DELETE /api/admin/blog/post/[id] — deletar post
import { env } from "cloudflare:workers";
import type { APIRoute } from 'astro';
import { updatePost, deletePost } from '../../../../../lib/blog-db';
import { verifyAdminToken, getAdminTokenFromRequest } from '../../../../../lib/auth';

export const prerender = false;

export const PATCH: APIRoute = async ({ request, params }) => {
  const cfEnv = env as unknown as Env;
  const token = getAdminTokenFromRequest(request);
  if (!token || !(await verifyAdminToken(cfEnv.ADMIN_JWT_SECRET, token))) {
    return new Response(JSON.stringify({ error: 'Não autorizado.' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }

  const id = parseInt(params.id ?? '0');
  if (!id) return new Response(JSON.stringify({ error: 'ID inválido.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });

  let body: Record<string, unknown>;
  try {
    body = await request.json() as Record<string, unknown>;
  } catch {
    return new Response(JSON.stringify({ error: 'JSON inválido.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    await updatePost(cfEnv.DB, id, body as Parameters<typeof updatePost>[2]);
    return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('[admin/blog/post PATCH] Error:', err);
    return new Response(JSON.stringify({ error: 'Erro interno.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};

export const DELETE: APIRoute = async ({ request, params }) => {
  const cfEnv = env as unknown as Env;
  const token = getAdminTokenFromRequest(request);
  if (!token || !(await verifyAdminToken(cfEnv.ADMIN_JWT_SECRET, token))) {
    return new Response(JSON.stringify({ error: 'Não autorizado.' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }

  const id = parseInt(params.id ?? '0');
  if (!id) return new Response(JSON.stringify({ error: 'ID inválido.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });

  try {
    await deletePost(cfEnv.DB, id);
    return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('[admin/blog/post DELETE] Error:', err);
    return new Response(JSON.stringify({ error: 'Erro interno.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};
