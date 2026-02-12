const KEY_TOKEN = "natakahii_admin_token";
const KEY_USER = "natakahii_admin_user";

export function setToken(token) {
  localStorage.setItem(KEY_TOKEN, token);
}
export function getToken() {
  return localStorage.getItem(KEY_TOKEN);
}
export function clearToken() {
  localStorage.removeItem(KEY_TOKEN);
}

export function setUser(user) {
  localStorage.setItem(KEY_USER, JSON.stringify(user));
}
export function getUser() {
  const raw = localStorage.getItem(KEY_USER);
  return raw ? JSON.parse(raw) : null;
}
export function clearUser() {
  localStorage.removeItem(KEY_USER);
}

export function clearAuthStorage() {
  clearToken();
  clearUser();
}
