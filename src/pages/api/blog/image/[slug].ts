// GET /api/blog/image/[slug] — servir imagem de capa gerada por AI armazenada no KV
import { env } from "cloudflare:workers";
import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  const cfEnv = env as unknown as Env;
  const slug = params.slug ?? '';

  if (!slug) {
    return new Response('Not found', { status: 404 });
  }

  // O KV de sessão é herdado — verificar se está disponível
  const kv = (cfEnv as unknown as Record<string, KVNamespace>)['SESSION'];
  if (!kv) {
    return new Response('KV not available', { status: 503 });
  }

  const key = `blog-img:${slug}`;
  const { value, metadata } = await kv.getWithMetadata<{ contentType: string }>(key, 'arrayBuffer');

  if (!value) {
    return new Response('Image not found', { status: 404 });
  }

  const contentType = metadata?.contentType ?? 'image/png';

  return new Response(value as ArrayBuffer, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
    },
  });
};
