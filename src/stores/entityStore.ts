// ─────────────────────────────────────────────────────────────────────────────

import { create } from "zustand";
import { entityService, type EntityCreatePayload, type EntityUpdatePayload } from "@/services/entityService";
import type { Entity, EntityType } from "@/types/models";

interface EntityState {
  entities: Entity[];
  isLoading: boolean;
  fetch: (type?: EntityType) => Promise<void>;
  search: (q: string, type?: EntityType) => Promise<Entity[]>;
  create: (p: EntityCreatePayload) => Promise<Entity>;
  update: (id: string, p: EntityUpdatePayload) => Promise<Entity>;
  archive: (id: string) => Promise<void>;
}

export const useEntityStore = create<EntityState>((set, get) => ({
  entities: [],
  isLoading: false,

  fetch: async (type) => {
    set({ isLoading: true });
    try {
      const entities = await entityService.list(type);
      set({ entities });
    } finally {
      set({ isLoading: false });
    }
  },

  search: async (q, type) => entityService.search(q, type),

  create: async (p) => {
    const entity = await entityService.create(p);
    set((s) => ({ entities: [entity, ...s.entities] }));
    return entity;
  },

  update: async (id, p) => {
    const entity = await entityService.update(id, p);
    set((s) => ({ entities: s.entities.map((e) => (e.id === id ? entity : e)) }));
    return entity;
  },

  archive: async (id) => {
    await entityService.archive(id);
    set((s) => ({ entities: s.entities.filter((e) => e.id !== id) }));
  },
}));

// ─────────────────────────────────────────────────────────────────────────────
