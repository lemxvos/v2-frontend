// ─────────────────────────────────────────────────────────────────────────────

import api from "@/lib/api";
import type { TrackingEvent, TrackingStats } from "@/types/models";

export const trackingService = {
  // POST /api/entities/:entityId/track
  async track(entityId: string, payload: {
    date?: string;
    value?: number;
    decimalValue?: number;
    note?: string;
  }): Promise<TrackingEvent> {
    return (await api.post<TrackingEvent>(`/api/entities/${entityId}/track`, payload)).data;
  },
  // DELETE /api/entities/:entityId/track?date=yyyy-MM-dd
  async untrack(entityId: string, date: string): Promise<void> {
    await api.delete(`/api/entities/${entityId}/track`, { params: { date } });
  },
  // GET /api/entities/:entityId/heatmap?from=&to=
  async heatmap(entityId: string, from?: string, to?: string): Promise<Record<string, number>> {
    return (await api.get<Record<string, number>>(`/api/entities/${entityId}/heatmap`, {
      params: { ...(from && { from }), ...(to && { to }) },
    })).data;
  },
  // GET /api/entities/:entityId/stats
  async stats(entityId: string): Promise<TrackingStats> {
    return (await api.get<TrackingStats>(`/api/entities/${entityId}/stats`)).data;
  },
  // GET /api/tracking/today
  async today(): Promise<TrackingEvent[]> {
    return (await api.get<TrackingEvent[]>("/api/tracking/today")).data;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
