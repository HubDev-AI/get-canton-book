// Canton Invoice backend.
// Serves a small REST API that talks to each participant's
// JSON Ledger API. Routes are party-aware: the 'x-party-role'
// header selects which participant (supplier / buyer / factor)
// the request is routed to.

import express from "express";
import { LedgerClient } from "./ledger.js";

const AUTH_SECRET = process.env.API_SECRET ?? "dev-secret";

// Resolve party string (Supplier::hash) from the supplier's
// participant --- it knows everyone.
async function resolveParties() {
  const lookup = new LedgerClient({ port: 5013, party: null });
  const { partyDetails } = await lookup.listParties();
  const byPrefix = (pfx) =>
    partyDetails.find((p) => p.party.startsWith(pfx))?.party;
  return {
    supplier: byPrefix("Supplier::"),
    buyer: byPrefix("Buyer::"),
    factor: byPrefix("Factor::"),
  };
}

const PORTS = {
  supplier: 5013,
  buyer: 5023,
  factor: 5033,
};

const T_INVOICE = "#invoice-app:Invoice:Invoice";

// Boot
const parties = await resolveParties();
console.log("Resolved parties:", parties);
for (const [role, _port] of Object.entries(PORTS)) {
  if (!parties[role]) {
    throw new Error(`Missing party for role ${role}`);
  }
}

function clientFor(role) {
  return new LedgerClient({
    port: PORTS[role],
    party: parties[role],
  });
}

const app = express();
app.use(express.json());

// Shared-secret auth.
app.use((req, res, next) => {
  if (req.path === "/health") return next();
  const auth = req.headers.authorization ?? "";
  if (auth !== `Bearer ${AUTH_SECRET}`) {
    return res.status(401).json({ error: "unauthorized" });
  }
  next();
});

app.get("/health", (_req, res) => res.json({ ok: true, parties }));

// --- Invoices ---

app.post("/invoices", async (req, res, next) => {
  try {
    const { invoiceNumber, amount, currency, dueDate } = req.body;
    if (!invoiceNumber || !amount || !currency || !dueDate) {
      return res.status(400).json({
        error: "invoiceNumber, amount, currency, dueDate required",
      });
    }
    const supplier = clientFor("supplier");
    const created = await supplier.create(
      T_INVOICE,
      {
        supplier: parties.supplier,
        buyer: parties.buyer,
        invoiceNumber,
        amount: String(amount),
        currency,
        dueDate,
        status: "Draft",
      },
      `create-inv-${Date.now()}`,
    );
    res.json({
      contractId: created.contractId,
      invoiceNumber,
    });
  } catch (err) {
    next(err);
  }
});

app.get("/invoices", async (req, res, next) => {
  try {
    const role = req.query.as ?? "supplier";
    if (!(role in PORTS)) {
      return res.status(400).json({ error: `unknown role ${role}` });
    }
    const client = clientFor(role);
    const acs = await client.activeContracts(T_INVOICE);
    res.json(acs);
  } catch (err) {
    next(err);
  }
});

app.post("/invoices/:cid/confirm", async (req, res, next) => {
  try {
    const buyer = clientFor("buyer");
    const tx = await buyer.exercise(
      T_INVOICE,
      req.params.cid,
      "Confirm",
      {},
      `confirm-${Date.now()}`,
    );
    res.json({ updateId: tx.updateId });
  } catch (err) {
    next(err);
  }
});

app.post("/invoices/:cid/pay", async (req, res, next) => {
  try {
    const buyer = clientFor("buyer");
    const tx = await buyer.exercise(
      T_INVOICE,
      req.params.cid,
      "Pay",
      {},
      `pay-${Date.now()}`,
    );
    res.json({ updateId: tx.updateId });
  } catch (err) {
    next(err);
  }
});

// Error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});

const PORT = Number(process.env.PORT ?? 4000);
app.listen(PORT, () => {
  console.log(`Invoice API listening on http://localhost:${PORT}`);
});
