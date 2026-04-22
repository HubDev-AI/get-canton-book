// routes/commands.js -- Command submission routes
import { Router } from "express";
import { createContract, exerciseChoice, submitAndWait } from "../ledger.js";
import { getToken } from "../auth.js";
import crypto from "node:crypto";

const router = Router();

/**
 * POST /api/commands/create
 * Create a contract on the ledger.
 *
 * Body: { actAs: string[], templateId: string, payload: object }
 */
router.post("/create", async (req, res, next) => {
  try {
    const { actAs, templateId, payload } = req.body;
    if (!actAs || !templateId || !payload) {
      return res.status(400).json({
        error: "Required fields: actAs (string[]), templateId (string), payload (object)",
      });
    }
    const token = await getToken();
    const result = await createContract(token, {
      actAs,
      templateId,
      payload,
      commandId: `create-${crypto.randomUUID()}`,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/commands/exercise
 * Exercise a choice on an existing contract.
 *
 * Body: { actAs: string[], templateId: string, contractId: string,
 *         choice: string, argument: object }
 */
router.post("/exercise", async (req, res, next) => {
  try {
    const { actAs, templateId, contractId, choice, argument } = req.body;
    if (!actAs || !templateId || !contractId || !choice) {
      return res.status(400).json({
        error: "Required fields: actAs, templateId, contractId, choice",
      });
    }
    const token = await getToken();
    const result = await exerciseChoice(token, {
      actAs,
      templateId,
      contractId,
      choice,
      argument: argument || {},
      commandId: `exercise-${crypto.randomUUID()}`,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/commands/submit
 * Submit raw commands (advanced). Sends the body directly to submit-and-wait.
 *
 * Body: { actAs: string[], commands: object[], commandId?: string }
 */
router.post("/submit", async (req, res, next) => {
  try {
    const { actAs, commands, commandId } = req.body;
    if (!actAs || !commands) {
      return res.status(400).json({
        error: "Required fields: actAs (string[]), commands (object[])",
      });
    }
    const token = await getToken();
    const result = await submitAndWait(token, {
      actAs,
      commands,
      commandId: commandId || `raw-${crypto.randomUUID()}`,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
