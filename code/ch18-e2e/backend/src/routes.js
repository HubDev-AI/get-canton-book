// routes.js -- Express route definitions for the License API
import { Router } from "express";
import {
  createLicense,
  renewLicense,
  revokeLicense,
  listLicenses,
} from "./license-service.js";

const router = Router();

/**
 * POST /api/licenses
 * Create a new license.
 *
 * Body: { vendor, customer, product, expiresAt }
 */
router.post("/licenses", async (req, res, next) => {
  try {
    const { vendor, customer, product, expiresAt } = req.body;
    if (!vendor || !customer || !product || !expiresAt) {
      return res.status(400).json({
        error: "Required: vendor, customer, product, expiresAt",
      });
    }
    const result = await createLicense({ vendor, customer, product, expiresAt });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/licenses?party=...
 * List active licenses for a party.
 */
router.get("/licenses", async (req, res, next) => {
  try {
    const { party } = req.query;
    if (!party) {
      return res.status(400).json({ error: "Required query param: party" });
    }
    const result = await listLicenses(party);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/licenses/renew
 * Renew an existing license.
 *
 * Body: { vendor, contractId, newExpiry }
 */
router.post("/licenses/renew", async (req, res, next) => {
  try {
    const { vendor, contractId, newExpiry } = req.body;
    if (!vendor || !contractId || !newExpiry) {
      return res.status(400).json({
        error: "Required: vendor, contractId, newExpiry",
      });
    }
    const result = await renewLicense({ vendor, contractId, newExpiry });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/licenses/revoke
 * Revoke (archive) a license.
 *
 * Body: { vendor, contractId }
 */
router.post("/licenses/revoke", async (req, res, next) => {
  try {
    const { vendor, contractId } = req.body;
    if (!vendor || !contractId) {
      return res.status(400).json({
        error: "Required: vendor, contractId",
      });
    }
    const result = await revokeLicense({ vendor, contractId });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
