// src/licenseService.js -- License operations (from book Chapter 18)
//
// Maps REST operations to JSON Ledger API calls.
// Matches the code listing in the book exactly.

import { randomUUID } from "node:crypto";
import {
  submitCommand,
  getActiveContracts,
} from "./ledgerClient.js";

const TEMPLATE =
  "Main.License:License";

export async function createLicense(
  token, vendor, customer,
  product, expiresAt
) {
  return submitCommand(
    token,
    [vendor],
    [{
      CreateCommand: {
        templateId: TEMPLATE,
        createArguments: {
          vendor, customer, product,
          issuedAt: new Date().toISOString(),
          expiresAt,
        },
      },
    }],
    `create-license-${randomUUID()}`
  );
}

export async function renewLicense(
  token, vendor, contractId, newExpiry
) {
  return submitCommand(
    token,
    [vendor],
    [{
      ExerciseCommand: {
        templateId: TEMPLATE,
        contractId,
        choice: "Renew",
        choiceArgument: {
          newExpiry,
        },
      },
    }],
    `renew-license-${randomUUID()}`
  );
}

export async function listLicenses(
  token, party
) {
  return getActiveContracts(
    token, party, TEMPLATE
  );
}
