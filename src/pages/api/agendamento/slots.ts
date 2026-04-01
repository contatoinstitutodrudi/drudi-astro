// GET /api/agendamento/slots?date=YYYY-MM-DD&unit=Santana
import { env } from "cloudflare:workers";
import type { APIRoute } from 'astro';
import { getAppointmentsByDateUnit, isDayBlocked } from '../../../lib/db';
import { BUSINESS_HOURS, MAX_PER_SLOT } from '../../../lib/constants';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const date = url.searchParams.get('date');
  const unit = url.searchParams.get('unit');

  if (!date || !unit) {
    return new Response(JSON.stringify({ error: 'Parâmetros date e unit são obrigatórios.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Validar formato da data
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return new Response(JSON.stringify({ error: 'Formato de data inválido.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const db = (env as unknown as Env).DB;

    // Verificar se o dia está bloqueado
    const blocked = await isDayBlocked(db, date, unit);
    if (blocked) {
      return new Response(JSON.stringify({ dayOff: true, slots: [] }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Verificar dia da semana
    const [year, month, day] = date.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    const dow = dateObj.getDay(); // 0=Dom, 6=Sáb

    if (dow === 0) {
      // Domingo — não atendemos
      return new Response(JSON.stringify({ dayOff: true, slots: [] }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const isSaturday = dow === 6;
    const hours = isSaturday ? BUSINESS_HOURS.saturday : BUSINESS_HOURS.weekday;

    // Buscar agendamentos existentes nessa data/unidade
    const existing = await getAppointmentsByDateUnit(db, date, unit);

    // Contar ocupação por slot
    const occupancy: Record<string, number> = {};
    for (const appt of existing) {
      const key = `${appt.appointment_hour}:${appt.appointment_minute}`;
      occupancy[key] = (occupancy[key] ?? 0) + 1;
    }

    // Verificar se a data solicitada é hoje (para filtrar horários passados)
    // Cloudflare Workers usa UTC; ajustar para America/Sao_Paulo (UTC-3)
    const nowUtc = new Date();
    const nowBrt = new Date(nowUtc.getTime() - 3 * 60 * 60 * 1000);
    const todayStr = `${nowBrt.getUTCFullYear()}-${String(nowBrt.getUTCMonth() + 1).padStart(2, '0')}-${String(nowBrt.getUTCDate()).padStart(2, '0')}`;
    const isToday = date === todayStr;
    // Horário mínimo: agora + 1 hora de antecedência (em minutos totais desde meia-noite BRT)
    const minTotalMinutes = isToday ? (nowBrt.getUTCHours() * 60 + nowBrt.getUTCMinutes() + 60) : 0;

    // Gerar todos os slots
    const slots: { hour: number; minute: number; available: boolean }[] = [];
    for (let h = hours.start; h < hours.end; h++) {
      for (let m = 0; m < 60; m += BUSINESS_HOURS.interval) {
        // Não ultrapassar o horário de fim
        if (h === hours.end - 1 && m + BUSINESS_HOURS.interval > 60) break;
        const key = `${h}:${m}`;
        const count = occupancy[key] ?? 0;
        // Bloquear horários já passados (ou com menos de 1h de antecedência) no dia atual
        const slotTotalMinutes = h * 60 + m;
        const isPastSlot = isToday && slotTotalMinutes < minTotalMinutes;
        slots.push({ hour: h, minute: m, available: !isPastSlot && count < MAX_PER_SLOT });
      }
    }

    return new Response(JSON.stringify({ dayOff: false, slots }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[slots] Error:', err);
    return new Response(JSON.stringify({ error: 'Erro interno.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
