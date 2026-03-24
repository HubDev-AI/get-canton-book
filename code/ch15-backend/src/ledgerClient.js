// src/ledgerClient.js -- Ledger API client (from book Chapter 15)
//
// Wraps JSON Ledger API calls: command submission and active contract queries.

const BASE = process.env.LEDGER_API_URL;

export async function submitCommand(
  token, actAs, commands, commandId
) {
  const resp = await fetch(
    `${BASE}/v2/commands/submit-and-wait`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        commands,
        actAs,
        commandId,
        applicationId: "license-app",
      }),
    }
  );
  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(
      `Ledger error ${resp.status}: ${err}`
    );
  }
  return resp.json();
}

export async function getActiveContracts(
  token, party, templateId
) {
  const resp = await fetch(
    `${BASE}/v2/state/active-contracts`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
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
  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(
      `ACS error ${resp.status}: ${err}`
    );
  }
  return resp.json();
}
