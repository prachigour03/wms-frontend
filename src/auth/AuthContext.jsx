import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { loginApi } from "../api/auth.api";

const AuthContext = createContext(null);

const parseJwt = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => `%${("00" + c.charCodeAt(0).toString(16)).slice(-2)}`)
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("currentUser");

    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        setPermissions(parsed.permissions || []);
      } catch {
        localStorage.removeItem("currentUser");
      }
    } else if (token) {
      const decoded = parseJwt(token);
      if (decoded) {
        const payloadUser = {
          id: decoded.id,
          email: decoded.email,
          role: decoded.role,
          permissions: decoded.permissions || [],
        };
        setUser(payloadUser);
        setPermissions(decoded.permissions || []);
        localStorage.setItem("currentUser", JSON.stringify(payloadUser));
      }
    }

    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await loginApi({ email, password });

    const { token, user: userData } = res;
    localStorage.setItem("token", token);
    localStorage.setItem("currentUser", JSON.stringify(userData));

    setUser(userData);
    setPermissions(userData?.permissions || []);

    return res;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("currentUser");
    setUser(null);
    setPermissions([]);
  }, []);

  const permissionSet = useMemo(() => {
    return new Set((permissions || []).map((p) => p.toLowerCase()));
  }, [permissions]);

  const hasPermission = useCallback(
    (permissionOrModule, action) => {
      if (!permissionOrModule) return true;
      if (user?.role?.toLowerCase() === "super admin") return true;

      const key = action
        ? `${permissionOrModule}:${action}`
        : permissionOrModule;

      return permissionSet.has(key.toLowerCase());
    },
    [permissionSet, user?.role]
  );

  const hasRole = useCallback(
    (role) => user?.role?.toLowerCase() === role?.toLowerCase(),
    [user?.role]
  );

  const value = useMemo(
    () => ({
      user,
      permissions,
      isAuthenticated: Boolean(user),
      loading,
      login,
      logout,
      hasPermission,
      hasRole,
    }),
    [user, permissions, loading, login, logout, hasPermission, hasRole]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
