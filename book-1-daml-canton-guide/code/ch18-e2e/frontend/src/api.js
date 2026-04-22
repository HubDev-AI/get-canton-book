// api.js -- Backend API client
//
// In development, Vite proxies /api/* to the backend (see vite.config.js).
// In production, set VITE_BACKEND_URL to the backend origin.

const BASE = import.meta.env.VITE_BACKEND_URL || "";

async function request(path, options = {}) {
  const resp = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  const data = await resp.json();
  if (!resp.ok) {
    throw new Error(data.error || `Request failed (${resp.status})`);
  }
  return data;
}

/**
 * Create a new license.
 */
export function createLicense({ vendor, customer, product, expiresAt }) {
  return request("/api/licenses", {
    method: "POST",
    body: JSON.stringify({ vendor, customer, product, expiresAt }),
  });
}

/**
 * List active licenses for a party.
 */
export function listLicenses(party) {
  return request(`/api/licenses?party=${encodeURIComponent(party)}`);
}

/**
 * Renew a license.
 */
export function renewLicense({ vendor, contractId, newExpiry }) {
  return request("/api/licenses/renew", {
    method: "POST",
    body: JSON.stringify({ vendor, contractId, newExpiry }),
  });
}

/**
 * Revoke a license.
 */
export function revokeLicense({ vendor, contractId }) {
  return request("/api/licenses/revoke", {
    method: "POST",
    body: JSON.stringify({ vendor, contractId }),
  });
}
