// index.js -- Express server entry point
//
// Chapter 18: End-to-End License Application -- Backend
//
// Usage:
//   cp ../.env.example .env   # or create your own
//   npm install
//   npm start

import "dotenv/config";
import express from "express";
import routes from "./routes.js";

const app = express();
const PORT = process.env.BACKEND_PORT || process.env.PORT || 4000;

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------
app.use(express.json());

// CORS -- allow the Vite frontend dev server
app.use((_req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (_req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

// ---------------------------------------------------------------------------
// Health check
// ---------------------------------------------------------------------------
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "ch18-license-backend",
    ledgerApiUrl: process.env.LEDGER_API_URL || "http://localhost:3975",
  });
});

// ---------------------------------------------------------------------------
// API routes
// ---------------------------------------------------------------------------
app.use("/api", routes);

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
  console.log(`ch18-license-backend listening on http://localhost:${PORT}`);
  console.log(`Ledger API: ${process.env.LEDGER_API_URL || "http://localhost:3975"}`);
});
