// App.jsx -- Application shell
//
// Chapter 18: End-to-End License Application -- Frontend
// A simple React app for managing Daml License contracts.

import React, { useState, useCallback } from "react";
import LicenseList from "./components/LicenseList.jsx";
import CreateLicense from "./components/CreateLicense.jsx";

export default function App() {
  // In a real app the party comes from Keycloak authentication.
  // For this educational example we let the user type it in.
  const [party, setParty] = useState("");
  // Bump this counter to trigger a refresh in LicenseList
  const [refreshKey, setRefreshKey] = useState(0);

  const onCreated = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  return (
    <div>
      <h1>License Manager</h1>

      <label>
        Acting as party:{" "}
        <input
          value={party}
          onChange={(e) => setParty(e.target.value)}
          placeholder="e.g. app-provider::1220abcd..."
          style={{ width: "350px" }}
        />
      </label>

      {party && (
        <>
          <CreateLicense party={party} onCreated={onCreated} />
          <LicenseList party={party} refreshKey={refreshKey} />
        </>
      )}

      {!party && (
        <p style={{ marginTop: "2rem", color: "#666" }}>
          Enter a party identifier above to get started.
        </p>
      )}
    </div>
  );
}
