-- ============================================================
-- Drudi e Almeida — Blog Schema D1
-- ============================================================

CREATE TABLE IF NOT EXISTS blog_posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Saúde Ocular',
  -- category: Catarata | Ceratocone | Glaucoma | Retina | Estrabismo | Saúde Ocular
  keywords TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL,            -- HTML completo do artigo
  image_url TEXT NOT NULL DEFAULT '',
  author TEXT NOT NULL DEFAULT 'Dr. Fernando Macei Drudi',
  author_crm TEXT NOT NULL DEFAULT 'CRM-SP 139.300',
  author_img TEXT NOT NULL DEFAULT '/images/dr-fernando-800w.webp',
  read_time TEXT NOT NULL DEFAULT '8 min',
  status TEXT NOT NULL DEFAULT 'draft',  -- draft | published
  featured INTEGER NOT NULL DEFAULT 0,   -- 0 | 1
  related_slugs TEXT NOT NULL DEFAULT '[]', -- JSON array de slugs relacionados
  meta_title TEXT,                       -- título SEO (opcional, usa title se vazio)
  meta_description TEXT,                 -- meta description SEO
  schema_faq TEXT,                       -- JSON array de {q, a} para FAQ Schema
  generated_by_ai INTEGER NOT NULL DEFAULT 0, -- 0 = manual, 1 = gerado por IA
  published_at INTEGER,                  -- unix timestamp
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_blog_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_published_at ON blog_posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_featured ON blog_posts(featured);

-- ============================================================
-- Tabela de fila de geração de artigos por IA
-- ============================================================
CREATE TABLE IF NOT EXISTS blog_ai_queue (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  topic TEXT NOT NULL,        -- tema/palavra-chave a ser gerado
  category TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending | processing | done | error
  post_id INTEGER,            -- FK para blog_posts após geração
  error_msg TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  processed_at INTEGER
);
