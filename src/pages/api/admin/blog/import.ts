// POST /api/admin/blog/import — importar múltiplos posts de uma vez
import { env } from "cloudflare:workers";
import type { APIRoute } from 'astro';
import { createPost, getPostBySlugAdmin } from '../../../../lib/blog-db';
import { verifyAdminToken, getAdminTokenFromRequest } from '../../../../lib/auth';

export const prerender = false;

interface ImportPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  keywords?: string;
  content: string;
  image_url?: string;
  author?: string;
  author_crm?: string;
  author_img?: string;
  read_time?: string;
  status?: 'draft' | 'published';
  featured?: number;
  meta_title?: string;
  meta_description?: string;
  published_at?: number;
}

export const POST: APIRoute = async ({ request }) => {
  const cfEnv = env as unknown as Env;
  const token = getAdminTokenFromRequest(request);
  if (!token || !(await verifyAdminToken(cfEnv.ADMIN_JWT_SECRET, token))) {
    return new Response(JSON.stringify({ error: 'Não autorizado.' }), {
      status: 401, headers: { 'Content-Type': 'application/json' },
    });
  }

  let body: { posts: ImportPost[] };
  try {
    body = await request.json() as typeof body;
  } catch {
    return new Response(JSON.stringify({ error: 'JSON inválido.' }), {
      status: 400, headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!body.posts || !Array.isArray(body.posts)) {
    return new Response(JSON.stringify({ error: 'Campo obrigatório: posts (array).' }), {
      status: 400, headers: { 'Content-Type': 'application/json' },
    });
  }

  const results = { inserted: 0, skipped: 0, errors: [] as string[] };

  for (const post of body.posts) {
    if (!post.slug || !post.title || !post.content || !post.category) {
      results.errors.push(`Post inválido: ${post.slug || 'sem slug'}`);
      continue;
    }

    try {
      // Verificar se já existe
      const existing = await getPostBySlugAdmin(cfEnv.DB, post.slug);
      if (existing) {
        results.skipped++;
        continue;
      }

      await createPost(cfEnv.DB, {
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt || '',
        category: post.category,
        keywords: post.keywords || '',
        content: post.content,
        image_url: post.image_url || '',
        author: post.author || 'Dr. Fernando Macei Drudi',
        author_crm: post.author_crm || 'CRM-SP 139.300',
        author_img: post.author_img || '/images/dr-fernando-800w.webp',
        read_time: post.read_time || '8 min',
        status: post.status || 'published',
        featured: post.featured || 0,
        related_slugs: [],
        meta_title: post.meta_title || null,
        meta_description: post.meta_description || null,
        schema_faq: undefined,
        generated_by_ai: 0,
      });
      results.inserted++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('UNIQUE')) {
        results.skipped++;
      } else {
        results.errors.push(`${post.slug}: ${msg}`);
      }
    }
  }

  return new Response(JSON.stringify({
    success: true,
    inserted: results.inserted,
    skipped: results.skipped,
    errors: results.errors,
    total: body.posts.length,
  }), { headers: { 'Content-Type': 'application/json' } });
};
