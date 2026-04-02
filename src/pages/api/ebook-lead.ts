// POST /api/ebook-lead
// Captura lead (nome, email, telefone) e envia o e-book por e-mail via Resend
import { env } from "cloudflare:workers";
import type { APIRoute } from 'astro';

export const prerender = false;

const FROM_EMAIL = 'Drudi e Almeida <no-reply@institutodrudiealmeida.com.br>';
const SITE_URL = 'https://institutodrudiealmeida.com.br';
const ADMIN_EMAIL = 'contato@drudiealmeida.com';

const EBOOK_MAP: Record<string, { title: string; pdfPath: string; color: string; description: string }> = {
  'catarata': {
    title: 'Guia Definitivo: Cirurgia de Catarata em São Paulo (2026)',
    pdfPath: '/ebooks/ebook-catarata-drudi-almeida.pdf',
    color: '#1a4a8a',
    description: 'Tipos de lentes intraoculares, técnicas cirúrgicas, convênios e recuperação pós-operatória.',
  },
  'ceratocone': {
    title: 'Guia Definitivo: Ceratocone — Diagnóstico e Tratamento (2026)',
    pdfPath: '/ebooks/ebook-ceratocone-drudi-almeida.pdf',
    color: '#1a6b4a',
    description: 'Diagnóstico com Pentacam, crosslinking, anel de Ferrara e lentes esclerais.',
  },
  'glaucoma': {
    title: 'Guia Definitivo: Glaucoma — Diagnóstico e Tratamento (2026)',
    pdfPath: '/ebooks/ebook-glaucoma-drudi-almeida.pdf',
    color: '#7a5a1a',
    description: 'Diagnóstico precoce, colírios hipotensores, laser SLT e cirurgia.',
  },
  'retina': {
    title: 'Guia Definitivo: Retina e Retinopatia Diabética (2026)',
    pdfPath: '/ebooks/ebook-retina-drudi-almeida.pdf',
    color: '#8a1a2a',
    description: 'Retinopatia diabética, DMRI, injeções anti-VEGF e vitrectomia.',
  },
  'estrabismo': {
    title: 'Guia Definitivo: Estrabismo — Diagnóstico e Cirurgia (2026)',
    pdfPath: '/ebooks/ebook-estrabismo-drudi-almeida.pdf',
    color: '#4a1a8a',
    description: 'Tipos de estrabismo, ambliopia, cirurgia e toxina botulínica.',
  },
};

function buildEbookEmail(name: string, ebook: typeof EBOOK_MAP[string], pdfUrl: string): string {
  const firstName = name.split(' ')[0];
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${ebook.title}</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f0;font-family:'Georgia',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f0;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#0d1f3c 0%,#1a3060 100%);padding:32px 40px;text-align:center;">
            <p style="margin:0 0 8px;color:#c9a961;font-size:11px;letter-spacing:3px;text-transform:uppercase;font-family:Arial,sans-serif;">DRUDI E ALMEIDA OFTALMOLOGIA</p>
            <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:400;line-height:1.3;">Seu e-book está pronto para download</h1>
          </td>
        </tr>

        <!-- Gold line -->
        <tr><td style="height:4px;background:linear-gradient(90deg,#c9a961,#e8d08a,#c9a961);"></td></tr>

        <!-- Content -->
        <tr>
          <td style="padding:40px;">
            <p style="margin:0 0 20px;color:#333;font-size:16px;line-height:1.6;">Olá, <strong>${firstName}</strong>!</p>
            <p style="margin:0 0 24px;color:#555;font-size:15px;line-height:1.7;">
              Obrigado por seu interesse. Seu guia foi elaborado com base nas mais recentes evidências científicas publicadas em <em>JAMA Ophthalmology</em>, <em>Lancet</em>, <em>New England Journal of Medicine</em> e outros periódicos de alto impacto.
            </p>

            <!-- Ebook card -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f6f0;border:1px solid #e8d08a;border-radius:10px;margin:0 0 28px;">
              <tr>
                <td style="padding:24px;">
                  <p style="margin:0 0 4px;color:#c9a961;font-size:10px;letter-spacing:2px;text-transform:uppercase;font-family:Arial,sans-serif;">E-BOOK GRATUITO</p>
                  <h2 style="margin:0 0 8px;color:#0d1f3c;font-size:17px;line-height:1.4;">${ebook.title}</h2>
                  <p style="margin:0 0 20px;color:#666;font-size:13px;line-height:1.6;">${ebook.description}</p>
                  <a href="${pdfUrl}" style="display:inline-block;background:#0d1f3c;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:6px;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;letter-spacing:0.5px;">
                    ⬇ Baixar o Guia em PDF
                  </a>
                </td>
              </tr>
            </table>

            <p style="margin:0 0 16px;color:#555;font-size:14px;line-height:1.7;">
              Se tiver dúvidas sobre o conteúdo ou quiser agendar uma consulta com nossos especialistas, estamos à disposição.
            </p>

            <!-- CTA WhatsApp -->
            <table cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
              <tr>
                <td style="padding-right:12px;">
                  <a href="https://wa.me/5511916544653?text=Olá! Baixei o guia e gostaria de agendar uma consulta." style="display:inline-block;background:#25d366;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:6px;font-family:Arial,sans-serif;font-size:13px;font-weight:bold;">
                    💬 Falar pelo WhatsApp
                  </a>
                </td>
                <td>
                  <a href="tel:+551150268521" style="display:inline-block;background:#f0f0f0;color:#0d1f3c;text-decoration:none;padding:12px 24px;border-radius:6px;font-family:Arial,sans-serif;font-size:13px;font-weight:bold;">
                    📞 (11) 5026-8521
                  </a>
                </td>
              </tr>
            </table>

            <p style="margin:0;color:#888;font-size:12px;line-height:1.6;border-top:1px solid #eee;padding-top:20px;">
              Este e-mail foi enviado porque você solicitou o download do guia em <a href="${SITE_URL}" style="color:#c9a961;">${SITE_URL}</a>.<br>
              Em conformidade com a LGPD (Lei 13.709/2018), seus dados são utilizados exclusivamente para o envio deste material e comunicações relacionadas à sua saúde ocular. Você pode solicitar a exclusão dos seus dados a qualquer momento pelo e-mail <a href="mailto:${ADMIN_EMAIL}" style="color:#c9a961;">${ADMIN_EMAIL}</a>.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#0d1f3c;padding:20px 40px;text-align:center;">
            <p style="margin:0;color:#c9a961;font-size:11px;letter-spacing:1px;">DRUDI E ALMEIDA OFTALMOLOGIA</p>
            <p style="margin:4px 0 0;color:#888;font-size:11px;">5 unidades em São Paulo e Guarulhos</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export const POST: APIRoute = async ({ request, locals }) => {
  const cfEnv = env as unknown as Env;

  let body: Record<string, unknown>;
  try {
    body = await request.json() as Record<string, unknown>;
  } catch {
    return new Response(JSON.stringify({ error: 'JSON inválido.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { name, email, phone, ebook_slug, lgpd_consent } = body as Record<string, string | boolean>;

  // Validações
  if (!name || !email || !phone || !ebook_slug) {
    return new Response(JSON.stringify({ error: 'Nome, e-mail, telefone e guia são obrigatórios.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))) {
    return new Response(JSON.stringify({ error: 'E-mail inválido.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  if (!lgpd_consent) {
    return new Response(JSON.stringify({ error: 'É necessário aceitar os termos de uso e a política de privacidade.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const ebook = EBOOK_MAP[String(ebook_slug)];
  if (!ebook) {
    return new Response(JSON.stringify({ error: 'Guia não encontrado.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const db = cfEnv.DB;

  try {
    // Criar tabela se não existir (auto-migration)
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

    // Salvar lead no banco
    await db.prepare(
      'INSERT INTO ebook_leads (name, email, phone, ebook_slug, ebook_title, lgpd_consent) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(
      String(name).trim(),
      String(email).trim().toLowerCase(),
      String(phone).trim(),
      String(ebook_slug),
      ebook.title,
      lgpd_consent ? 1 : 0
    ).run();

    // Enviar e-mail com o PDF via Resend
    const resendKey = (cfEnv as unknown as Record<string, string>).RESEND_API_KEY;
    const pdfUrl = `${SITE_URL}${ebook.pdfPath}`;
    const emailHtml = buildEbookEmail(String(name), ebook, pdfUrl);

    let emailSent = false;
    if (resendKey) {
      const emailResp = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          reply_to: ADMIN_EMAIL,
          to: [String(email).trim().toLowerCase()],
          subject: `📖 Seu guia está pronto: ${ebook.title}`,
          html: emailHtml,
        }),
      });
      emailSent = emailResp.ok;

      // Atualizar flag de e-mail enviado
      if (emailSent) {
        await db.prepare(
          'UPDATE ebook_leads SET email_sent = 1 WHERE email = ? AND ebook_slug = ? ORDER BY id DESC LIMIT 1'
        ).bind(String(email).trim().toLowerCase(), String(ebook_slug)).run();
      }
    }

    return new Response(JSON.stringify({
      success: true,
      pdf_url: pdfUrl,
      email_sent: emailSent,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('[ebook-lead] Error:', err);
    return new Response(JSON.stringify({ error: 'Erro interno. Tente novamente.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
