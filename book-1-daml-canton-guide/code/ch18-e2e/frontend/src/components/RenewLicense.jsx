// RenewLicense.jsx -- Renewal request form (from book Chapter 18)
//
// Allows customers to request renewals and vendors to approve them.
// Listed in the ch18 project structure: frontend/src/components/RenewLicense.tsx

import React, { useState } from "react";
import { renewLicense } from "../api.js";

export default function RenewLicense({ party, onRenewed }) {
  const [contractId, setContractId] = useState("");
  const [newExpiry, setNewExpiry] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setStatus(null);
    setSubmitting(true);

    const expiry = newExpiry
      ? new Date(newExpiry).toISOString()
      : null;

    if (!expiry) {
      setError("Please provide a new expiry date.");
      setSubmitting(false);
      return;
    }

    try {
      await renewLicense({
        vendor: party,
        contractId,
        newExpiry: expiry,
      });
      setStatus("License renewed successfully.");
      setContractId("");
      setNewExpiry("");
      if (onRenewed) onRenewed();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h2>Renew License</h2>
      <form onSubmit={handleSubmit}>
        <input
          value={contractId}
          onChange={(e) => setContractId(e.target.value)}
          placeholder="Contract ID"
          required
        />
        <input
          type="date"
          value={newExpiry}
          onChange={(e) => setNewExpiry(e.target.value)}
          placeholder="New expiry date"
          required
        />
        <button type="submit" disabled={submitting}>
          {submitting ? "Renewing..." : "Renew License"}
        </button>
      </form>
      {error && <p className="error">{error}</p>}
      {status && <p className="status">{status}</p>}
    </div>
  );
}
