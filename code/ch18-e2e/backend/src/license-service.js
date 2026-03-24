// src/licenseService.js -- License operations via the JSON Ledger API
//
// Chapter 18: End-to-End License Application
// Each method maps a business operation to a Ledger API call.

import { randomUUID } from "node:crypto";
import {
  submitCommand,
  getActiveContracts,
} from "./ledgerClient.js";

const TEMPLATE =
  "Main.License:License";

// ---------------------------------------------------------------------------
// Token management (client_credentials)
// ---------------------------------------------------------------------------

let cachedToken = null;
let tokenExpiresAt = 0;

export async function getToken() {
  const now = Date.now();
  if (cachedToken && now < tokenExpiresAt) {
    return cachedToken;
  }

  const { KEYCLOAK_URL, KEYCLOAK_REALM, KEYCLOAK_CLIENT_ID, KEYCLOAK_CLIENT_SECRET } = process.env;
  const tokenUrl =
    `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token`;

  const resp = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: KEYCLOAK_CLIENT_ID,
      client_secret: KEYCLOAK_CLIENT_SECRET,
      grant_type: "client_credentials",
      scope: "openid",
    }),
  });

  if (!resp.ok) {
    throw new Error(`Keycloak token error (${resp.status}): ${await resp.text()}`);
  }

  const data = await resp.json();
  cachedToken = data.access_token;
  tokenExpiresAt = now + (data.expires_in - 30) * 1000;
  return cachedToken;
}

// ---------------------------------------------------------------------------
// License operations
// ---------------------------------------------------------------------------

/**
 * Create a new License contract.
 */
export async function createLicense({ vendor, customer, product, expiresAt }) {
  const token = await getToken();
  return submitCommand(
    token,
    [vendor],
    [{
      CreateCommand: {
        templateId: TEMPLATE,
        createArguments: {
          vendor,
          customer,
          product,
          issuedAt: new Date().toISOString(),
          expiresAt,
        },
      },
    }],
    `create-license-${randomUUID()}`
  );
}

/**
 * Renew an existing license (extend its expiry).
 */
export async function renewLicense({ vendor, contractId, newExpiry }) {
  const token = await getToken();
  return submitCommand(
    token,
    [vendor],
    [{
      ExerciseCommand: {
        templateId: TEMPLATE,
        contractId,
        choice: "Renew",
        choiceArgument: { newExpiry },
      },
    }],
    `renew-license-${randomUUID()}`
  );
}

/**
 * Revoke (archive) a license.
 */
export async function revokeLicense({ vendor, contractId }) {
  const token = await getToken();
  return submitCommand(
    token,
    [vendor],
    [{
      ExerciseCommand: {
        templateId: TEMPLATE,
        contractId,
        choice: "Revoke",
        choiceArgument: {},
      },
    }],
    `revoke-license-${randomUUID()}`
  );
}

/**
 * List all active License contracts visible to a party.
 */
export async function listLicenses(party) {
  const token = await getToken();
  return getActiveContracts(
    token, party, TEMPLATE
  );
}
