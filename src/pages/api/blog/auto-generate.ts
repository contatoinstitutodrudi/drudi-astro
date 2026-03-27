// POST /api/blog/auto-generate — endpoint para tarefa agendada da Manus
// Protegido por CRON_SECRET (não requer JWT de admin)
import { env } from "cloudflare:workers";
import type { APIRoute } from 'astro';
import { generateArticleWithGemini, getAuthorForCategory, TOPIC_BANK } from '../../../lib/blog-ai';
import { createPost, listAllPosts } from '../../../lib/blog-db';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const cfEnv = env as unknown as Env;

  // Verificar chave secreta do cron
  const cronSecret = (cfEnv as unknown as Record<string, string>)['CRON_SECRET'];
  const authHeader = request.headers.get('Authorization') ?? '';
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return new Response(JSON.stringify({ error: 'Não autorizado.' }), {
      status: 401, headers: { 'Content-Type': 'application/json' },
    });
  }

  const geminiKey = (cfEnv as unknown as Record<string, string>)['GEMINI_API_KEY'];
  if (!geminiKey) {
    return new Response(JSON.stringify({ error: 'GEMINI_API_KEY não configurada.' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }

  // Verificar qual categoria e tópico usar (rotação)
  let body: { topic?: string; category?: string } = {};
  try {
    body = await request.json() as typeof body;
  } catch { /* sem body é ok */ }

  let topic = body.topic ?? '';
  let category = body.category ?? '';

  // Se não especificado, selecionar automaticamente
  if (!topic || !category) {
    // Buscar últimos 10 posts para evitar repetição
    const recentPosts = await listAllPosts(cfEnv.DB, { limit: 10 });
    const recentCategories = recentPosts.map(p => p.category);
    const usedTitles = recentPosts.map(p => p.title.toLowerCase());

    // Rotação: categorias menos usadas recentemente
    const categories = ['Catarata', 'Ceratocone', 'Glaucoma', 'Retina', 'Estrabismo'];
    const categoryCounts: Record<string, number> = {};
    for (const cat of categories) {
      categoryCounts[cat] = recentCategories.filter(c => c === cat).length;
    }

    // Ordenar por menos usada
    const sortedCats = categories.sort((a, b) => categoryCounts[a] - categoryCounts[b]);

    for (const cat of sortedCats) {
      const topics = TOPIC_BANK[cat] ?? [];
      const available = topics.filter(t => !usedTitles.some(u => u.includes(t.toLowerCase().substring(0, 20))));
      if (available.length > 0) {
        category = cat;
        topic = available[0];
        break;
      }
    }
  }

  if (!topic || !category) {
    return new Response(JSON.stringify({ error: 'Nenhum tópico disponível para geração.' }), {
      status: 422, headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    console.log(`[auto-generate] Gerando artigo: "${topic}" (${category})`);

    const article = await generateArticleWithGemini(geminiKey, topic, category);
    const authorInfo = getAuthorForCategory(category);

    // Garantir slug único
    const timestamp = Date.now();
    const slug = article.slug || `${category.toLowerCase()}-${timestamp}`;

    const { id } = await createPost(cfEnv.DB, {
      slug,
      title: article.title,
      excerpt: article.excerpt,
      category,
      keywords: article.keywords,
      content: article.content,
      image_url: '',
      author: authorInfo.author,
      author_crm: authorInfo.crm,
      author_img: authorInfo.img,
      read_time: article.read_time,
      status: 'published', // publicar automaticamente
      featured: 0,
      related_slugs: [],
      meta_title: article.meta_title,
      meta_description: article.meta_description,
      schema_faq: article.schema_faq,
      generated_by_ai: 1,
    });

    console.log(`[auto-generate] ✅ Artigo criado: ID ${id}, slug: ${slug}`);

    return new Response(JSON.stringify({
      success: true,
      id,
      slug,
      title: article.title,
      category,
      topic,
    }), { headers: { 'Content-Type': 'application/json' } });

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[auto-generate] ❌ Error:', msg);
    return new Response(JSON.stringify({ error: msg, topic, category }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }
};
