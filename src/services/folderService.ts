// ─────────────────────────────────────────────────────────────────────────────

import api from "@/lib/api";
import type { Folder } from "@/types/models";

export const folderService = {
  // POST /api/folders
  async create(name: string, parentId?: string): Promise<Folder> {
    return (await api.post<Folder>("/api/folders", { name, parentId })).data;
  },
  // GET /api/folders
  async list(): Promise<Folder[]> {
    return (await api.get<Folder[]>("/api/folders")).data;
  },
  // PATCH /api/folders/:id/rename
  async rename(id: string, name: string): Promise<Folder> {
    return (await api.patch<Folder>(`/api/folders/${id}/rename`, { name })).data;
  },
  // PATCH /api/folders/:id/move
  async move(id: string, parentId: string | null): Promise<Folder> {
    return (await api.patch<Folder>(`/api/folders/${id}/move`, { parentId })).data;
  },
  // DELETE /api/folders/:id
  async delete(id: string): Promise<void> {
    await api.delete(`/api/folders/${id}`);
  },
};

// ─────────────────────────────────────────────────────────────────────────────
