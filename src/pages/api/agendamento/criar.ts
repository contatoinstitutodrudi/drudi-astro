// POST /api/agendamento/criar
import { env } from "cloudflare:workers";
import type { APIRoute } from 'astro';
import { createAppointment, getAppointmentsByDateUnit, isDayBlocked, updateGcalEventId } from '../../../lib/db';
import { createCalendarEvent, buildCalendarEvent } from '../../../lib/gcal';
import { sendConfirmationEmail, sendAdminNotificationEmail } from '../../../lib/email';
import { GCAL_ENV_MAP, MAX_PER_SLOT } from '../../../lib/constants';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  const cfEnv = env as unknown as Env;
  // Em Astro v6 + @astrojs/cloudflare, o ExecutionContext fica em locals.cfContext
  const cfContext = (locals as Record<string, unknown>).cfContext as { waitUntil: (p: Promise<unknown>) => void } | undefined;

  let body: Record<string, unknown>;
  try {
    body = await request.json() as Record<string, unknown>;
  } catch {
    return new Response(JSON.stringify({ error: 'JSON inválido.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const {
    patient_name,
    patient_phone,
    patient_email,
    unit,
    specialty,
    health_plan,
    appointment_date,
    appointment_hour,
    appointment_minute,
    appointment_type,
    notes,
  } = body as Record<string, string | number | null>;

  // Validações básicas
  if (!patient_name || !patient_phone || !patient_email || !unit || !specialty || !health_plan ||
      !appointment_date || appointment_hour === undefined || appointment_minute === undefined) {
    return new Response(JSON.stringify({ error: 'Campos obrigatórios ausentes. O e-mail é obrigatório para envio da confirmação.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  // Validar formato do e-mail
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(patient_email))) {
    return new Response(JSON.stringify({ error: 'E-mail inválido. Verifique o endereço informado.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const db = cfEnv.DB;

    // Verificar se o dia está bloqueado
    const blocked = await isDayBlocked(db, String(appointment_date), String(unit));
    if (blocked) {
      return new Response(JSON.stringify({ error: 'Este dia não está disponível para agendamento.' }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Verificar disponibilidade do slot
    const existing = await getAppointmentsByDateUnit(db, String(appointment_date), String(unit));
    const slotCount = existing.filter(
      a => a.appointment_hour === Number(appointment_hour) && a.appointment_minute === Number(appointment_minute)
    ).length;

    if (slotCount >= MAX_PER_SLOT) {
      return new Response(JSON.stringify({ error: 'Horário não disponível. Por favor, escolha outro.' }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Criar agendamento no banco
    const { id, cancel_token } = await createAppointment(db, {
      patient_name: String(patient_name),
      patient_phone: String(patient_phone),
      patient_email: patient_email ? String(patient_email) : null,
      unit: String(unit),
      specialty: String(specialty),
      health_plan: String(health_plan),
      appointment_date: String(appointment_date),
      appointment_hour: Number(appointment_hour),
      appointment_minute: Number(appointment_minute),
      appointment_type: String(appointment_type ?? 'primeira_vez'),
      notes: notes ? String(notes) : null,
    });

    // Criar evento no Google Calendar (assíncrono, não bloqueia resposta)
    const calEnvKey = GCAL_ENV_MAP[String(unit)];
    const calendarId = calEnvKey ? (cfEnv as unknown as Record<string, string>)[calEnvKey] : null;

    if (calendarId) {
      try {
        const event = buildCalendarEvent({
          patient_name: String(patient_name),
          patient_phone: String(patient_phone),
          patient_email: patient_email ? String(patient_email) : null,
          unit: String(unit),
          specialty: String(specialty),
          health_plan: String(health_plan),
          appointment_date: String(appointment_date),
          appointment_hour: Number(appointment_hour),
          appointment_minute: Number(appointment_minute),
          appointment_type: String(appointment_type ?? 'primeira_vez'),
          notes: notes ? String(notes) : null,
        });
        const gcalId = await createCalendarEvent(cfEnv, calendarId, event);
        await updateGcalEventId(db, id, gcalId);
      } catch (gcalErr) {
        console.error('[criar] GCal error (non-fatal):', gcalErr);
      }
    }

    // Enviar e-mails usando cfContext.waitUntil para garantir execução
    // mesmo após a resposta ser enviada (obrigatório no Cloudflare Workers)
    const emailTasks: Promise<void>[] = [];

    // patient_email é agora obrigatório — sempre enviar confirmação ao paciente
    emailTasks.push(
      sendConfirmationEmail(cfEnv.RESEND_API_KEY, {
        patient_name: String(patient_name),
        patient_email: String(patient_email),
        unit: String(unit),
        specialty: String(specialty),
        appointment_date: String(appointment_date),
        appointment_hour: Number(appointment_hour),
        appointment_minute: Number(appointment_minute),
        cancel_token,
      }).catch(e => console.error('[criar] Email paciente error:', e))
    );

    emailTasks.push(
      sendAdminNotificationEmail(cfEnv.RESEND_API_KEY, {
        patient_name: String(patient_name),
        patient_phone: String(patient_phone),
        patient_email: patient_email ? String(patient_email) : null,
        unit: String(unit),
        specialty: String(specialty),
        health_plan: String(health_plan),
        appointment_date: String(appointment_date),
        appointment_hour: Number(appointment_hour),
        appointment_minute: Number(appointment_minute),
        appointment_type: String(appointment_type ?? 'primeira_vez'),
        notes: notes ? String(notes) : null,
      }).catch(e => console.error('[criar] Email clínica error:', e))
    );

    if (cfContext?.waitUntil) {
      cfContext.waitUntil(Promise.all(emailTasks));
    } else {
      await Promise.all(emailTasks);
    }

    return new Response(JSON.stringify({ success: true, id, cancel_token }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[criar] Error:', err);
    return new Response(JSON.stringify({ error: 'Erro ao criar agendamento. Tente novamente.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
