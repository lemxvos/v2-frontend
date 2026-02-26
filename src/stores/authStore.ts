// ─────────────────────────────────────────────────────────────────────────────

import { create } from "zustand";
import { authService } from "@/services/authService";
import type { User } from "@/types/models";

interface AuthState {
  user: User | null;
  token: string | null;
  plan: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { username: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
  hydrate: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUser: (u: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem("token"),
  plan: null,
  isLoading: false,
  isAuthenticated: Boolean(localStorage.getItem("token")),

  login: async (email, password) => {
    set({ isLoading: true });
    const res = await authService.login({ email, password });
    localStorage.setItem("token", res.token);
    set({ token: res.token, isAuthenticated: true });
    const user = await authService.me();
    set({ user, plan: (user as any).plan || null });
    set({ isLoading: false });
  },

  register: async (data) => {
    set({ isLoading: true });
    const res = await authService.register(data);
    localStorage.setItem("token", res.token);
    set({ token: res.token, isAuthenticated: true });
    const user = await authService.me();
    set({ user, plan: (user as any).plan || null });
    set({ isLoading: false });
  },

  logout: () => {
    localStorage.removeItem("token");
    set({ user: null, token: null, plan: null, isAuthenticated: false });
  },

  hydrate: async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      set({ isLoading: true });
      const user = await authService.me();
      set({ user, token, plan: (user as any).plan || null, isAuthenticated: true });
    } catch {
      localStorage.removeItem("token");
      set({ user: null, token: null, plan: null, isAuthenticated: false });
    } finally {
      set({ isLoading: false });
    }
  },

  refreshUser: async () => {
    try {
      set({ isLoading: true });
      const user = await authService.me();
      set({ user, plan: (user as any).plan || null, isAuthenticated: true });
    } catch {
      localStorage.removeItem("token");
      set({ user: null, token: null, plan: null, isAuthenticated: false });
    } finally {
      set({ isLoading: false });
    }
  },

  updateUser: (u) => set((s) => ({ user: s.user ? { ...s.user, ...u } : null })),
}));

// ─────────────────────────────────────────────────────────────────────────────
