// POST /api/admin/blog/fix-dates — corrige datas retroativas em lote
// Distribui artigos com intervalos de 2-3 dias, retroativamente a partir de hoje
import { env } from "cloudflare:workers";
import type { APIRoute } from 'astro';
import { verifyAdminToken, getAdminTokenFromRequest } from '../../../../lib/auth';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const cfEnv = env as unknown as Env;
  const token = getAdminTokenFromRequest(request);
  if (!token || !(await verifyAdminToken(cfEnv.ADMIN_JWT_SECRET, token))) {
    return new Response(JSON.stringify({ error: 'Não autorizado.' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    // Buscar todos os artigos ordenados por ID (ordem de criação)
    const result = await cfEnv.DB.prepare(
      `SELECT id FROM blog_posts ORDER BY id ASC`
    ).all<{ id: number }>();

    const posts = result.results ?? [];
    if (posts.length === 0) {
      return new Response(JSON.stringify({ success: true, updated: 0, message: 'Nenhum artigo encontrado.' }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Gerar datas retroativas com intervalos de 2-3 dias
    // Data do artigo mais recente = hoje
    // Data do artigo mais antigo = calculada retroativamente
    const now = Math.floor(Date.now() / 1000);
    const dates: number[] = [];
    let current = now;

    // Gerar datas do mais recente para o mais antigo
    for (let i = 0; i < posts.length; i++) {
      // Horário variado entre 7h e 19h (mais natural)
      const hourOffset = Math.floor(Math.random() * 43200) - 21600; // ±6h
      dates.push(current + hourOffset);

      // Intervalo de 2 ou 3 dias (alternado)
      const interval = i % 3 === 0 ? 3 * 86400 : 2 * 86400;
      current -= interval;
    }

    // Inverter para ter as datas em ordem crescente (mais antigo primeiro)
    dates.reverse();

    // Atualizar todos os artigos em lote
    let updated = 0;
    for (let i = 0; i < posts.length; i++) {
      const postId = posts[i].id;
      const newDate = dates[i];

      await cfEnv.DB.prepare(
        `UPDATE blog_posts SET published_at = ?, updated_at = ? WHERE id = ?`
      ).bind(newDate, Math.floor(Date.now() / 1000), postId).run();

      updated++;
    }

    // Calcular a data mais antiga para informar
    const oldestDate = new Date(dates[0] * 1000).toISOString().split('T')[0];
    const newestDate = new Date(dates[dates.length - 1] * 1000).toISOString().split('T')[0];

    return new Response(JSON.stringify({
      success: true,
      updated,
      oldest_date: oldestDate,
      newest_date: newestDate,
      message: `${updated} artigos atualizados com datas de ${oldestDate} a ${newestDate}`
    }), { headers: { 'Content-Type': 'application/json' } });

  } catch (err) {
    console.error('[admin/blog/fix-dates POST] Error:', err);
    return new Response(JSON.stringify({ error: 'Erro interno.', detail: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
