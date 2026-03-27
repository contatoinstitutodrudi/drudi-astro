// GET /api/admin/blog/posts — listar todos (admin)
// POST /api/admin/blog/posts — criar novo post
import { env } from "cloudflare:workers";
import type { APIRoute } from 'astro';
import { listAllPosts, createPost } from '../../../../lib/blog-db';
import { verifyAdminToken, getAdminTokenFromRequest } from '../../../../lib/auth';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const cfEnv = env as unknown as Env;
  const token = getAdminTokenFromRequest(request);
  if (!token || !(await verifyAdminToken(cfEnv.ADMIN_JWT_SECRET, token))) {
    return new Response(JSON.stringify({ error: 'Não autorizado.' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }

  const url = new URL(request.url);
  const status = url.searchParams.get('status') ?? 'all';
  const category = url.searchParams.get('category') ?? 'all';
  const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '50'), 200);
  const offset = parseInt(url.searchParams.get('offset') ?? '0');

  try {
    const posts = await listAllPosts(cfEnv.DB, { status, category, limit, offset });
    return new Response(JSON.stringify(posts), { headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('[admin/blog/posts GET] Error:', err);
    return new Response(JSON.stringify({ error: 'Erro interno.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};

export const POST: APIRoute = async ({ request }) => {
  const cfEnv = env as unknown as Env;
  const token = getAdminTokenFromRequest(request);
  if (!token || !(await verifyAdminToken(cfEnv.ADMIN_JWT_SECRET, token))) {
    return new Response(JSON.stringify({ error: 'Não autorizado.' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json() as Record<string, unknown>;
  } catch {
    return new Response(JSON.stringify({ error: 'JSON inválido.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  if (!body.slug || !body.title || !body.content || !body.category) {
    return new Response(JSON.stringify({ error: 'Campos obrigatórios: slug, title, content, category.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const { id } = await createPost(cfEnv.DB, body as Parameters<typeof createPost>[1]);
    return new Response(JSON.stringify({ success: true, id }), { status: 201, headers: { 'Content-Type': 'application/json' } });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('UNIQUE')) {
      return new Response(JSON.stringify({ error: 'Já existe um post com esse slug.' }), { status: 409, headers: { 'Content-Type': 'application/json' } });
    }
    console.error('[admin/blog/posts POST] Error:', err);
    return new Response(JSON.stringify({ error: 'Erro interno.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};
