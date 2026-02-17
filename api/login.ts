import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createToken } from '../api-utils/auth';

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
    return res.status(500).json({ success: false, error: 'WEBMASTER_PASSWORD manquant sur Vercel.' });
  }

  const { password } = req.body || {};
  if (typeof password !== 'string') {
    return res.status(400).json({ success: false, error: 'Mot de passe requis' });
  }

  if (password !== expectedPassword) {
    return res.status(401).json({ success: false, error: 'Mot de passe incorrect' });
  }

  try {
    const token = createToken();
    return res.status(200).json({ success: true, token });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erreur inattendue';
    return res.status(500).json({ success: false, error: msg });
  }
}
