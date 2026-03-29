// POST /api/admin/blog/generate — gerar artigo com Gemini
import { env } from "cloudflare:workers";
import type { APIRoute } from 'astro';
import { generateArticleWithGemini, getAuthorForCategory } from '../../../../lib/blog-ai';
import { generateCoverImage } from '../../../../lib/blog-image';
import { createPost, getPostBySlugAdmin } from '../../../../lib/blog-db';
import { verifyAdminToken, getAdminTokenFromRequest } from '../../../../lib/auth';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const cfEnv = env as unknown as Env;
  const token = getAdminTokenFromRequest(request);
  if (!token || !(await verifyAdminToken(cfEnv.ADMIN_JWT_SECRET, token))) {
    return new Response(JSON.stringify({ error: 'Não autorizado.' }), {
      status: 401, headers: { 'Content-Type': 'application/json' },
    });
  }

  let body: { topic: string; category: string; publish?: boolean };
  try {
    body = await request.json() as typeof body;
  } catch {
    return new Response(JSON.stringify({ error: 'JSON inválido.' }), {
      status: 400, headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!body.topic || !body.category) {
    return new Response(JSON.stringify({ error: 'Campos obrigatórios: topic, category.' }), {
      status: 400, headers: { 'Content-Type': 'application/json' },
    });
  }

  const geminiKey = (cfEnv as unknown as Record<string, string>)['GEMINI_API_KEY'];
  if (!geminiKey) {
    return new Response(JSON.stringify({ error: 'GEMINI_API_KEY não configurada.' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Gerar artigo com Gemini
    const article = await generateArticleWithGemini(geminiKey, body.topic, body.category);

    // Verificar slug duplicado
    const existing = await getPostBySlugAdmin(cfEnv.DB, article.slug);
    if (existing) {
      article.slug = `${article.slug}-${Date.now()}`;
    }

    const authorInfo = getAuthorForCategory(body.category);

    // Gerar imagem de capa via Cloudflare Workers AI (SDXL)
    let imageUrl = '';
    const aiBinding = (cfEnv as unknown as Record<string, Ai>)['AI'];
    if (aiBinding) {
      try {
        const imageBuffer = await generateCoverImage(cfEnv, body.category, article.title);
        if (imageBuffer) {
          const kv = (cfEnv as unknown as Record<string, KVNamespace>)['SESSION'];
          if (kv) {
            const kvKey = `blog-img:${article.slug}`;
            await kv.put(kvKey, imageBuffer, {
              expirationTtl: 60 * 60 * 24 * 365,
              metadata: { contentType: 'image/png', slug: article.slug },
            });
            imageUrl = `/api/blog/image/${encodeURIComponent(article.slug)}`;
          }
        }
      } catch (imgErr) {
        console.error('[admin/blog/generate] ⚠️ Falha ao gerar imagem:', imgErr);
      }
    }

    // Salvar no banco
    const { id } = await createPost(cfEnv.DB, {
      slug: article.slug,
      title: article.title,
      excerpt: article.excerpt,
      category: body.category,
      keywords: article.keywords,
      content: article.content,
      image_url: imageUrl,
      author: authorInfo.author,
      author_crm: authorInfo.crm,
      author_img: authorInfo.img,
      read_time: article.read_time,
      status: body.publish ? 'published' : 'draft',
      featured: 0,
      related_slugs: [],
      meta_title: article.meta_title,
      meta_description: article.meta_description,
      schema_faq: article.schema_faq,
      generated_by_ai: 1,
    });

    return new Response(JSON.stringify({
      success: true,
      id,
      slug: article.slug,
      title: article.title,
      status: body.publish ? 'published' : 'draft',
    }), { headers: { 'Content-Type': 'application/json' } });

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[admin/blog/generate] Error:', msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }
};
