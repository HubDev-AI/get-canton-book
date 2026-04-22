const BASE = '/api';
const TOKEN = 'dev-secret';

async function request(path, init = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  });
  const text = await res.text();
  const body = text ? JSON.parse(text) : null;
  if (!res.ok) {
    throw new Error(body?.error ?? `HTTP ${res.status}`);
  }
  return body;
}

export const api = {
  health: () => request('/health'),
  listInvoices: (role) => request(`/invoices?as=${role}`),
  createInvoice: (payload) =>
    request('/invoices', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  confirmInvoice: (cid) =>
    request(`/invoices/${encodeURIComponent(cid)}/confirm`, {
      method: 'POST',
    }),
  payInvoice: (cid) =>
    request(`/invoices/${encodeURIComponent(cid)}/pay`, {
      method: 'POST',
    }),
};
