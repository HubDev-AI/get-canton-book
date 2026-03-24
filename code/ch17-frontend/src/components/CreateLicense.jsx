// src/components/CreateLicense.jsx -- License creation form (from book Chapter 17)

import React, { useState } from "react";
import { useAuth } from "../auth/AuthProvider.jsx";
import { createLicense } from "../api/ledgerClient.js";

export function CreateLicense() {
  const { token, party } = useAuth();
  const [product, setProduct] = useState("");
  const [customer, setCustomer] = useState("");

  const handleSubmit = async () => {
    if (!token || !party) return;
    await createLicense(token, party, {
      vendor: party,
      customer,
      product,
      expiresAt: "2027-12-31T00:00:00Z",
    });
    setProduct("");
    setCustomer("");
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleSubmit();
    }}>
      <input
        value={product}
        onChange={
          (e) => setProduct(e.target.value)
        }
        placeholder="Product name"
      />
      <input
        value={customer}
        onChange={
          (e) => setCustomer(e.target.value)
        }
        placeholder="Customer party"
      />
      <button type="submit">
        Create License
      </button>
    </form>
  );
}
