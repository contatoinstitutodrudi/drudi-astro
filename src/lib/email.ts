// ============================================================
// E-mail helper — Resend API
// ============================================================

const FROM_EMAIL = 'Drudi e Almeida <agendamento@institutodrudiealmeida.com.br>';

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-');
  const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  return `${day} de ${months[parseInt(month) - 1]} de ${year}`;
}

function formatHour(hour: number, minute: number): string {
  return `${String(hour).padStart(2, '0')}h${minute > 0 ? String(minute).padStart(2, '0') : ''}`;
}

export async function sendConfirmationEmail(
  apiKey: string,
  appointment: {
    patient_name: string;
    patient_email: string;
    unit: string;
    specialty: string;
    appointment_date: string;
    appointment_hour: number;
    appointment_minute: number;
    cancel_token: string;
  }
): Promise<void> {
  if (!apiKey || !appointment.patient_email) return;

  const cancelUrl = `https://institutodrudiealmeida.com.br/cancelar?token=${appointment.cancel_token}`;
  const dateFormatted = formatDate(appointment.appointment_date);
  const hourFormatted = formatHour(appointment.appointment_hour, appointment.appointment_minute);

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f0;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f0;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
        <!-- Header -->
        <tr>
          <td style="background:#2c3e50;padding:28px 32px;text-align:center;">
            <p style="margin:0;color:#c9a961;font-size:11px;letter-spacing:3px;text-transform:uppercase;font-weight:600;">DRUDI E ALMEIDA</p>
            <p style="margin:4px 0 0;color:#ffffff;font-size:13px;opacity:0.7;">Clínicas Oftalmológicas</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:36px 32px;">
            <h1 style="margin:0 0 8px;color:#2c3e50;font-size:22px;font-weight:600;">Consulta Confirmada!</h1>
            <p style="margin:0 0 24px;color:#666;font-size:15px;">Olá, <strong>${appointment.patient_name}</strong>! Seu agendamento foi recebido com sucesso.</p>

            <!-- Card de detalhes -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f7f4;border-radius:8px;border:1px solid #e8e4d8;margin-bottom:24px;">
              <tr><td style="padding:20px 24px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:6px 0;color:#888;font-size:13px;width:120px;">Data</td>
                    <td style="padding:6px 0;color:#2c3e50;font-size:14px;font-weight:600;">${dateFormatted}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;color:#888;font-size:13px;">Horário</td>
                    <td style="padding:6px 0;color:#2c3e50;font-size:14px;font-weight:600;">${hourFormatted}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;color:#888;font-size:13px;">Unidade</td>
                    <td style="padding:6px 0;color:#2c3e50;font-size:14px;font-weight:600;">${appointment.unit}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;color:#888;font-size:13px;">Especialidade</td>
                    <td style="padding:6px 0;color:#2c3e50;font-size:14px;font-weight:600;">${appointment.specialty}</td>
                  </tr>
                </table>
              </td></tr>
            </table>

            <p style="margin:0 0 8px;color:#555;font-size:14px;line-height:1.6;">
              Nossa equipe entrará em contato para confirmar sua consulta. Em caso de dúvidas, ligue para <strong>(11) 5430-2421</strong> ou entre em contato pelo WhatsApp.
            </p>

            <!-- CTA WhatsApp -->
            <table cellpadding="0" cellspacing="0" style="margin:24px 0;">
              <tr>
                <td style="background:#25D366;border-radius:6px;padding:12px 24px;">
                  <a href="https://wa.me/5511916544653" style="color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;">Falar pelo WhatsApp</a>
                </td>
              </tr>
            </table>

            <!-- Cancelar -->
            <p style="margin:24px 0 0;color:#999;font-size:12px;">
              Precisa cancelar? <a href="${cancelUrl}" style="color:#c9a961;">Clique aqui para cancelar sua consulta</a>.
            </p>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f8f7f4;padding:20px 32px;text-align:center;border-top:1px solid #e8e4d8;">
            <p style="margin:0;color:#aaa;font-size:12px;">Drudi e Almeida Clínicas Oftalmológicas · (11) 5430-2421</p>
            <p style="margin:4px 0 0;color:#aaa;font-size:11px;">institutodrudiealmeida.com.br</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: [appointment.patient_email],
      subject: `Consulta agendada — ${dateFormatted} às ${hourFormatted} | Drudi e Almeida`,
      html,
    }),
  });
}

export async function sendAdminNotificationEmail(
  apiKey: string,
  appointment: {
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
  const hourFormatted = formatHour(appointment.appointment_hour, appointment.appointment_minute);
  const typeLabel: Record<string, string> = {
    primeira_vez: 'Primeira Consulta',
    retorno: 'Retorno',
    exame: 'Exame / Procedimento',
  };

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: ['agendamento@institutodrudiealmeida.com.br'],
      subject: `Novo agendamento: ${appointment.patient_name} — ${appointment.unit} ${dateFormatted}`,
      html: `
<p><strong>Novo agendamento recebido!</strong></p>
<ul>
  <li><strong>Paciente:</strong> ${appointment.patient_name}</li>
  <li><strong>Telefone:</strong> ${appointment.patient_phone}</li>
  <li><strong>E-mail:</strong> ${appointment.patient_email ?? '—'}</li>
  <li><strong>Unidade:</strong> ${appointment.unit}</li>
  <li><strong>Especialidade:</strong> ${appointment.specialty}</li>
  <li><strong>Plano:</strong> ${appointment.health_plan}</li>
  <li><strong>Data:</strong> ${dateFormatted} às ${hourFormatted}</li>
  <li><strong>Tipo:</strong> ${typeLabel[appointment.appointment_type] ?? appointment.appointment_type}</li>
  ${appointment.notes ? `<li><strong>Obs:</strong> ${appointment.notes}</li>` : ''}
</ul>
<p><a href="https://institutodrudiealmeida.com.br/admin/agendamentos">Ver no painel admin</a></p>
`,
    }),
  });
}
