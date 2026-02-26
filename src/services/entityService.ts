// ─────────────────────────────────────────────────────────────────────────────

import api from "@/lib/api";
import type { Entity, EntityType, TrackingConfig } from "@/types/models";

export interface EntityCreatePayload {
  name: string;
  description?: string;
  type: EntityType;
  icon?: string;
  color?: string;
  tracking?: TrackingConfig;
  metadata?: Record<string, unknown>;
}

export interface EntityUpdatePayload {
  name?: string;
  description?: string;
  icon?: string;
  color?: string;
  tracking?: TrackingConfig;
  metadata?: Record<string, unknown>;
}

export const entityService = {
  // POST /api/entities
  async create(payload: EntityCreatePayload): Promise<Entity> {
    return (await api.post<Entity>("/api/entities", payload)).data;
  },
  // PUT /api/entities/:id
  async update(id: string, payload: EntityUpdatePayload): Promise<Entity> {
    return (await api.put<Entity>(`/api/entities/${id}`, payload)).data;
  },
  // DELETE /api/entities/:id
  async archive(id: string): Promise<void> {
    await api.delete(`/api/entities/${id}`);
  },
  // GET /api/entities/:id
  async get(id: string): Promise<Entity> {
    return (await api.get<Entity>(`/api/entities/${id}`)).data;
  },
  // GET /api/entities — optional type filter
  async list(type?: EntityType): Promise<Entity[]> {
    const params = type ? { type } : {};
    return (await api.get<Entity[]>("/api/entities", { params })).data;
  },
  // GET /api/entities/search?q=&type=
  async search(q: string, type?: EntityType): Promise<Entity[]> {
    return (await api.get<Entity[]>("/api/entities/search", { params: { q, ...(type && { type }) } })).data;
  },
  // GET /api/entities/archived
  async listArchived(): Promise<Entity[]> {
    return (await api.get<Entity[]>("/api/entities/archived")).data;
  },
  // POST /api/entities/:id/restore
  async restore(id: string): Promise<Entity> {
    return (await api.post<Entity>(`/api/entities/${id}/restore`)).data;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
