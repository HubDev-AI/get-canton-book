// auth.js -- OAuth2/Keycloak token management
//
// Obtains service-account tokens via client_credentials grant.
// Caches the token and refreshes it before expiry.

let cachedToken = null;
let tokenExpiresAt = 0;

/**
 * Fetch an OAuth2 access token from Keycloak.
 * Uses client_credentials grant (backend service account).
 * Tokens are cached and refreshed 30 s before expiry.
 */
export async function getToken() {
  const now = Date.now();
  if (cachedToken && now < tokenExpiresAt) {
    return cachedToken;
  }

  const {
    KEYCLOAK_URL, KEYCLOAK_REALM,
    CLIENT_ID, CLIENT_SECRET,
    // Also support prefixed variants for backwards compat
    KEYCLOAK_CLIENT_ID, KEYCLOAK_CLIENT_SECRET,
  } = process.env;

  const tokenUrl =
    `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token`;

  const body = new URLSearchParams({
    client_id: CLIENT_ID || KEYCLOAK_CLIENT_ID,
    client_secret: CLIENT_SECRET || KEYCLOAK_CLIENT_SECRET,
    grant_type: "client_credentials",
    scope: "openid",
  });

  const resp = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Keycloak token request failed (${resp.status}): ${text}`);
  }

  const data = await resp.json();
  cachedToken = data.access_token;
  // Refresh 30 s before actual expiry
  tokenExpiresAt = now + (data.expires_in - 30) * 1000;

  return cachedToken;
}

/**
 * Clear the cached token (e.g. after a 401 from the Ledger API).
 */
export function clearToken() {
  cachedToken = null;
  tokenExpiresAt = 0;
}
