import React, { createContext, useContext, useEffect, useMemo } from "react";
import { useAuthStore } from "@/stores/authStore";

type AuthContextType = {
  user: ReturnType<typeof useAuthStore> extends any ? any : unknown;
  token: string | null;
  plan: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const plan = useAuthStore((s) => s.plan);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const login = useAuthStore((s) => s.login);
  const logout = useAuthStore((s) => s.logout);
  const refreshUser = useAuthStore((s) => s.refreshUser);

  // keep localStorage token and Zustand in sync if token changes elsewhere
  useEffect(() => {
    const t = localStorage.getItem("token");
    if (t && t !== token) {
      // update store token by hydrating
      useAuthStore.getState().hydrate();
    }
  }, [token]);

  const value = useMemo(
    () => ({ user, token, plan, isAuthenticated, isLoading, login, logout, refreshUser }),
    [user, token, plan, isAuthenticated, isLoading, login, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
  return ctx;
}

export default AuthContext;
