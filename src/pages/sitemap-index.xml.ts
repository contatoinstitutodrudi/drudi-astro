/**
 * Sitemap index dinâmico que aponta para o sitemap estático (gerado pelo @astrojs/sitemap)
 * e para o sitemap dinâmico do blog.
 * URL: /sitemap-index.xml (sobrescreve o gerado pelo plugin)
 */
import type { APIRoute } from 'astro';

export const prerender = false;

const SITE = 'https://institutodrudiealmeida.com.br';
const now = new Date().toISOString().split('T')[0];

export const GET: APIRoute = async () => {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${SITE}/sitemap-0.xml</loc>
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
