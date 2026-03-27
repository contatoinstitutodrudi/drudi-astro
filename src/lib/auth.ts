// ============================================================
// Auth helper — JWT HS256 com base64url correto
// ============================================================

const COOKIE_NAME = 'drudi_admin_token';
const TOKEN_EXPIRY = 60 * 60 * 8; // 8 horas em segundos

// ─── base64url helpers ──────────────────────────────────────
function base64urlEncode(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let str = '';
  for (const b of bytes) str += String.fromCharCode(b);
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function base64urlEncodeStr(str: string): string {
  const enc = new TextEncoder();
  const buf = enc.encode(str);
  let s = '';
  for (const b of buf) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function base64urlDecode(str: string): string {
  // Converter base64url para base64 padrão
  const b64 = str.replace(/-/g, '+').replace(/_/g, '/');
  // Adicionar padding
  const padded = b64 + '='.repeat((4 - b64.length % 4) % 4);
  return atob(padded);
}

// ─── HMAC-SHA256 ────────────────────────────────────────────
async function hmacSign(secret: string, data: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data));
  return base64urlEncode(sig);
}

// ─── Token creation ─────────────────────────────────────────
export async function createAdminToken(secret: string): Promise<string> {
  const payload = { exp: Math.floor(Date.now() / 1000) + TOKEN_EXPIRY, role: 'admin' };
  const header = base64urlEncodeStr(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = base64urlEncodeStr(JSON.stringify(payload));
  const sig = await hmacSign(secret, `${header}.${body}`);
  return `${header}.${body}.${sig}`;
}

// ─── Token verification ─────────────────────────────────────
export async function verifyAdminToken(secret: string, token: string): Promise<boolean> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    const [header, body, sig] = parts;

    // Verificar assinatura
    const expected = await hmacSign(secret, `${header}.${body}`);
    if (sig !== expected) return false;

    // Decodificar payload com base64url
    const payloadStr = base64urlDecode(body);
    const payload = JSON.parse(payloadStr) as { exp: number; role: string };

    if (payload.role !== 'admin') return false;
    if (payload.exp < Math.floor(Date.now() / 1000)) return false;

    return true;
  } catch {
    return false;
  }
}

// ─── Cookie helpers ─────────────────────────────────────────
export function getAdminTokenFromRequest(request: Request): string | null {
  const cookie = request.headers.get('cookie') ?? '';
  const match = cookie.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  return match ? match[1] : null;
}

export function makeAdminCookie(token: string): string {
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${TOKEN_EXPIRY}`;
}

export function clearAdminCookie(): string {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
}

export const COOKIE_NAME_EXPORT = COOKIE_NAME;
