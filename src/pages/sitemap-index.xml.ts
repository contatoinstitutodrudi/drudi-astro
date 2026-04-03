/**
 * Sitemap index dinâmico que aponta para o sitemap de páginas e o sitemap do blog.
 * URL: /sitemap-index.xml
 */
import type { APIRoute } from 'astro';

export const prerender = false;

const SITE = 'https://institutodrudiealmeida.com.br';

export const GET: APIRoute = async () => {
  // now calculado dentro do handler para evitar bug de Date no top-level do Cloudflare Workers
  const now = new Date().toISOString().split('T')[0];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${SITE}/sitemap-pages.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${SITE}/sitemap-blog.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
</sitemapindex>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
};
