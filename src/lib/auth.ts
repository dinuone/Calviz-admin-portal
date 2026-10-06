export interface AdminUser {
  username: string;
}

export const ADMIN_TOKEN_KEY = "calviz_admin_token";
export const ADMIN_USER_KEY = "calviz_admin_user";

export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function setAdminToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
}

export function removeAdminToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(ADMIN_USER_KEY);
  localStorage.removeItem("calviz_admin_expires");
}

export function getAdminUser(): AdminUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(ADMIN_USER_KEY);
  if (!raw) return null;
  try {
    if (raw.startsWith("{")) {
      return JSON.parse(raw);
    }
    return { username: raw };
  } catch {
    return { username: raw };
  }
}

export function setAdminUser(user: AdminUser | string) {
  if (typeof window === "undefined") return;
  const val = typeof user === "string" ? JSON.stringify({ username: user }) : JSON.stringify(user);
  localStorage.setItem(ADMIN_USER_KEY, val);
}

export function setAdminSession(token: string, username: string, expiresAt?: string) {
  if (typeof window === "undefined") return;
  setAdminToken(token);
  setAdminUser({ username });
  if (expiresAt) {
    localStorage.setItem("calviz_admin_expires", expiresAt);
  }
}

export function clearAdminSession() {
  removeAdminToken();
}

export function isAdminAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem(ADMIN_TOKEN_KEY);
}
