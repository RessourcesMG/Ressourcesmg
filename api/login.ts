import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'node:crypto';

const SECRET = process.env.WEBMASTER_SECRET || 'ressourcesmg-default-secret-change-me';
const TOKEN_DURATION_MS = 8 * 60 * 60 * 1000; // 8 heures

function createToken(): string {
  const payload = JSON.stringify({ t: Date.now(), r: crypto.randomBytes(16).toString('hex') });
  const signature = crypto.createHmac('sha256', SECRET).update(payload).digest('hex');
  return Buffer.from(payload).toString('base64url') + '.' + signature;
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const expectedPassword = process.env.WEBMASTER_PASSWORD;
  if (!expectedPassword) {
    return res.status(500).json({ success: false, error: 'Configuration manquante' });
  }

  const { password } = req.body || {};
  if (typeof password !== 'string') {
    return res.status(400).json({ success: false, error: 'Mot de passe requis' });
  }

  if (password !== expectedPassword) {
    return res.status(401).json({ success: false, error: 'Mot de passe incorrect' });
  }

  const token = createToken();
  return res.status(200).json({ success: true, token });
}
