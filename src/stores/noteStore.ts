// ─────────────────────────────────────────────────────────────────────────────

import { create } from "zustand";
import { noteService } from "@/services/noteService";
import type { NoteIndex, NoteResponse } from "@/types/models";

interface NoteState {
  notes: NoteIndex[];
  isLoading: boolean;
  fetch: (opts?: { folderId?: string; rootOnly?: boolean; days?: number }) => Promise<void>;
  create: (content: string, folderId?: string) => Promise<NoteResponse>;
  update: (id: string, content: string) => Promise<NoteResponse>;
  archive: (id: string) => Promise<void>;
  get: (id: string) => Promise<NoteResponse>;
}

export const useNoteStore = create<NoteState>((set) => ({
  notes: [],
  isLoading: false,

  fetch: async (opts) => {
    set({ isLoading: true });
    try {
      const notes = await noteService.list(opts);
      set({ notes });
    } finally {
      set({ isLoading: false });
    }
  },

  create: async (content, folderId) => {
    const note = await noteService.create(content, folderId);
    set((s) => ({
      notes: [
        {
          id: note.id,
          userId: note.userId,
          folderId: note.folderId,
          title: note.title,
          createdAt: note.createdAt,
          updatedAt: note.updatedAt,
        },
        ...s.notes,
      ],
    }));
    return note;
  },

  update: async (id, content) => {
    const note = await noteService.update(id, content);
    set((s) => ({
      notes: s.notes.map((n) =>
        n.id === id
          ? { ...n, title: note.title, updatedAt: note.updatedAt }
          : n
      ),
    }));
    return note;
  },

  archive: async (id) => {
    await noteService.archive(id);
    set((s) => ({ notes: s.notes.filter((n) => n.id !== id) }));
  },

  get: async (id) => noteService.get(id),
}));

// ─────────────────────────────────────────────────────────────────────────────
