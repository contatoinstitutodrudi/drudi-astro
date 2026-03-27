// ============================================================
// Auth helper — JWT simples para o painel admin
// ============================================================

const COOKIE_NAME = 'drudi_admin_token';
const TOKEN_EXPIRY = 60 * 60 * 8; // 8 horas em segundos

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
  return btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

export async function createAdminToken(secret: string): Promise<string> {
  const payload = { exp: Math.floor(Date.now() / 1000) + TOKEN_EXPIRY, role: 'admin' };
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).replace(/=/g, '');
  const body = btoa(JSON.stringify(payload)).replace(/=/g, '');
  const sig = await hmacSign(secret, `${header}.${body}`);
  return `${header}.${body}.${sig}`;
}

export async function verifyAdminToken(secret: string, token: string): Promise<boolean> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    const [header, body, sig] = parts;
    const expected = await hmacSign(secret, `${header}.${body}`);
    if (sig !== expected) return false;
    const payload = JSON.parse(atob(body + '==')) as { exp: number; role: string };
    if (payload.role !== 'admin') return false;
    if (payload.exp < Math.floor(Date.now() / 1000)) return false;
    return true;
  } catch {
    return false;
  }
}

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
