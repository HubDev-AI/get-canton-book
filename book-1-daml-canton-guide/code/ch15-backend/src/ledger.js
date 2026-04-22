// ledger.js -- Ledger API client (JSON API)
//
// Thin wrapper around Canton's JSON Ledger API endpoints.
// All methods accept an OAuth2 bearer token and return parsed JSON.

const LEDGER_URL = () => process.env.LEDGER_API_URL || "http://localhost:3975";

/**
 * Helper: make an authenticated request to the Ledger API.
 */
async function ledgerFetch(path, token, options = {}) {
  const url = `${LEDGER_URL()}${path}`;
  const resp = await fetch(url, {
    ...options,
    headers: {
      "Authorization": `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!resp.ok) {
    const body = await resp.text();
    const err = new Error(`Ledger API ${path} failed (${resp.status}): ${body}`);
    err.status = resp.status;
    throw err;
  }

  // Some endpoints (e.g. package upload) may return empty body
  const text = await resp.text();
  return text ? JSON.parse(text) : {};
}

// ---------------------------------------------------------------------------
// Packages
// ---------------------------------------------------------------------------

/**
 * Upload a DAR file (as a Buffer) to the participant.
 */
export async function uploadDar(token, darBuffer) {
  return ledgerFetch("/v2/packages", token, {
    method: "POST",
    headers: { "Content-Type": "application/octet-stream" },
    body: darBuffer,
  });
}

/**
 * List all uploaded package IDs.
 */
export async function listPackages(token) {
  return ledgerFetch("/v2/packages", token);
}

// ---------------------------------------------------------------------------
// Commands
// ---------------------------------------------------------------------------

/**
 * Submit a command and wait for the transaction result.
 *
 * @param {string} token     - Bearer token
 * @param {string[]} actAs   - Parties to act as
 * @param {object[]} commands - Array of CreateCommand / ExerciseCommand objects
 * @param {string} commandId - Unique command ID for deduplication
 * @param {string} [applicationId] - Application identifier
 */
export async function submitAndWait(token, { actAs, commands, commandId, applicationId = "ch15-backend" }) {
  return ledgerFetch("/v2/commands/submit-and-wait", token, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ commands, actAs, commandId, applicationId }),
  });
}

/**
 * Convenience: create a contract.
 */
export async function createContract(token, { actAs, templateId, payload, commandId }) {
  return submitAndWait(token, {
    actAs,
    commandId,
    commands: [{
      CreateCommand: {
        templateId,
        createArguments: payload,
      },
    }],
  });
}

/**
 * Convenience: exercise a choice on an existing contract.
 */
export async function exerciseChoice(token, { actAs, templateId, contractId, choice, argument, commandId }) {
  return submitAndWait(token, {
    actAs,
    commandId,
    commands: [{
      ExerciseCommand: {
        templateId,
        contractId,
        choice,
        choiceArgument: argument,
      },
    }],
  });
}

// ---------------------------------------------------------------------------
// Active Contracts
// ---------------------------------------------------------------------------

/**
 * Query active contracts for a party, optionally filtered by template.
 *
 * @param {string} token
 * @param {string} party
 * @param {string} [templateId] - e.g. "Main.License:License"
 */
export async function getActiveContracts(token, party, templateId) {
  const templateFilters = templateId
    ? [{ templateId }]
    : [];

  const filter = {
    filtersByParty: {
      [party]: {
        cumulative: [{
          templateFilters,
        }],
      },
    },
  };

  return ledgerFetch("/v2/state/active-contracts", token, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filter }),
  });
}

// ---------------------------------------------------------------------------
// Parties
// ---------------------------------------------------------------------------

/**
 * List all known parties on the participant.
 */
export async function listParties(token) {
  return ledgerFetch("/v2/parties", token);
}

/**
 * Allocate a new party.
 */
export async function allocateParty(token, partyIdHint) {
  return ledgerFetch("/v2/parties", token, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ partyIdHint }),
  });
}
