/**
 * Sitemap dinâmico para todas as páginas estáticas do site.
 * Substitui o sitemap-0.xml gerado pelo @astrojs/sitemap (que conflitava com o Cloudflare Workers).
 * URL: /sitemap-pages.xml
 */
import type { APIRoute } from 'astro';

export const prerender = false;

const SITE = 'https://institutodrudiealmeida.com.br';

const PAGES = [
  // Home
  { url: '/',                                        priority: '1.0', changefreq: 'weekly' },
  // Institutos
  { url: '/instituto/catarata/',                     priority: '0.9', changefreq: 'monthly' },
  { url: '/instituto/ceratocone/',                   priority: '0.9', changefreq: 'monthly' },
  { url: '/instituto/glaucoma/',                     priority: '0.9', changefreq: 'monthly' },
  { url: '/instituto/retina/',                       priority: '0.9', changefreq: 'monthly' },
  { url: '/instituto/estrabismo/',                   priority: '0.9', changefreq: 'monthly' },
  // Médicos
  { url: '/medico/dr-fernando-drudi/',               priority: '0.8', changefreq: 'monthly' },
  { url: '/medico/dra-priscilla-almeida/',           priority: '0.8', changefreq: 'monthly' },
  // Unidades
  { url: '/unidade/guarulhos/',                      priority: '0.8', changefreq: 'monthly' },
  { url: '/unidade/lapa/',                           priority: '0.8', changefreq: 'monthly' },
  { url: '/unidade/santana/',                        priority: '0.8', changefreq: 'monthly' },
  { url: '/unidade/sao-miguel/',                     priority: '0.8', changefreq: 'monthly' },
  { url: '/unidade/tatuape/',                        priority: '0.8', changefreq: 'monthly' },
  // Guias
  { url: '/guia/',                                   priority: '0.9', changefreq: 'monthly' },
  { url: '/guia/cirurgia-catarata-sp/',              priority: '0.9', changefreq: 'monthly' },
  { url: '/guia/ceratocone-tratamento-sp/',          priority: '0.9', changefreq: 'monthly' },
  { url: '/guia/glaucoma-tratamento-sp/',            priority: '0.9', changefreq: 'monthly' },
  { url: '/guia/retina-retinopatia-diabetica-sp/',   priority: '0.9', changefreq: 'monthly' },
  { url: '/guia/estrabismo-cirurgia-sp/',            priority: '0.9', changefreq: 'monthly' },
  // Páginas principais
  { url: '/sobre/',                                  priority: '0.7', changefreq: 'monthly' },
  { url: '/agendar/',                                priority: '0.9', changefreq: 'monthly' },
  { url: '/contato/',                                priority: '0.7', changefreq: 'monthly' },
  { url: '/convenios/',                              priority: '0.7', changefreq: 'monthly' },
  { url: '/tecnologia/',                             priority: '0.7', changefreq: 'monthly' },
  { url: '/perguntas-frequentes/',                   priority: '0.9', changefreq: 'monthly' },
  { url: '/oftalmologia-humanitaria/',               priority: '0.8', changefreq: 'monthly' },
  { url: '/arte-e-visao/',                           priority: '0.6', changefreq: 'monthly' },
  { url: '/resultados/',                             priority: '0.6', changefreq: 'monthly' },
  { url: '/blog/',                                   priority: '0.8', changefreq: 'weekly'  },
  // Portal de lentes
  { url: '/portal-de-lentes/',                       priority: '0.6', changefreq: 'monthly' },
  { url: '/portal-de-lentes/calculadora/',           priority: '0.6', changefreq: 'monthly' },
  { url: '/portal-de-lentes/catalogo/',              priority: '0.6', changefreq: 'monthly' },
  { url: '/portal-de-lentes/comparar/',              priority: '0.6', changefreq: 'monthly' },
  { url: '/portal-de-lentes/questionario/',          priority: '0.6', changefreq: 'monthly' },
  // Legais
  { url: '/politica-de-privacidade/',                priority: '0.4', changefreq: 'yearly'  },
  { url: '/lgpd/',                                   priority: '0.4', changefreq: 'yearly'  },
];

export const GET: APIRoute = async () => {
  const today = new Date().toISOString().split('T')[0];

  const urls = PAGES.map(({ url, priority, changefreq }) => `  <url>
    <loc>${SITE}${url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`).join('\n');

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
