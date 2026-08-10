const BASE = '/api';

function getToken() { return localStorage.getItem('fp_token'); }

async function req(method: string, path: string, body?: unknown) {
  const r = await fetch(BASE + path, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (r.status === 401) { window.location.href = '/login'; }
  return r.json();
}

export const api = {
  get:    (p: string) => req('GET', p),
  post:   (p: string, b: unknown) => req('POST', p, b),
  put:    (p: string, b: unknown) => req('PUT', p, b),
  delete: (p: string) => req('DELETE', p),
};

export function exportarExcel() {
  window.open(`${BASE}/exportar?token=${getToken()}`);
}
