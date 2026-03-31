// ============================================================
// E-mail helper — Resend API
// E-mails HTML profissionais para paciente e clínica
// ============================================================

const FROM_EMAIL = 'Drudi e Almeida <no-reply@institutodrudiealmeida.com.br>';
const REPLY_TO = 'contato@drudiealmeida.com';
const ADMIN_EMAIL = 'contato@drudiealmeida.com';
const SITE_URL = 'https://institutodrudiealmeida.com.br';
const WHATSAPP = 'https://wa.me/5511916544653';
const PHONE = '(11) 5430-2421';

const UNIT_ADDRESSES: Record<string, string> = {
  Santana: 'Av. Braz Leme, 1717 – Santana, São Paulo',
  Tatuapé: 'R. Tuiuti, 1889 – Tatuapé, São Paulo',
  Lapa: 'Av. Diógenes Ribeiro de Lima, 2534 – Lapa, São Paulo',
  'São Miguel': 'Av. Marechal Tito, 3012 – São Miguel Paulista, São Paulo',
  Guarulhos: 'R. Sete de Setembro, 261 – Centro, Guarulhos',
};

const TYPE_LABELS: Record<string, string> = {
  primeira_vez: 'Primeira Consulta',
  retorno: 'Retorno',
  exame: 'Exame / Procedimento',
};

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-');
  const months = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  return `${day} de ${months[parseInt(month) - 1]} de ${year}`;
}

function formatDateShort(dateStr: string): string {
  const [year, month, day] = dateStr.split('-');
  const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  return `${day} de ${months[parseInt(month) - 1]} de ${year}`;
}

function formatHour(hour: number, minute: number): string {
  return `${String(hour).padStart(2, '0')}h${minute > 0 ? String(minute).padStart(2, '0') : ''}`;
}

function getDayOfWeek(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  const days = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
  return days[d.getDay()];
}

// ── Template base ──────────────────────────────────────────────
function baseLayout(content: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Drudi e Almeida Oftalmologia</title>
</head>
<body style="margin:0;padding:0;background:#f0ede6;font-family:'Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f0ede6;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">

        <!-- ── HEADER ── -->
        <tr>
          <td style="background:#1e2d3d;border-radius:12px 12px 0 0;padding:32px 40px;text-align:center;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center">
                  <!-- Logo mark SVG -->
                  <div style="width:48px;height:48px;background:#c9a961;border-radius:50%;display:inline-block;line-height:48px;text-align:center;margin-bottom:12px;">
                    <span style="color:#1e2d3d;font-size:22px;font-weight:900;">D</span>
                  </div>
                  <p style="margin:0;color:#c9a961;font-size:10px;letter-spacing:4px;text-transform:uppercase;font-weight:700;">DRUDI E ALMEIDA</p>
                  <p style="margin:4px 0 0;color:rgba(255,255,255,0.55);font-size:12px;letter-spacing:1px;">Clínicas Oftalmológicas</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ── CONTENT ── -->
        <tr>
          <td style="background:#ffffff;padding:0;">
            ${content}
          </td>
        </tr>

        <!-- ── FOOTER ── -->
        <tr>
          <td style="background:#1e2d3d;border-radius:0 0 12px 12px;padding:24px 40px;text-align:center;">
            <p style="margin:0;color:rgba(255,255,255,0.5);font-size:11px;line-height:1.8;">
              Drudi e Almeida Clínicas Oftalmológicas<br>
              <a href="tel:+551154302421" style="color:#c9a961;text-decoration:none;">${PHONE}</a>
              &nbsp;·&nbsp;
              <a href="${SITE_URL}" style="color:#c9a961;text-decoration:none;">institutodrudiealmeida.com.br</a>
            </p>
            <p style="margin:12px 0 0;color:rgba(255,255,255,0.25);font-size:10px;">
              Este é um e-mail automático. Para responder, use o e-mail contato@drudiealmeida.com
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ── Divider helper ─────────────────────────────────────────────
const divider = `<tr><td style="padding:0 40px;"><div style="height:1px;background:#f0ede6;"></div></td></tr>`;

// ── Detail row helper ──────────────────────────────────────────
function detailRow(icon: string, label: string, value: string, highlight = false): string {
  return `
  <tr>
    <td style="padding:10px 0;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="width:32px;vertical-align:top;padding-top:2px;">
            <span style="font-size:16px;">${icon}</span>
          </td>
          <td style="vertical-align:top;">
            <p style="margin:0;color:#999;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">${label}</p>
            <p style="margin:2px 0 0;color:${highlight ? '#c9a961' : '#1e2d3d'};font-size:14px;font-weight:${highlight ? '700' : '600'};">${value}</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>`;
}

// ══════════════════════════════════════════════════════════════
// E-MAIL PARA O PACIENTE — Confirmação de Agendamento
// ══════════════════════════════════════════════════════════════
export async function sendConfirmationEmail(
  apiKey: string,
  appointment: {
    patient_name: string;
    patient_email: string;
    unit: string;
    specialty: string;
    health_plan: string;
    appointment_date: string;
    appointment_hour: number;
    appointment_minute: number;
    appointment_type: string;
    cancel_token: string;
  }
): Promise<void> {
  if (!apiKey || !appointment.patient_email) return;

  const cancelUrl = `${SITE_URL}/cancelar?token=${appointment.cancel_token}`;
  const dateFormatted = formatDate(appointment.appointment_date);
  const dateShort = formatDateShort(appointment.appointment_date);
  const hourFormatted = formatHour(appointment.appointment_hour, appointment.appointment_minute);
  const dayOfWeek = getDayOfWeek(appointment.appointment_date);
  const address = UNIT_ADDRESSES[appointment.unit] ?? appointment.unit;
  const typeLabel = TYPE_LABELS[appointment.appointment_type] ?? appointment.appointment_type;
  const firstName = appointment.patient_name.split(' ')[0];

  const content = `
    <!-- Hero banner -->
    <tr>
      <td style="background:linear-gradient(135deg,#1e2d3d 0%,#2c3e50 100%);padding:36px 40px 32px;text-align:center;">
        <div style="width:56px;height:56px;background:rgba(201,169,97,0.15);border:2px solid #c9a961;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;">
          <span style="font-size:24px;">✓</span>
        </div>
        <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.5px;">Consulta Confirmada!</h1>
        <p style="margin:8px 0 0;color:rgba(255,255,255,0.65);font-size:14px;">Seu agendamento foi recebido com sucesso.</p>
      </td>
    </tr>

    <!-- Saudação -->
    <tr>
      <td style="padding:32px 40px 0;">
        <p style="margin:0;color:#1e2d3d;font-size:16px;line-height:1.6;">
          Olá, <strong>${firstName}</strong>! Estamos felizes em recebê-lo(a) na Drudi e Almeida Oftalmologia.
          Abaixo estão os detalhes do seu agendamento.
        </p>
      </td>
    </tr>

    <!-- Card de detalhes -->
    <tr>
      <td style="padding:24px 40px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f7f4;border-radius:10px;border:1px solid #e8e4d8;padding:24px;">
          <tr><td>
            <p style="margin:0 0 16px;color:#c9a961;font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;">Detalhes do Agendamento</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              ${detailRow('📅', 'Data', `${dayOfWeek}, ${dateFormatted}`, true)}
              ${detailRow('🕐', 'Horário', hourFormatted)}
              ${detailRow('📍', 'Unidade', appointment.unit)}
              ${detailRow('🏥', 'Endereço', address)}
              ${detailRow('👁️', 'Especialidade', appointment.specialty)}
              ${detailRow('🩺', 'Tipo de Consulta', typeLabel)}
              ${detailRow('💳', 'Convênio / Forma de Pagamento', appointment.health_plan)}
            </table>
          </td></tr>
        </table>
      </td>
    </tr>

    <!-- O que trazer -->
    <tr>
      <td style="padding:0 40px 24px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#fffbf0;border-radius:10px;border:1px solid #f0e8c8;padding:20px 24px;">
          <tr><td>
            <p style="margin:0 0 10px;color:#c9a961;font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;">O que trazer</p>
            <table cellpadding="0" cellspacing="0">
              <tr><td style="padding:3px 0;color:#555;font-size:13px;">📋 &nbsp;Documento de identidade com foto</td></tr>
              <tr><td style="padding:3px 0;color:#555;font-size:13px;">💳 &nbsp;Carteirinha do convênio (se aplicável)</td></tr>
              <tr><td style="padding:3px 0;color:#555;font-size:13px;">📄 &nbsp;Exames e laudos anteriores (se tiver)</td></tr>
              <tr><td style="padding:3px 0;color:#555;font-size:13px;">⏰ &nbsp;Chegue 15 minutos antes do horário</td></tr>
            </table>
          </td></tr>
        </table>
      </td>
    </tr>

    <!-- Dúvidas -->
    <tr>
      <td style="padding:0 40px 28px;">
        <p style="margin:0 0 16px;color:#555;font-size:14px;line-height:1.7;">
          Nossa equipe entrará em contato para confirmar sua consulta. Em caso de dúvidas ou necessidade de remarcação, entre em contato conosco:
        </p>
        <table cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding-right:12px;">
              <a href="${WHATSAPP}" style="display:inline-block;background:#25D366;color:#ffffff;font-size:13px;font-weight:700;text-decoration:none;padding:11px 22px;border-radius:6px;">
                💬 WhatsApp
              </a>
            </td>
            <td>
              <a href="tel:+551154302421" style="display:inline-block;background:#1e2d3d;color:#ffffff;font-size:13px;font-weight:700;text-decoration:none;padding:11px 22px;border-radius:6px;">
                📞 ${PHONE}
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Cancelamento -->
    <tr>
      <td style="padding:20px 40px 32px;border-top:1px solid #f0ede6;">
        <p style="margin:0;color:#aaa;font-size:12px;line-height:1.7;">
          Precisa cancelar ou remarcar sua consulta?<br>
          <a href="${cancelUrl}" style="color:#c9a961;font-weight:600;">Clique aqui para cancelar este agendamento</a>
          &nbsp;(disponível até 24h antes da consulta).
        </p>
      </td>
    </tr>
  `;

  const html = baseLayout(content);

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      reply_to: REPLY_TO,
      to: [appointment.patient_email],
      subject: `✅ Consulta confirmada — ${dayOfWeek}, ${dateShort} às ${hourFormatted} | Drudi e Almeida`,
      html,
    }),
  });
}

// ══════════════════════════════════════════════════════════════
// E-MAIL PARA A CLÍNICA — Notificação de Novo Agendamento
// ══════════════════════════════════════════════════════════════
export async function sendAdminNotificationEmail(
  apiKey: string,
  appointment: {
    id?: number;
    patient_name: string;
    patient_phone: string;
    patient_email: string | null;
    unit: string;
    specialty: string;
    health_plan: string;
    appointment_date: string;
    appointment_hour: number;
    appointment_minute: number;
    appointment_type: string;
    notes: string | null;
  }
): Promise<void> {
  if (!apiKey) return;

  const dateFormatted = formatDate(appointment.appointment_date);
  const dateShort = formatDateShort(appointment.appointment_date);
  const hourFormatted = formatHour(appointment.appointment_hour, appointment.appointment_minute);
  const dayOfWeek = getDayOfWeek(appointment.appointment_date);
  const typeLabel = TYPE_LABELS[appointment.appointment_type] ?? appointment.appointment_type;
  const address = UNIT_ADDRESSES[appointment.unit] ?? appointment.unit;

  const content = `
    <!-- Alerta header -->
    <tr>
      <td style="background:linear-gradient(135deg,#1e2d3d 0%,#2c3e50 100%);padding:28px 40px;border-bottom:3px solid #c9a961;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td>
              <p style="margin:0;color:#c9a961;font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;">Novo Agendamento</p>
              <h2 style="margin:4px 0 0;color:#ffffff;font-size:20px;font-weight:700;">${appointment.patient_name}</h2>
              <p style="margin:4px 0 0;color:rgba(255,255,255,0.6);font-size:13px;">${dayOfWeek}, ${dateFormatted} às ${hourFormatted}</p>
            </td>
            <td align="right" style="vertical-align:top;">
              <div style="background:rgba(201,169,97,0.15);border:1px solid #c9a961;border-radius:6px;padding:8px 14px;display:inline-block;">
                <p style="margin:0;color:#c9a961;font-size:11px;font-weight:700;">${appointment.unit}</p>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Dados do paciente -->
    <tr>
      <td style="padding:28px 40px 0;">
        <p style="margin:0 0 14px;color:#c9a961;font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;">Dados do Paciente</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f7f4;border-radius:8px;border:1px solid #e8e4d8;padding:16px 20px;">
          <tr><td>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:6px 0;width:50%;vertical-align:top;">
                  <p style="margin:0;color:#999;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;">Nome</p>
                  <p style="margin:2px 0 0;color:#1e2d3d;font-size:14px;font-weight:600;">${appointment.patient_name}</p>
                </td>
                <td style="padding:6px 0;width:50%;vertical-align:top;">
                  <p style="margin:0;color:#999;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;">Telefone / WhatsApp</p>
                  <p style="margin:2px 0 0;font-size:14px;font-weight:600;">
                    <a href="https://wa.me/55${appointment.patient_phone.replace(/\D/g, '')}" style="color:#25D366;text-decoration:none;">${appointment.patient_phone}</a>
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding:6px 0;vertical-align:top;">
                  <p style="margin:0;color:#999;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;">E-mail</p>
                  <p style="margin:2px 0 0;color:#1e2d3d;font-size:14px;font-weight:600;">${appointment.patient_email ?? '—'}</p>
                </td>
                <td style="padding:6px 0;vertical-align:top;">
                  <p style="margin:0;color:#999;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;">Convênio</p>
                  <p style="margin:2px 0 0;color:#1e2d3d;font-size:14px;font-weight:600;">${appointment.health_plan}</p>
                </td>
              </tr>
            </table>
          </td></tr>
        </table>
      </td>
    </tr>

    <!-- Detalhes da consulta -->
    <tr>
      <td style="padding:20px 40px 0;">
        <p style="margin:0 0 14px;color:#c9a961;font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;">Detalhes da Consulta</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f7f4;border-radius:8px;border:1px solid #e8e4d8;padding:16px 20px;">
          <tr><td>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:6px 0;width:50%;vertical-align:top;">
                  <p style="margin:0;color:#999;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;">Data</p>
                  <p style="margin:2px 0 0;color:#c9a961;font-size:14px;font-weight:700;">${dayOfWeek}, ${dateFormatted}</p>
                </td>
                <td style="padding:6px 0;width:50%;vertical-align:top;">
                  <p style="margin:0;color:#999;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;">Horário</p>
                  <p style="margin:2px 0 0;color:#c9a961;font-size:14px;font-weight:700;">${hourFormatted}</p>
                </td>
              </tr>
              <tr>
                <td style="padding:6px 0;vertical-align:top;">
                  <p style="margin:0;color:#999;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;">Unidade</p>
                  <p style="margin:2px 0 0;color:#1e2d3d;font-size:14px;font-weight:600;">${appointment.unit}</p>
                  <p style="margin:2px 0 0;color:#888;font-size:12px;">${address}</p>
                </td>
                <td style="padding:6px 0;vertical-align:top;">
                  <p style="margin:0;color:#999;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;">Especialidade</p>
                  <p style="margin:2px 0 0;color:#1e2d3d;font-size:14px;font-weight:600;">${appointment.specialty}</p>
                  <p style="margin:2px 0 0;color:#888;font-size:12px;">${typeLabel}</p>
                </td>
              </tr>
              ${appointment.notes ? `
              <tr>
                <td colspan="2" style="padding:6px 0;vertical-align:top;">
                  <p style="margin:0;color:#999;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;">Observações do Paciente</p>
                  <p style="margin:4px 0 0;color:#555;font-size:13px;background:#fff;border-left:3px solid #c9a961;padding:8px 12px;border-radius:0 4px 4px 0;">${appointment.notes}</p>
                </td>
              </tr>` : ''}
            </table>
          </td></tr>
        </table>
      </td>
    </tr>

    <!-- CTA admin -->
    <tr>
      <td style="padding:24px 40px 32px;">
        <table cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding-right:12px;">
              <a href="${SITE_URL}/admin/agendamentos" style="display:inline-block;background:#1e2d3d;color:#ffffff;font-size:13px;font-weight:700;text-decoration:none;padding:12px 24px;border-radius:6px;">
                Ver no Painel Admin →
              </a>
            </td>
            <td>
              <a href="https://wa.me/55${appointment.patient_phone.replace(/\D/g, '')}" style="display:inline-block;background:#25D366;color:#ffffff;font-size:13px;font-weight:700;text-decoration:none;padding:12px 24px;border-radius:6px;">
                💬 Contatar Paciente
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `;

  const html = baseLayout(content);

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      reply_to: REPLY_TO,
      to: [ADMIN_EMAIL],
      subject: `🗓️ Novo agendamento: ${appointment.patient_name} — ${appointment.unit} ${dateShort} ${hourFormatted}`,
      html,
    }),
  });
}

// ══════════════════════════════════════════════════════════════
// E-MAIL DE CANCELAMENTO — Confirmação para o Paciente
// ══════════════════════════════════════════════════════════════
export async function sendCancellationEmail(
  apiKey: string,
  appointment: {
    patient_name: string;
    patient_email: string | null;
    unit: string;
    specialty: string;
    appointment_date: string;
    appointment_hour: number;
    appointment_minute: number;
  }
): Promise<void> {
  if (!apiKey || !appointment.patient_email) return;

  const dateFormatted = formatDate(appointment.appointment_date);
  const dateShort = formatDateShort(appointment.appointment_date);
  const hourFormatted = formatHour(appointment.appointment_hour, appointment.appointment_minute);
  const dayOfWeek = getDayOfWeek(appointment.appointment_date);
  const firstName = appointment.patient_name.split(' ')[0];

  const content = `
    <!-- Banner cancelamento -->
    <tr>
      <td style="background:linear-gradient(135deg,#2c2c2c 0%,#3d3d3d 100%);padding:36px 40px 32px;text-align:center;">
        <div style="width:56px;height:56px;background:rgba(239,68,68,0.15);border:2px solid #ef4444;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;">
          <span style="font-size:24px;color:#ef4444;">✕</span>
        </div>
        <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">Agendamento Cancelado</h1>
        <p style="margin:8px 0 0;color:rgba(255,255,255,0.6);font-size:14px;">Seu cancelamento foi processado com sucesso.</p>
      </td>
    </tr>

    <!-- Saudação -->
    <tr>
      <td style="padding:32px 40px 20px;">
        <p style="margin:0;color:#1e2d3d;font-size:15px;line-height:1.7;">
          Olá, <strong>${firstName}</strong>. Confirmamos o cancelamento da sua consulta na Drudi e Almeida Oftalmologia.
        </p>
      </td>
    </tr>

    <!-- Detalhes cancelados -->
    <tr>
      <td style="padding:0 40px 24px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#fef2f2;border-radius:10px;border:1px solid #fecaca;padding:20px 24px;">
          <tr><td>
            <p style="margin:0 0 12px;color:#ef4444;font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;">Consulta Cancelada</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="text-decoration:line-through;opacity:0.7;">
              ${detailRow('📅', 'Data', `${dayOfWeek}, ${dateFormatted}`)}
              ${detailRow('🕐', 'Horário', hourFormatted)}
              ${detailRow('📍', 'Unidade', appointment.unit)}
              ${detailRow('👁️', 'Especialidade', appointment.specialty)}
            </table>
          </td></tr>
        </table>
      </td>
    </tr>

    <!-- Reagendar -->
    <tr>
      <td style="padding:0 40px 28px;">
        <p style="margin:0 0 16px;color:#555;font-size:14px;line-height:1.7;">
          Ficamos à disposição para um novo agendamento. Você pode remarcar sua consulta pelo nosso site ou pelo WhatsApp:
        </p>
        <table cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding-right:12px;">
              <a href="${SITE_URL}/agendar" style="display:inline-block;background:#1e2d3d;color:#ffffff;font-size:13px;font-weight:700;text-decoration:none;padding:12px 24px;border-radius:6px;">
                📅 Agendar Novamente
              </a>
            </td>
            <td>
              <a href="${WHATSAPP}" style="display:inline-block;background:#25D366;color:#ffffff;font-size:13px;font-weight:700;text-decoration:none;padding:12px 24px;border-radius:6px;">
                💬 WhatsApp
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `;

  const html = baseLayout(content);

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      reply_to: REPLY_TO,
      to: [appointment.patient_email],
      subject: `Cancelamento confirmado — ${dateShort} às ${hourFormatted} | Drudi e Almeida`,
      html,
    }),
  });
}
