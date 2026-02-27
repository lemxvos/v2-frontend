import api from "@/lib/api";

export const accountService = {
  async update(data: { username?: string; email?: string }): Promise<void> {
    await api.patch("/api/account/me", data);
  },
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.post("/api/account/password/change", { currentPassword, newPassword });
  },
  async forgot(email: string): Promise<void> {
    await api.post("/api/account/password/forgot", { email });
  },
  async reset(token: string, newPassword: string): Promise<void> {
    await api.post("/api/account/password/reset", { token, newPassword });
  },
};
