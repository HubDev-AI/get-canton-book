// index.js -- Express server entry point
//
// Chapter 15: Ledger API and Backend Services
// A minimal Express.js backend that proxies requests to Canton's JSON Ledger API.
//
// Usage:
//   cp .env.example .env   # fill in your values
//   npm install
//   npm start

import "dotenv/config";
import express from "express";
import { licenseRoutes } from "./licenseRoutes.js";
import packagesRouter from "./routes/packages.js";
import commandsRouter from "./routes/commands.js";
import contractsRouter from "./routes/contracts.js";

const app = express();
const PORT = process.env.PORT || 8080;

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------
app.use(express.json());

// CORS -- allow frontend dev servers
app.use((_req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

// ---------------------------------------------------------------------------
// Health check
// ---------------------------------------------------------------------------
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    ledgerApiUrl: process.env.LEDGER_API_URL || "http://localhost:3975",
  });
});

// ---------------------------------------------------------------------------
// Routes -- book Chapter 15 license endpoints
// ---------------------------------------------------------------------------
app.use("/api/licenses", licenseRoutes);

// ---------------------------------------------------------------------------
// Routes -- extended API (packages, commands, contracts)
// ---------------------------------------------------------------------------
app.use("/api/packages", packagesRouter);
app.use("/api/commands", commandsRouter);
app.use("/api/contracts", contractsRouter);

// ---------------------------------------------------------------------------
// Error handler
// ---------------------------------------------------------------------------
app.use((err, _req, res, _next) => {
  console.error("[error]", err.message);
  const status = err.status || 500;
  res.status(status).json({ error: err.message });
});

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`ch15-backend listening on http://localhost:${PORT}`);
  console.log(`Ledger API: ${process.env.LEDGER_API_URL || "http://localhost:3975"}`);
});
