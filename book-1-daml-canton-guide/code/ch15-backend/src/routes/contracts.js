// routes/contracts.js -- Contract query routes
import { Router } from "express";
import { getActiveContracts, listParties, allocateParty } from "../ledger.js";
import { getToken } from "../auth.js";

const router = Router();

/**
 * POST /api/contracts/active
 * Query active contracts for a party.
 *
 * Body: { party: string, templateId?: string }
 */
router.post("/active", async (req, res, next) => {
  try {
    const { party, templateId } = req.body;
    if (!party) {
      return res.status(400).json({ error: "Required field: party (string)" });
    }
    const token = await getToken();
    const result = await getActiveContracts(token, party, templateId);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/contracts/parties
 * List all known parties on the participant.
 */
router.get("/parties", async (_req, res, next) => {
  try {
    const token = await getToken();
    const result = await listParties(token);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/contracts/parties
 * Allocate a new party.
 *
 * Body: { partyIdHint: string }
 */
router.post("/parties", async (req, res, next) => {
  try {
    const { partyIdHint } = req.body;
    if (!partyIdHint) {
      return res.status(400).json({ error: "Required field: partyIdHint (string)" });
    }
    const token = await getToken();
    const result = await allocateParty(token, partyIdHint);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
