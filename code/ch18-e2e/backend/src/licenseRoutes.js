// src/licenseRoutes.js -- Express routes (from book Chapter 18)
//
// REST endpoint handlers matching the book's code listing exactly.

import { Router } from "express";
import {
  createLicense,
  renewLicense,
  listLicenses,
} from "./licenseService.js";

export const licenseRoutes = Router();

licenseRoutes.post("/", async (req, res) => {
  try {
    const {
      vendor, customer, product, expiresAt
    } = req.body;
    const token =
      req.headers.authorization
        ?.split(" ")[1];
    const result = await createLicense(
      token, vendor, customer,
      product, expiresAt
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

licenseRoutes.get("/", async (req, res) => {
  try {
    const { party } = req.query;
    const token =
      req.headers.authorization
        ?.split(" ")[1];
    const data = await listLicenses(
      token, party
    );
    res.json(data);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

licenseRoutes.post(
  "/renew", async (req, res) => {
  try {
    const {
      vendor, contractId, newExpiry
    } = req.body;
    const token =
      req.headers.authorization
        ?.split(" ")[1];
    const result = await renewLicense(
      token, vendor, contractId, newExpiry
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});
