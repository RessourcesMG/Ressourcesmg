import crypto from 'node:crypto';

const TOKEN_DURATION_MS = 8 * 60 * 60 * 1000; // 8 heures

/** En production, WEBMASTER_SECRET est requis. En dev, un secret par défaut est autorisé. */
function getSecret(): string | null {
  const secret = process.env.WEBMASTER_SECRET;
  if (secret) return secret;
  const isProduction =
    process.env.VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production';
  if (isProduction) return null;
  return 'ressourcesmg-default-secret-change-me';
}

export function verifyToken(token: string | null | undefined): boolean {
  if (!token) return false;
  const secret = getSecret();
  if (!secret) return false;
  try {
    const [payloadB64, signature] = token.split('.');
    if (!payloadB64 || !signature) return false;
    const payload = Buffer.from(payloadB64, 'base64url').toString();
    const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    if (signature !== expected) return false;
    const data = JSON.parse(payload);
    return Date.now() - data.t < TOKEN_DURATION_MS;
  } catch {
    return false;
  }
}

/** Génère un token de session webmaster. Lance si WEBMASTER_SECRET manque en production. */
export function createToken(): string {
  const secret = getSecret();
  if (!secret) {
    throw new Error('Configuration manquante : WEBMASTER_SECRET doit être défini en production.');
  }
  const payload = JSON.stringify({
    t: Date.now(),
    r: crypto.randomBytes(16).toString('hex'),
  });
  const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return Buffer.from(payload).toString('base64url') + '.' + signature;
}

/** Extrait le token Bearer des en-têtes de la requête. */
export function getToken(req: { headers?: { authorization?: string } }): string | null {
  const auth = req.headers?.authorization;
  return auth?.startsWith('Bearer ') ? auth.slice(7) : null;
}
