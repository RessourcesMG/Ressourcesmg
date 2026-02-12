/**
 * Authentification webmaster : mot de passe unique (défini dans .env).
 * Session stockée en sessionStorage (perdure jusqu'à fermeture de l'onglet).
 */

const SESSION_KEY = 'ressourcesmg_webmaster_session';

export function isWebmasterLoggedIn(): boolean {
  const session = sessionStorage.getItem(SESSION_KEY);
  if (!session) return false;
  try {
    const { expiry } = JSON.parse(session);
    return Date.now() < expiry;
  } catch {
    return false;
  }
}

export function login(password: string): boolean {
  const expected = import.meta.env.VITE_WEBMASTER_PASSWORD as string | undefined;
  if (!expected || expected !== password) return false;
  const expiry = Date.now() + 8 * 60 * 60 * 1000; // 8 heures
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({ expiry }));
  return true;
}

export function logout(): void {
  sessionStorage.removeItem(SESSION_KEY);
}
