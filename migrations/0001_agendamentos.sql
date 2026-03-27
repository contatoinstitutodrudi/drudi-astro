-- ============================================================
-- Drudi e Almeida — Schema D1 (Cloudflare)
-- ============================================================

CREATE TABLE IF NOT EXISTS appointments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_name TEXT NOT NULL,
  patient_phone TEXT NOT NULL,
  patient_email TEXT,
  unit TEXT NOT NULL,
  specialty TEXT NOT NULL DEFAULT 'Consulta Geral',
  health_plan TEXT NOT NULL DEFAULT 'Particular',
  appointment_date TEXT NOT NULL,   -- YYYY-MM-DD
  appointment_hour INTEGER NOT NULL,
  appointment_minute INTEGER NOT NULL DEFAULT 0,
  appointment_type TEXT NOT NULL DEFAULT 'primeira_vez',
  status TEXT NOT NULL DEFAULT 'pending',  -- pending | confirmed | cancelled
  notes TEXT,
  cancel_token TEXT,
  gcal_event_id TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_unit ON appointments(unit);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

CREATE TABLE IF NOT EXISTS day_blocks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  unit TEXT NOT NULL,
  blocked_date TEXT NOT NULL,   -- YYYY-MM-DD
  reason TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE(unit, blocked_date)
);

CREATE INDEX IF NOT EXISTS idx_day_blocks_date ON day_blocks(blocked_date);
