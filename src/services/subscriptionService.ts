// ─────────────────────────────────────────────────────────────────────────────

import api from "@/lib/api";
import type { SubscriptionDTO } from "@/types/models";

export const subscriptionService = {
  // GET /api/subscriptions/me
  async me(): Promise<SubscriptionDTO> {
    return (await api.get<SubscriptionDTO>("/api/subscriptions/me")).data;
  },
  // POST /api/subscriptions/checkout
  async checkout(priceId: string): Promise<{ sessionId: string; url: string }> {
    return (await api.post("/api/subscriptions/checkout", { priceId })).data;
  },
  // POST /api/subscriptions/cancel
  async cancel(): Promise<SubscriptionDTO> {
    return (await api.post<SubscriptionDTO>("/api/subscriptions/cancel")).data;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
