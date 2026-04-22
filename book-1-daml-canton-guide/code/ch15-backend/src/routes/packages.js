// routes/packages.js -- DAR upload and package listing
import { Router } from "express";
import multer from "multer";
import { uploadDar, listPackages } from "../ledger.js";
import { getToken } from "../auth.js";

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

/**
 * POST /api/packages
 * Upload a DAR file.
 * Expects multipart/form-data with a "dar" file field.
 */
router.post("/", upload.single("dar"), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No DAR file provided. Use field name 'dar'." });
    }
    const token = await getToken();
    const result = await uploadDar(token, req.file.buffer);
    res.json({ message: "DAR uploaded successfully", ...result });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/packages
 * List all uploaded package IDs.
 */
router.get("/", async (_req, res, next) => {
  try {
    const token = await getToken();
    const result = await listPackages(token);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
