// src/App.jsx -- Application shell (from book Chapter 17 / Chapter 18)
//
// Wraps the app in AuthProvider and renders license management components.

import React from "react";
import { AuthProvider, useAuth } from "./auth/AuthProvider.jsx";
import { LicenseList } from "./components/LicenseList.jsx";
import { CreateLicense } from "./components/CreateLicense.jsx";

function Main() {
  const { token, party, login, logout } = useAuth();

  if (!token) {
    return (
      <div>
        <h1>License Manager</h1>
        <button onClick={login}>Log In</button>
      </div>
    );
  }

  return (
    <div className="app">
      <h1>License Manager</h1>
      <p>
        Logged in as: {party}{" "}
        <button onClick={logout}>Log Out</button>
      </p>
      <CreateLicense />
      <LicenseList />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Main />
    </AuthProvider>
  );
}

export default App;
