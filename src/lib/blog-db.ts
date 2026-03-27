// ============================================================
// Drudi e Almeida — Blog DB Helpers (Cloudflare D1)
// ============================================================

export interface BlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  keywords: string;
  content: string;
  image_url: string;
  author: string;
  author_crm: string;
  author_img: string;
  read_time: string;
  status: 'draft' | 'published';
  featured: number;
  related_slugs: string; // JSON string
  meta_title: string | null;
  meta_description: string | null;
  schema_faq: string | null; // JSON string [{q, a}]
  generated_by_ai: number;
  published_at: number | null;
  created_at: number;
  updated_at: number;
}

export interface BlogPostInput {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  keywords: string;
  content: string;
  image_url?: string;
  author?: string;
  author_crm?: string;
  author_img?: string;
  read_time?: string;
  status?: 'draft' | 'published';
  featured?: number;
  related_slugs?: string[];
  meta_title?: string;
  meta_description?: string;
  schema_faq?: Array<{ q: string; a: string }>;
  generated_by_ai?: number;
}

// ─── Listar posts publicados (para o site público) ───────────────────────────
export async function listPublishedPosts(
  db: D1Database,
  opts: { category?: string; limit?: number; offset?: number; featured?: boolean } = {}
): Promise<BlogPost[]> {
  const { category, limit = 20, offset = 0, featured } = opts;
  let sql = `SELECT * FROM blog_posts WHERE status = 'published'`;
  const params: unknown[] = [];

  if (category) {
    sql += ` AND category = ?`;
    params.push(category);
  }
  if (featured !== undefined) {
    sql += ` AND featured = ?`;
    params.push(featured ? 1 : 0);
  }

  sql += ` ORDER BY published_at DESC LIMIT ? OFFSET ?`;
  params.push(limit, offset);

  const result = await db.prepare(sql).bind(...params).all<BlogPost>();
  return result.results ?? [];
}

// ─── Buscar post por slug (público) ─────────────────────────────────────────
export async function getPostBySlug(db: D1Database, slug: string): Promise<BlogPost | null> {
  const result = await db.prepare(
    `SELECT * FROM blog_posts WHERE slug = ? AND status = 'published' LIMIT 1`
  ).bind(slug).first<BlogPost>();
  return result ?? null;
}

// ─── Buscar post por slug (admin — qualquer status) ──────────────────────────
export async function getPostBySlugAdmin(db: D1Database, slug: string): Promise<BlogPost | null> {
  const result = await db.prepare(
    `SELECT * FROM blog_posts WHERE slug = ? LIMIT 1`
  ).bind(slug).first<BlogPost>();
  return result ?? null;
}

// ─── Listar todos os posts (admin) ───────────────────────────────────────────
export async function listAllPosts(
  db: D1Database,
  opts: { status?: string; category?: string; limit?: number; offset?: number } = {}
): Promise<BlogPost[]> {
  const { status, category, limit = 50, offset = 0 } = opts;
  let sql = `SELECT id, slug, title, excerpt, category, status, featured, generated_by_ai, published_at, created_at, read_time, image_url FROM blog_posts WHERE 1=1`;
  const params: unknown[] = [];

  if (status && status !== 'all') {
    sql += ` AND status = ?`;
    params.push(status);
  }
  if (category && category !== 'all') {
    sql += ` AND category = ?`;
    params.push(category);
  }

  sql += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
  params.push(limit, offset);

  const result = await db.prepare(sql).bind(...params).all<BlogPost>();
  return result.results ?? [];
}

// ─── Criar post ──────────────────────────────────────────────────────────────
export async function createPost(db: D1Database, input: BlogPostInput): Promise<{ id: number }> {
  const now = Math.floor(Date.now() / 1000);
  const publishedAt = input.status === 'published' ? now : null;

  const result = await db.prepare(`
    INSERT INTO blog_posts (
      slug, title, excerpt, category, keywords, content, image_url,
      author, author_crm, author_img, read_time, status, featured,
      related_slugs, meta_title, meta_description, schema_faq,
      generated_by_ai, published_at, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    input.slug,
    input.title,
    input.excerpt,
    input.category,
    input.keywords,
    input.content,
    input.image_url ?? '',
    input.author ?? 'Dr. Fernando Macei Drudi',
    input.author_crm ?? 'CRM-SP 139.300',
    input.author_img ?? '/images/dr-fernando-800w.webp',
    input.read_time ?? '8 min',
    input.status ?? 'draft',
    input.featured ?? 0,
    JSON.stringify(input.related_slugs ?? []),
    input.meta_title ?? null,
    input.meta_description ?? null,
    input.schema_faq ? JSON.stringify(input.schema_faq) : null,
    input.generated_by_ai ?? 0,
    publishedAt,
    now,
    now
  ).run();

  return { id: result.meta.last_row_id as number };
}

// ─── Atualizar post ──────────────────────────────────────────────────────────
export async function updatePost(
  db: D1Database,
  id: number,
  input: Partial<BlogPostInput>
): Promise<void> {
  const now = Math.floor(Date.now() / 1000);
  const fields: string[] = [];
  const params: unknown[] = [];

  const map: Record<string, unknown> = {
    title: input.title,
    excerpt: input.excerpt,
    category: input.category,
    keywords: input.keywords,
    content: input.content,
    image_url: input.image_url,
    author: input.author,
    author_crm: input.author_crm,
    author_img: input.author_img,
    read_time: input.read_time,
    status: input.status,
    featured: input.featured,
    meta_title: input.meta_title,
    meta_description: input.meta_description,
    generated_by_ai: input.generated_by_ai,
  };

  for (const [key, val] of Object.entries(map)) {
    if (val !== undefined) {
      fields.push(`${key} = ?`);
      params.push(val);
    }
  }

  if (input.related_slugs !== undefined) {
    fields.push(`related_slugs = ?`);
    params.push(JSON.stringify(input.related_slugs));
  }
  if (input.schema_faq !== undefined) {
    fields.push(`schema_faq = ?`);
    params.push(JSON.stringify(input.schema_faq));
  }

  // Se publicando, definir published_at
  if (input.status === 'published') {
    fields.push(`published_at = COALESCE(published_at, ?)`);
    params.push(now);
  }

  fields.push(`updated_at = ?`);
  params.push(now);
  params.push(id);

  await db.prepare(`UPDATE blog_posts SET ${fields.join(', ')} WHERE id = ?`)
    .bind(...params).run();
}

// ─── Deletar post ────────────────────────────────────────────────────────────
export async function deletePost(db: D1Database, id: number): Promise<void> {
  await db.prepare(`DELETE FROM blog_posts WHERE id = ?`).bind(id).run();
}

// ─── Contar posts por categoria (para sidebar) ───────────────────────────────
export async function countByCategory(db: D1Database): Promise<Record<string, number>> {
  const result = await db.prepare(
    `SELECT category, COUNT(*) as count FROM blog_posts WHERE status = 'published' GROUP BY category`
  ).all<{ category: string; count: number }>();

  const counts: Record<string, number> = {};
  for (const row of result.results ?? []) {
    counts[row.category] = row.count;
  }
  return counts;
}

// ─── Posts relacionados por categoria ────────────────────────────────────────
export async function getRelatedPosts(
  db: D1Database,
  category: string,
  excludeSlug: string,
  limit = 3
): Promise<BlogPost[]> {
  const result = await db.prepare(
    `SELECT id, slug, title, excerpt, category, image_url, published_at, read_time
     FROM blog_posts
     WHERE status = 'published' AND category = ? AND slug != ?
     ORDER BY published_at DESC LIMIT ?`
  ).bind(category, excludeSlug, limit).all<BlogPost>();
  return result.results ?? [];
}

// ─── Slugs de todos os posts publicados (para sitemap) ───────────────────────
export async function getAllPublishedSlugs(db: D1Database): Promise<{ slug: string; updated_at: number }[]> {
  const result = await db.prepare(
    `SELECT slug, updated_at FROM blog_posts WHERE status = 'published' ORDER BY published_at DESC`
  ).all<{ slug: string; updated_at: number }>();
  return result.results ?? [];
}

// ─── Fila de geração de IA ───────────────────────────────────────────────────
export async function addToAiQueue(
  db: D1Database,
  topic: string,
  category: string
): Promise<void> {
  await db.prepare(
    `INSERT INTO blog_ai_queue (topic, category, status, created_at) VALUES (?, ?, 'pending', ?)`
  ).bind(topic, category, Math.floor(Date.now() / 1000)).run();
}

export async function getPendingAiQueue(
  db: D1Database
): Promise<Array<{ id: number; topic: string; category: string }>> {
  const result = await db.prepare(
    `SELECT id, topic, category FROM blog_ai_queue WHERE status = 'pending' ORDER BY created_at ASC LIMIT 1`
  ).all<{ id: number; topic: string; category: string }>();
  return result.results ?? [];
}

export async function updateAiQueueStatus(
  db: D1Database,
  id: number,
  status: 'processing' | 'done' | 'error',
  postId?: number,
  errorMsg?: string
): Promise<void> {
  await db.prepare(
    `UPDATE blog_ai_queue SET status = ?, post_id = ?, error_msg = ?, processed_at = ? WHERE id = ?`
  ).bind(status, postId ?? null, errorMsg ?? null, Math.floor(Date.now() / 1000), id).run();
}
