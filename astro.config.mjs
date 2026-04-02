// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  trailingSlash: 'always',
  adapter: cloudflare({
    platformProxy: { enabled: false },
    imageService: 'passthrough',
    sessions: false,
  }),
  site: 'https://institutodrudiealmeida.com.br',
  integrations: [
    sitemap({
      // Excluir landing pages, admin, cancelar e 404 do sitemap
      filter: (page) => !page.includes('/lp/') && !page.includes('/admin/') && !page.includes('/cancelar') && !page.includes('/404'),
      // Posts de blog dinâmicos (prerender=false não são detectados automaticamente)
      customPages: [
        'https://institutodrudiealmeida.com.br/blog/injecao-antivegf-o-que-e',
        'https://institutodrudiealmeida.com.br/blog/crosslinking-ceratocone-sp',
        'https://institutodrudiealmeida.com.br/blog/lente-intraocular-monofocal-multifocal-trifocal',
        'https://institutodrudiealmeida.com.br/blog/cirurgia-catarata-convenio',
        'https://institutodrudiealmeida.com.br/blog/cirurgia-catarata-sp-preco',
        'https://institutodrudiealmeida.com.br/blog/glaucoma-tem-cura',
        'https://institutodrudiealmeida.com.br/blog/tratamento-glaucoma-sp',
        'https://institutodrudiealmeida.com.br/blog/cirurgia-estrabismo-adultos',
        'https://institutodrudiealmeida.com.br/blog/cirurgia-estrabismo-sp',
        'https://institutodrudiealmeida.com.br/blog/coriorretinopatia-serosa-central',
        'https://institutodrudiealmeida.com.br/perguntas-frequentes/',
        'https://institutodrudiealmeida.com.br/oftalmologia-humanitaria/',
      ],
      serialize(item) {
        const today = new Date().toISOString().split('T')[0];
        // Home e institutos têm prioridade máxima
        if (item.url === 'https://institutodrudiealmeida.com.br/') {
          return { ...item, priority: 1.0, changefreq: 'weekly', lastmod: today };
        }
        if (item.url.includes('/instituto/')) {
          return { ...item, priority: 0.9, changefreq: 'monthly', lastmod: today };
        }
        if (item.url.includes('/medico/') || item.url.includes('/unidade/')) {
          return { ...item, priority: 0.8, changefreq: 'monthly', lastmod: today };
        }
        if (item.url.includes('/blog/')) {
          return { ...item, priority: 0.7, changefreq: 'yearly', lastmod: today };
        }
        if (item.url.includes('/perguntas-frequentes/')) {
          return { ...item, priority: 0.9, changefreq: 'monthly', lastmod: today };
        }
        if (item.url.includes('/oftalmologia-humanitaria/')) {
          return { ...item, priority: 0.8, changefreq: 'monthly', lastmod: today };
        }
        if (item.url.includes('/agendar')) {
          return { ...item, priority: 0.9, changefreq: 'monthly', lastmod: today };
        }
        return { ...item, priority: 0.6, changefreq: 'monthly', lastmod: today };
      },
    }),
    react(),
  ],
  vite: {
    plugins: [tailwindcss()],
    server: {
      allowedHosts: 'all',
    },
    ssr: {
      external: ['node:crypto'],
    },
  },
});
