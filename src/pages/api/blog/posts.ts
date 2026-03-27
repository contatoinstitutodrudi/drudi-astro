// GET /api/blog/posts?category=&limit=&offset=&featured=
import { env } from "cloudflare:workers";
import type { APIRoute } from 'astro';
import { listPublishedPosts } from '../../../lib/blog-db';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const cfEnv = env as unknown as Env;
  const url = new URL(request.url);
  const category = url.searchParams.get('category') ?? undefined;
  const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '20'), 100);
  const offset = parseInt(url.searchParams.get('offset') ?? '0');
  const featured = url.searchParams.get('featured') === '1' ? true : undefined;

  try {
    const posts = await listPublishedPosts(cfEnv.DB, { category, limit, offset, featured });
    return new Response(JSON.stringify(posts), {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=300' },
    });
  } catch (err) {
    console.error('[blog/posts] Error:', err);
    return new Response(JSON.stringify({ error: 'Erro interno.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
