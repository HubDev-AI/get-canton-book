// src/licenseRoutes.js -- REST API routes (from book Chapter 15)
//
// Express route handlers that expose license operations as REST endpoints.

import { Router } from "express";
import {
  createLicense,
  listLicenses,
} from "./licenseService.js";

export const licenseRoutes = Router();

licenseRoutes.post("/", async (req, res) => {
  try {
    const {
      vendor, customer, product, expiresAt
    } = req.body;
    const token =
      req.headers.authorization?.split(" ")[1];
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
      req.headers.authorization?.split(" ")[1];
    const data =
      await listLicenses(token, party);
    res.json(data);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});
