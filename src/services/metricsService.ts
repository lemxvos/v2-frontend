// ─────────────────────────────────────────────────────────────────────────────

import api from "@/lib/api";
import type { DashboardMetrics, EntityTimeline } from "@/types/models";

export const metricsService = {
  // GET /api/metrics/dashboard
  async dashboard(): Promise<DashboardMetrics> {
    return (await api.get<DashboardMetrics>("/api/metrics/dashboard")).data;
  },
  // GET /api/metrics/entities/:entityId/timeline
  async timeline(entityId: string): Promise<EntityTimeline> {
    return (await api.get<EntityTimeline>(`/api/metrics/entities/${entityId}/timeline`)).data;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
