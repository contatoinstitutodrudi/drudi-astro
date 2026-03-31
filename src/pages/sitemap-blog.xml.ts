/**
 * Sitemap dinâmico para artigos do blog armazenados no banco D1.
 * Gerado em tempo de execução (SSR) para incluir todos os posts publicados.
 * URL: /sitemap-blog.xml
 */
import { env } from 'cloudflare:workers';
import type { APIRoute } from 'astro';

export const prerender = false;

const SITE = 'https://institutodrudiealmeida.com.br';

export const GET: APIRoute = async () => {
  const cfEnv = env as unknown as Env;

  let slugs: { slug: string; updated_at: number }[] = [];

  try {
    const result = await cfEnv.DB.prepare(
      `SELECT slug, updated_at FROM blog_posts WHERE status = 'published' ORDER BY published_at DESC`
    ).all<{ slug: string; updated_at: number }>();
    slugs = result.results ?? [];
  } catch (err) {
    console.error('[sitemap-blog] Erro ao buscar slugs do D1:', err);
  }

  const urls = slugs
    .map(({ slug, updated_at }) => {
      const lastmod = updated_at
        ? new Date(updated_at * 1000).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];
      return `  <url>
    <loc>${SITE}/blog/${slug}/</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
};
