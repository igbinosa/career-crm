const COOKIE_NAME = 'crm_session';
const SESSION_DAYS = 30;

async function hmacKey(): Promise<CryptoKey> {
  const secret = process.env.APP_SESSION_SECRET!;
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function createSessionToken(): Promise<string> {
  const expiresAt = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  const key = await hmacKey();
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(String(expiresAt)));
  return `${expiresAt}.${toHex(sig)}`;
}

export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const [expiresAtRaw, sigHex] = token.split('.');
  if (!expiresAtRaw || !sigHex) return false;
  const expiresAt = Number(expiresAtRaw);
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) return false;

  const key = await hmacKey();
  const expectedSig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(expiresAtRaw));
  return toHex(expectedSig) === sigHex;
}

export const SESSION_COOKIE = COOKIE_NAME;
export const SESSION_MAX_AGE_SECONDS = SESSION_DAYS * 24 * 60 * 60;
