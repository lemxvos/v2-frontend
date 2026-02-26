// ─────────────────────────────────────────────────────────────────────────────

import api from "@/lib/api";
import type { AuthResponse, User } from "@/types/models";

export const authService = {
  async register(data: { username: string; email: string; password: string }): Promise<AuthResponse> {
    return (await api.post<AuthResponse>("/auth/register", data)).data;
  },
  async login(data: { email: string; password: string }): Promise<AuthResponse> {
    return (await api.post<AuthResponse>("/auth/login", data)).data;
  },
  async googleCallback(idToken: string): Promise<AuthResponse> {
    return (await api.post<AuthResponse>("/auth/google/callback", { idToken })).data;
  },
  async verifyEmail(token: string): Promise<void> {
    await api.get("/auth/verify", { params: { token } });
  },
  async me(): Promise<User> {
    return (await api.get<User>("/auth/me")).data;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
