// src/auth/token.js
function base64UrlDecode(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  const pad = str.length % 4;
  if (pad) str += '='.repeat(4 - pad);
  return atob(str);
}

export function parseJwt(token) {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(base64UrlDecode(payload));
  } catch {
    return null;
  }
}

export function isTokenValid(token) {
  if (!token) return false;
  const payload = parseJwt(token);
  if (!payload || !payload.exp) return false;
  const nowSec = Math.floor(Date.now() / 1000);
  return payload.exp > nowSec; // 尚未過期
}
