// POST /api/admin/blog/generate-images — gerar imagens para posts sem imagem
// Processa em lotes para não exceder o tempo limite do Worker (30s)
import { env } from "cloudflare:workers";
import type { APIRoute } from 'astro';
import { listAllPosts, updatePostImage } from '../../../../lib/blog-db';
import { generateCoverImage } from '../../../../lib/blog-image';
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

  const aiBinding = (cfEnv as unknown as Record<string, Ai>)['AI'];
  if (!aiBinding) {
    return new Response(JSON.stringify({ error: 'Binding AI não disponível.' }), {
      status: 503, headers: { 'Content-Type': 'application/json' },
    });
  }

  const kv = (cfEnv as unknown as Record<string, KVNamespace>)['SESSION'];
  if (!kv) {
    return new Response(JSON.stringify({ error: 'KV SESSION não disponível.' }), {
      status: 503, headers: { 'Content-Type': 'application/json' },
    });
  }

  // Parâmetros opcionais
  let body: { limit?: number; slug?: string; force?: boolean } = {};
  try { body = await request.json() as typeof body; } catch { /* ok */ }

  const batchLimit = Math.min(body.limit ?? 3, 5); // máx 5 por vez

  try {
    // Buscar posts sem imagem
    let postsToProcess;
    if (body.slug) {
      // Processar um slug específico (sempre processa, independente de ter imagem)
      const allPosts = await listAllPosts(cfEnv.DB, { limit: 200 });
      postsToProcess = allPosts.filter(p => p.slug === body.slug);
    } else if (body.force) {
      // Forçar regeneração de posts com imagens externas (não /api/blog/image/ nem /images/)
      const allPosts = await listAllPosts(cfEnv.DB, { limit: 200 });
      postsToProcess = allPosts.filter(p => {
        const img = p.image_url || '';
        return !img.startsWith('/api/blog/image/') && !img.startsWith('/images/');
      }).slice(0, batchLimit);
    } else {
      // Buscar posts sem imagem
      const allPosts = await listAllPosts(cfEnv.DB, { limit: 200 });
      postsToProcess = allPosts.filter(p => !p.image_url || p.image_url === '').slice(0, batchLimit);
    }

    if (postsToProcess.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: 'Nenhum post sem imagem encontrado.',
        processed: 0,
      }), { headers: { 'Content-Type': 'application/json' } });
    }

    const results: Array<{ slug: string; title: string; success: boolean; imageUrl?: string; error?: string }> = [];

    for (const post of postsToProcess) {
      try {
        console.log(`[generate-images] Gerando imagem para: "${post.title}" (${post.category})`);

        const imageBuffer = await generateCoverImage(cfEnv, post.category, post.title);
        if (!imageBuffer) {
          results.push({ slug: post.slug, title: post.title, success: false, error: 'Buffer vazio' });
          continue;
        }

        // Salvar no KV
        const kvKey = `blog-img:${post.slug}`;
        await kv.put(kvKey, imageBuffer, {
          expirationTtl: 60 * 60 * 24 * 365,
          metadata: { contentType: 'image/png', slug: post.slug },
        });

        const imageUrl = `/api/blog/image/${encodeURIComponent(post.slug)}`;

        // Atualizar no banco
        await updatePostImage(cfEnv.DB, post.slug, imageUrl);

        results.push({ slug: post.slug, title: post.title, success: true, imageUrl });
        console.log(`[generate-images] ✅ Imagem gerada: ${imageUrl}`);

      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`[generate-images] ❌ Erro em "${post.slug}":`, msg);
        results.push({ slug: post.slug, title: post.title, success: false, error: msg });
      }
    }

    const successCount = results.filter(r => r.success).length;

    return new Response(JSON.stringify({
      success: true,
      processed: results.length,
      succeeded: successCount,
      failed: results.length - successCount,
      results,
    }), { headers: { 'Content-Type': 'application/json' } });

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[generate-images] ❌ Erro geral:', msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }
};
