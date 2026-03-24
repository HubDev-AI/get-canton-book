// src/components/LicenseList.jsx -- Display active licenses (from book Chapter 17)

import React, {
  useEffect, useState
} from "react";
import { useAuth } from "../auth/AuthProvider.jsx";
import { getContracts } from "../api/ledgerClient.js";

export function LicenseList() {
  const { token, party } = useAuth();
  const [licenses, setLicenses] = useState([]);

  useEffect(() => {
    if (!token || !party) return;
    getContracts(
      token, party,
      "Main.License:License"
    ).then((data) =>
      setLicenses(Array.isArray(data) ? data : data.activeContracts || [])
    );
  }, [token, party]);

  return (
    <table>
      <thead>
        <tr>
          <th>Product</th>
          <th>Customer</th>
          <th>Expires</th>
        </tr>
      </thead>
      <tbody>
        {licenses.map((l) => (
          <tr key={l.contractId}>
            <td>{l.payload.product}</td>
            <td>{l.payload.customer}</td>
            <td>{l.payload.expiresAt}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
