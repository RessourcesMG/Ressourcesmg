/**
 * Authentification webmaster : mot de passe vérifié côté serveur uniquement.
 * Aucun mot de passe n'est stocké ou exposé dans le code client.
 */

const SESSION_KEY = 'ressourcesmg_webmaster_token';
const RATE_LIMIT_KEY = 'ressourcesmg_webmaster_rate';
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

export interface RateLimitStatus {
  locked: boolean;
  remainingAttempts: number;
  lockoutEndsAt: number | null;
}

export function getRateLimitStatus(): RateLimitStatus {
  try {
    const raw = localStorage.getItem(RATE_LIMIT_KEY);
    if (!raw) return { locked: false, remainingAttempts: MAX_ATTEMPTS, lockoutEndsAt: null };
    const data = JSON.parse(raw);
    const now = Date.now();
    if (data.lockedUntil && data.lockedUntil > now) {
      return {
        locked: true,
        remainingAttempts: 0,
        lockoutEndsAt: data.lockedUntil,
      };
    }
    if (data.lockedUntil && data.lockedUntil <= now) {
      localStorage.removeItem(RATE_LIMIT_KEY);
      return { locked: false, remainingAttempts: MAX_ATTEMPTS, lockoutEndsAt: null };
    }
    return {
      locked: false,
      remainingAttempts: Math.max(0, MAX_ATTEMPTS - (data.attempts || 0)),
      lockoutEndsAt: null,
    };
  } catch {
    return { locked: false, remainingAttempts: MAX_ATTEMPTS, lockoutEndsAt: null };
  }
}

function recordFailedAttempt(): void {
  try {
    const raw = localStorage.getItem(RATE_LIMIT_KEY);
    const now = Date.now();
    let data = raw ? JSON.parse(raw) : { attempts: 0 };
    data.attempts = (data.attempts || 0) + 1;
    if (data.attempts >= MAX_ATTEMPTS) {
      data.lockedUntil = now + LOCKOUT_MS;
    }
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(data));
  } catch {
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify({ attempts: 1, lockedUntil: Date.now() + LOCKOUT_MS }));
  }
}

function clearRateLimit(): void {
  localStorage.removeItem(RATE_LIMIT_KEY);
}

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
  const status = getRateLimitStatus();
  if (status.locked && status.lockoutEndsAt) {
    const mins = Math.ceil((status.lockoutEndsAt - Date.now()) / 60000);
    return { success: false, error: `Trop de tentatives. Réessayez dans ${mins} minute(s).` };
  }
  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    if (data.success && data.token) {
      clearRateLimit();
      sessionStorage.setItem(SESSION_KEY, data.token);
      return { success: true };
    }
    recordFailedAttempt();
    return { success: false, error: data.error || 'Échec de connexion' };
  } catch {
    return { success: false, error: 'Erreur réseau' };
  }
}

export function logout(): void {
  sessionStorage.removeItem(SESSION_KEY);
}

export function getToken(): string | null {
  return sessionStorage.getItem(SESSION_KEY);
}
