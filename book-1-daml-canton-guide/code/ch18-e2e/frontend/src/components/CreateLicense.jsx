// CreateLicense.jsx -- Form to create a new license
import React, { useState } from "react";
import { createLicense } from "../api.js";

export default function CreateLicense({ party, onCreated }) {
  const [customer, setCustomer] = useState("");
  const [product, setProduct] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(null);

  // Default expiry: 1 year from now
  const defaultExpiry = () => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().slice(0, 10); // YYYY-MM-DD
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setStatus(null);
    setSubmitting(true);

    // Normalize the date to full ISO 8601
    const expiry = expiresAt
      ? new Date(expiresAt).toISOString()
      : new Date(defaultExpiry()).toISOString();

    try {
      await createLicense({
        vendor: party,
        customer,
        product,
        expiresAt: expiry,
      });
      setStatus("License created successfully.");
      setCustomer("");
      setProduct("");
      setExpiresAt("");
      if (onCreated) onCreated();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h2>Create License</h2>
      <form onSubmit={handleSubmit}>
        <input
          value={product}
          onChange={(e) => setProduct(e.target.value)}
          placeholder="Product name"
          required
        />
        <input
          value={customer}
          onChange={(e) => setCustomer(e.target.value)}
          placeholder="Customer party ID"
          required
        />
        <input
          type="date"
          value={expiresAt}
          onChange={(e) => setExpiresAt(e.target.value)}
          placeholder="Expiry date"
        />
        <button type="submit" disabled={submitting}>
          {submitting ? "Creating..." : "Create License"}
        </button>
      </form>
      {error && <p className="error">{error}</p>}
      {status && <p className="status">{status}</p>}
    </div>
  );
}
