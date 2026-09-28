// Thin wrapper around localStorage so the storage key/shape only lives in
// one place, and every consumer stays agnostic of how the session is
// actually persisted (a real production build might swap this for an
// httpOnly-cookie based session instead).
const TOKEN_KEY = "zerodha_clone_token";
const USER_KEY = "zerodha_clone_user";

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const getStoredUser = () => {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
};

export const setSession = (token, user) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const isAuthenticated = () => Boolean(getToken());
