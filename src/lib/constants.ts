// ============================================================
// Constantes compartilhadas — Sistema de Agendamento
// ============================================================

export const UNITS = [
  { value: 'Santana', label: 'Santana — Rua Dr. César, 130' },
  { value: 'Tatuapé', label: 'Tatuapé — Rua Tuiuti, 2429' },
  { value: 'Lapa', label: 'Lapa — Rua Barão de Jundiaí, 221' },
  { value: 'São Miguel', label: 'São Miguel — Rua Bernardo Marcondes, 108' },
  { value: 'Guarulhos', label: 'Guarulhos — Rua Sete de Setembro, 375' },
] as const;

export type UnitValue = typeof UNITS[number]['value'];

export const SPECIALTIES = [
  { value: 'Consulta Geral', label: 'Consulta Geral' },
  { value: 'Catarata', label: 'Instituto da Catarata' },
  { value: 'Ceratocone', label: 'Instituto do Ceratocone' },
  { value: 'Glaucoma', label: 'Instituto do Glaucoma' },
  { value: 'Retina', label: 'Instituto da Retina' },
  { value: 'Estrabismo', label: 'Instituto de Estrabismo' },
  { value: 'Cirurgia Refrativa', label: 'Cirurgia Refrativa' },
  { value: 'Lentes de Contato', label: 'Lentes de Contato' },
  { value: 'Oftalmopediatria', label: 'Oftalmopediatria' },
  { value: 'Plástica Ocular', label: 'Plástica Ocular' },
] as const;

export type SpecialtyValue = typeof SPECIALTIES[number]['value'];

export const HEALTH_PLANS = [
  'Particular',
  'Bradesco Saúde',
  'Amil',
  'Unimed',
  'Prevent Senior',
  'SulAmérica',
  'Porto Seguro Saúde',
  'Hapvida',
  'NotreDame Intermédica',
  'Outro',
] as const;

export const APPOINTMENT_TYPES = [
  { value: 'primeira_vez', label: 'Primeira Consulta' },
  { value: 'retorno', label: 'Retorno' },
  { value: 'exame', label: 'Exame / Procedimento' },
] as const;

// Horários de atendimento
export const BUSINESS_HOURS = {
  weekday: { start: 8, end: 18 },   // Seg-Sex 8h–18h
  saturday: { start: 8, end: 12 },   // Sáb 8h–12h
  interval: 30,                       // minutos entre slots
} as const;

// Máximo de agendamentos por slot (por unidade)
export const MAX_PER_SLOT = 2;

// Quantos dias à frente mostrar para agendamento
export const DAYS_AHEAD = 30;

// Mapa de calendários Google por unidade
export const GCAL_ENV_MAP: Record<string, string> = {
  'Santana': 'GCAL_SANTANA',
  'Tatuapé': 'GCAL_TATUAPE',
  'Lapa': 'GCAL_LAPA',
  'São Miguel': 'GCAL_SAO_MIGUEL',
  'Guarulhos': 'GCAL_GUARULHOS',
};

export const WHATSAPP_NUMBER = '5511916544653';
export const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=Ol%C3%A1!%20Gostaria%20de%20agendar%20uma%20consulta.`;
