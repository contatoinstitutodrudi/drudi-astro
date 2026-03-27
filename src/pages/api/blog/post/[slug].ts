// GET /api/blog/post/[slug]
import { env } from "cloudflare:workers";
import type { APIRoute } from 'astro';
import { getPostBySlug, getRelatedPosts } from '../../../../lib/blog-db';

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  const cfEnv = env as unknown as Env;
  const { slug } = params;

  if (!slug) {
    return new Response(JSON.stringify({ error: 'Slug obrigatório.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const post = await getPostBySlug(cfEnv.DB, slug);
    if (!post) {
      return new Response(JSON.stringify({ error: 'Post não encontrado.' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const related = await getRelatedPosts(cfEnv.DB, post.category, slug, 3);

    return new Response(JSON.stringify({ post, related }), {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=600' },
    });
  } catch (err) {
    console.error('[blog/post/slug] Error:', err);
    return new Response(JSON.stringify({ error: 'Erro interno.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
