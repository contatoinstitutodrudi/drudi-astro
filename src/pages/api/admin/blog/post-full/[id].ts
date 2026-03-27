// GET /api/admin/blog/post-full/[id] — buscar post completo por ID (para editor)
import { env } from "cloudflare:workers";
import type { APIRoute } from 'astro';
import { verifyAdminToken, getAdminTokenFromRequest } from '../../../../../lib/auth';

export const prerender = false;

export const GET: APIRoute = async ({ request, params }) => {
  const cfEnv = env as unknown as Env;
  const token = getAdminTokenFromRequest(request);
  if (!token || !(await verifyAdminToken(cfEnv.ADMIN_JWT_SECRET, token))) {
    return new Response(JSON.stringify({ error: 'Não autorizado.' }), {
      status: 401, headers: { 'Content-Type': 'application/json' },
    });
  }

  const id = parseInt(params.id ?? '0');
  if (!id) {
    return new Response(JSON.stringify({ error: 'ID inválido.' }), {
      status: 400, headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const post = await cfEnv.DB.prepare(
      `SELECT * FROM blog_posts WHERE id = ? LIMIT 1`
    ).bind(id).first();

    if (!post) {
      return new Response(JSON.stringify({ error: 'Post não encontrado.' }), {
        status: 404, headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(post), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[admin/blog/post-full] Error:', err);
    return new Response(JSON.stringify({ error: 'Erro interno.' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }
};
