// LicenseList.jsx -- Display active licenses and allow renew/revoke
import React, { useEffect, useState } from "react";
import { listLicenses, renewLicense, revokeLicense } from "../api.js";

export default function LicenseList({ party, refreshKey }) {
  const [licenses, setLicenses] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch licenses whenever party or refreshKey changes
  useEffect(() => {
    if (!party) return;
    setLoading(true);
    setError(null);
    listLicenses(party)
      .then((data) => {
        // The ACS response may wrap contracts in different shapes.
        // Normalize to an array of { contractId, payload } objects.
        const contracts = Array.isArray(data)
          ? data
          : data.activeContracts || data.contracts || [];
        setLicenses(contracts);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [party, refreshKey]);

  const handleRenew = async (contractId) => {
    const newExpiry = prompt(
      "New expiry (ISO 8601, e.g. 2028-01-01T00:00:00Z):"
    );
    if (!newExpiry) return;
    try {
      await renewLicense({ vendor: party, contractId, newExpiry });
      // Trigger refresh
      setLicenses((prev) => prev.filter((l) => l.contractId !== contractId));
    } catch (err) {
      alert(`Renew failed: ${err.message}`);
    }
  };

  const handleRevoke = async (contractId) => {
    if (!confirm("Revoke this license?")) return;
    try {
      await revokeLicense({ vendor: party, contractId });
      setLicenses((prev) => prev.filter((l) => l.contractId !== contractId));
    } catch (err) {
      alert(`Revoke failed: ${err.message}`);
    }
  };

  return (
    <div>
      <h2>Active Licenses</h2>
      {error && <p className="error">{error}</p>}
      {loading && <p>Loading...</p>}
      {!loading && licenses.length === 0 && <p>No active licenses found.</p>}
      {licenses.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Customer</th>
              <th>Expires</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {licenses.map((l) => {
              const p = l.payload || l;
              const cid = l.contractId || l.contract_id;
              return (
                <tr key={cid}>
                  <td>{p.product}</td>
                  <td>{p.customer}</td>
                  <td>{p.expiresAt}</td>
                  <td>
                    <button onClick={() => handleRenew(cid)}>Renew</button>{" "}
                    <button
                      onClick={() => handleRevoke(cid)}
                      style={{ background: "#dc2626" }}
                    >
                      Revoke
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
