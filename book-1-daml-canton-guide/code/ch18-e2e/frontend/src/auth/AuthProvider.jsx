// src/auth/AuthProvider.jsx -- React auth context (from book Chapter 17/18)
//
// Wraps oidc-client-ts UserManager in a React context so any component
// can access the current token, party, and login/logout functions.

import React, {
  createContext, useContext,
  useEffect, useState
} from "react";
import { userManager } from "./authConfig.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [party, setParty] = useState(null);

  useEffect(() => {
    userManager.getUser().then((user) => {
      if (user && !user.expired) {
        setToken(user.access_token);
        setParty(
          user.profile.act_as?.[0] ?? null
        );
      }
    });
  }, []);

  const login = () =>
    userManager.signinRedirect();
  const logout = () =>
    userManager.signoutRedirect();

  return (
    <AuthContext.Provider
      value={{ token, party, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () =>
  useContext(AuthContext);
