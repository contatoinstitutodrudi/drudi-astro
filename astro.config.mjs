// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  site: 'https://institutodrudiealmeida.com.br',
  integrations: [
    sitemap({
      // Excluir landing pages (/lp/) do sitemap — evitar conteúdo duplicado
      filter: (page) => !page.includes('/lp/'),
      // Definir prioridades e frequência de atualização
      customPages: [],
      serialize(item) {
        // Home e institutos têm prioridade máxima
        if (item.url === 'https://institutodrudiealmeida.com.br/') {
          return { ...item, priority: 1.0, changefreq: 'weekly' };
        }
        if (item.url.includes('/instituto/')) {
          return { ...item, priority: 0.9, changefreq: 'monthly' };
        }
        if (item.url.includes('/medico/') || item.url.includes('/unidade/')) {
          return { ...item, priority: 0.8, changefreq: 'monthly' };
        }
        if (item.url.includes('/blog/')) {
          return { ...item, priority: 0.7, changefreq: 'yearly' };
        }
        return { ...item, priority: 0.6, changefreq: 'monthly' };
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
    server: {
      allowedHosts: 'all'
    }
  },
});
