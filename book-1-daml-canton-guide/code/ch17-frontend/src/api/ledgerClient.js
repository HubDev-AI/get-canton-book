// src/api/ledgerClient.js -- JSON Ledger API client (from book Chapter 17)
//
// Direct frontend-to-ledger communication over HTTP.
// All functions require an OAuth2 bearer token from Keycloak.

const BASE_URL = "http://localhost:3975";

export async function submitCommand(
  token, actAs, commands, commandId
) {
  return fetch(
    `${BASE_URL}/v2/commands/submit-and-wait`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        commands,
        actAs,
        commandId,
        applicationId: "license-app",
      }),
    }
  );
}

// Create a license
export async function createLicense(
  token, party, license
) {
  return submitCommand(
    token,
    [party],
    [{
      CreateCommand: {
        templateId: "Main.License:License",
        createArguments: license,
      },
    }],
    `create-license-${Date.now()}`
  );
}

// Fetch active contracts
export async function getContracts(
  token, party, templateId
) {
  const resp = await fetch(
    `${BASE_URL}/v2/state/active-contracts`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        filter: {
          filtersByParty: {
            [party]: {
              cumulative: [{
                templateFilters: [{
                  templateId,
                }],
              }],
            },
          },
        },
      }),
    }
  );
  const data = await resp.json();
  return data || [];
}
