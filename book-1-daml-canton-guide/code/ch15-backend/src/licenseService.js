// src/licenseService.js -- License operations (from book Chapter 15)
//
// Wraps ledger operations into business-level functions.

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
  const result = await submitCommand(
    token,
    [vendor],
    [{
      CreateCommand: {
        templateId: TEMPLATE,
        createArguments: {
          vendor,
          customer,
          product,
          expiresAt,
        },
      },
    }],
    `create-license-${randomUUID()}`
  );
  return result;
}

export async function listLicenses(
  token, party
) {
  const data = await getActiveContracts(
    token, party, TEMPLATE
  );
  return data;
}

export async function subscribeLicenses(
  token, party, onEvent
) {
  const url =
    `${process.env.LEDGER_API_URL}`
    + "/v2/updates/flats";
  const resp = await fetch(url, {
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
                templateId: TEMPLATE,
              }],
            }],
          },
        },
      },
      beginExclusive: 0,
    }),
  });
  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  while (true) {
    const { done, value } =
      await reader.read();
    if (done) break;
    const text = decoder.decode(value);
    for (const line of text.split("\n")) {
      if (line.startsWith("data:")) {
        onEvent(JSON.parse(line.slice(5)));
      }
    }
  }
}
