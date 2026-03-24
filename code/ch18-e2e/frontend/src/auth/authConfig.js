// src/auth/authConfig.js -- Keycloak OIDC configuration (from book Chapter 17)
//
// OAuth2 Authorization Code flow with PKCE for browser-based apps.
// No client secret needed -- uses public client type.

import { UserManager } from "oidc-client-ts";

const KC_URL = "http://keycloak.localhost:8082";
const REALM = "AppUser";

export const userManager = new UserManager({
  authority:
    `${KC_URL}/realms/${REALM}`,
  client_id: "app-user-ui",
  redirect_uri:
    "http://localhost:3000/callback",
  response_type: "code",
  scope: "openid",
  automaticSilentRenew: true,
});
