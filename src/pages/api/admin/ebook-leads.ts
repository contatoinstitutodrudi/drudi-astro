// GET /api/admin/ebook-leads — Listar leads de e-books
// GET /api/admin/ebook-leads?export=csv — Exportar CSV
import { env } from 'cloudflare:workers';
import type { APIRoute } from 'astro';
import { verifyAdminToken, getAdminTokenFromRequest } from '../../../lib/auth';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const cfEnv = env as unknown as Env;
  const token = getAdminTokenFromRequest(request);
  if (!token || !(await verifyAdminToken(cfEnv.ADMIN_JWT_SECRET, token))) {
    return new Response(JSON.stringify({ error: 'Não autorizado.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const url = new URL(request.url);
  const exportCsv = url.searchParams.get('export') === 'csv';
  const filterSlug = url.searchParams.get('slug') || '';
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const limit = exportCsv ? 9999 : 50;
  const offset = (page - 1) * limit;

  try {
    const db = cfEnv.DB;

    // Garantir que a tabela existe
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS ebook_leads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        ebook_slug TEXT NOT NULL,
        ebook_title TEXT NOT NULL,
        lgpd_consent INTEGER NOT NULL DEFAULT 1,
        email_sent INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `).run();

    // Query com filtro opcional por slug
    let query = 'SELECT * FROM ebook_leads';
    let countQuery = 'SELECT COUNT(*) as total FROM ebook_leads';
    const params: string[] = [];

    if (filterSlug) {
      query += ' WHERE ebook_slug = ?';
      countQuery += ' WHERE ebook_slug = ?';
      params.push(filterSlug);
    }

    query += ' ORDER BY created_at DESC';

    if (!exportCsv) {
      query += ` LIMIT ${limit} OFFSET ${offset}`;
    }

    const [rows, countResult] = await Promise.all([
      params.length
        ? db.prepare(query).bind(...params).all()
        : db.prepare(query).all(),
      params.length
        ? db.prepare(countQuery).bind(...params).first<{ total: number }>()
        : db.prepare(countQuery).first<{ total: number }>(),
    ]);

    const leads = rows.results as Array<{
      id: number;
      name: string;
      email: string;
      phone: string;
      ebook_slug: string;
      ebook_title: string;
      lgpd_consent: number;
      email_sent: number;
      created_at: string;
    }>;

    const total = countResult?.total ?? 0;

    // Exportar CSV
    if (exportCsv) {
      const header = 'ID,Nome,E-mail,Telefone,E-book,Título,LGPD,E-mail Enviado,Data\n';
      const rows_csv = leads.map(l =>
        [
          l.id,
          `"${l.name.replace(/"/g, '""')}"`,
          l.email,
          l.phone,
          l.ebook_slug,
          `"${(l.ebook_title || '').replace(/"/g, '""')}"`,
          l.lgpd_consent ? 'Sim' : 'Não',
          l.email_sent ? 'Sim' : 'Não',
          l.created_at,
        ].join(',')
      ).join('\n');

      const bom = '\uFEFF'; // BOM para Excel reconhecer UTF-8
      return new Response(bom + header + rows_csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="leads-ebooks-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    // Estatísticas por e-book
    const statsResult = await db.prepare(`
      SELECT ebook_slug, ebook_title, COUNT(*) as total,
             SUM(email_sent) as emails_enviados
      FROM ebook_leads
      GROUP BY ebook_slug
      ORDER BY total DESC
    `).all();

    return new Response(JSON.stringify({
      leads,
      total,
      page,
      pages: Math.ceil(total / limit),
      stats: statsResult.results,
    }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('[admin/ebook-leads] Error:', err);
    return new Response(JSON.stringify({ error: 'Erro interno.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
