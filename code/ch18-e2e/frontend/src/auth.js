// src/auth.js -- OAuth2 PKCE authentication (from book Chapter 17/18)
//
// In a production app, this would use oidc-client-ts with Keycloak.
// This simplified version shows the PKCE flow structure for educational purposes.
// The ch18 E2E frontend uses a simpler party-input approach for testing,
// but this module demonstrates the real auth flow from Chapter 17.

const KC_URL = "http://keycloak.localhost:8082";
const REALM = "AppUser";
const CLIENT_ID = "app-user-ui";
const REDIRECT_URI = "http://localhost:3000/callback";

/**
 * Generate a random code verifier for PKCE.
 */
function generateCodeVerifier() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/**
 * Generate the code challenge (SHA-256 hash of verifier).
 */
async function generateCodeChallenge(verifier) {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/**
 * Redirect to Keycloak login page with PKCE challenge.
 */
export async function login() {
  const verifier = generateCodeVerifier();
  const challenge = await generateCodeChallenge(verifier);

  // Store verifier for the callback
  sessionStorage.setItem("pkce_verifier", verifier);

  const authUrl = new URL(
    `${KC_URL}/realms/${REALM}/protocol/openid-connect/auth`
  );
  authUrl.searchParams.set("client_id", CLIENT_ID);
  authUrl.searchParams.set("redirect_uri", REDIRECT_URI);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", "openid");
  authUrl.searchParams.set("code_challenge", challenge);
  authUrl.searchParams.set("code_challenge_method", "S256");

  window.location.href = authUrl.toString();
}

/**
 * Exchange the authorization code for an access token.
 */
export async function handleCallback() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");
  const verifier = sessionStorage.getItem("pkce_verifier");

  if (!code || !verifier) return null;

  const tokenUrl =
    `${KC_URL}/realms/${REALM}/protocol/openid-connect/token`;

  const resp = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      grant_type: "authorization_code",
      code,
      redirect_uri: REDIRECT_URI,
      code_verifier: verifier,
    }),
  });

  if (!resp.ok) return null;

  const data = await resp.json();
  sessionStorage.removeItem("pkce_verifier");

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
  };
}

/**
 * Redirect to Keycloak logout.
 */
export function logout() {
  const logoutUrl = new URL(
    `${KC_URL}/realms/${REALM}/protocol/openid-connect/logout`
  );
  logoutUrl.searchParams.set("post_logout_redirect_uri", "http://localhost:3000");
  logoutUrl.searchParams.set("client_id", CLIENT_ID);
  window.location.href = logoutUrl.toString();
}
