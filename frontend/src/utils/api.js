// Use the VITE_API_URL env var if set, otherwise fall back to absolute localhost:8080.
// During `npm run dev` Vite also proxies /api → localhost:8080, but an absolute URL
// works in every other deployment scenario (static file server, Spring Boot, etc.).
const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8080') + '/api';

export async function apiPost(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res;
}

export async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`);
  return res;
}

export async function apiPut(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res;
}

export async function apiDelete(path) {
  const res = await fetch(`${API_BASE}${path}`, { method: 'DELETE' });
  return res;
}
