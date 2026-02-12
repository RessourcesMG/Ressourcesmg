/**
 * Authentification webmaster : mot de passe vérifié côté serveur uniquement.
 * Aucun mot de passe n'est stocké ou exposé dans le code client.
 */

const SESSION_KEY = 'ressourcesmg_webmaster_token';

export async function isWebmasterLoggedIn(): Promise<boolean> {
  const token = sessionStorage.getItem(SESSION_KEY);
  if (!token) return false;
  try {
    const res = await fetch('/api/verify', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!data.valid) {
      sessionStorage.removeItem(SESSION_KEY);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export async function login(password: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    if (data.success && data.token) {
      sessionStorage.setItem(SESSION_KEY, data.token);
      return { success: true };
    }
    return { success: false, error: data.error || 'Échec de connexion' };
  } catch (err) {
    return { success: false, error: 'Erreur réseau' };
  }
}

export function logout(): void {
  sessionStorage.removeItem(SESSION_KEY);
}

export function getToken(): string | null {
  return sessionStorage.getItem(SESSION_KEY);
}
