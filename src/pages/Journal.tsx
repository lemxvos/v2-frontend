// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { noteService } from "@/services/noteService";
import { folderService } from "@/services/folderService";
import type { NoteIndex, Folder } from "@/types/models";
import { toast } from "sonner";
import { Plus, Trash2, Search, Folder as FolderIcon, ChevronRight } from "lucide-react";
import { format, parseISO, isToday, isYesterday } from "date-fns";
import { ptBR } from "date-fns/locale";

function dateLabel(dateStr: string) {
  const d = parseISO(dateStr);
  if (isToday(d)) return "Hoje";
  if (isYesterday(d)) return "Ontem";
  return format(d, "d 'de' MMMM", { locale: ptBR });
}

function groupByDate(notes: NoteIndex[]) {
  const map = new Map<string, NoteIndex[]>();
  for (const n of notes) {
    const key = n.createdAt.slice(0, 10);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(n);
  }
  return Array.from(map.entries()).sort(([a], [b]) => b.localeCompare(a));
}

export default function JournalPage() {
  const navigate = useNavigate();
  const [notes, setNotes] = useState<NoteIndex[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<NoteIndex | null>(null);

  useEffect(() => { load(); }, [activeFolderId]);

  const load = async () => {
    setLoading(true);
    try {
      const [n, f] = await Promise.all([
        noteService.list(activeFolderId ? { folderId: activeFolderId } : {}),
        folderService.list(),
      ]);
      setNotes(n);
      setFolders(f);
    } catch {
      toast.error("Erro ao carregar journal");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await noteService.archive(deleteTarget.id);
      setNotes((prev) => prev.filter((n) => n.id !== deleteTarget.id));
      toast.success("Nota arquivada");
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erro");
    }
  };

  const filtered = notes.filter((n) =>
    !search || n.title.toLowerCase().includes(search.toLowerCase())
  );
  const groups = groupByDate(filtered);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Journal</h1>
        <button
          onClick={() => navigate("/journal/new")}
          className="flex items-center gap-1.5 bg-[#3ecf8e] hover:bg-[#3ecf8e]/90 text-black text-xs font-semibold px-3 py-2 rounded-md transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Nova entrada
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#444]" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar entradas..."
          className="w-full bg-[#111] border border-white/5 rounded-md pl-9 pr-3 py-2 text-sm text-white placeholder-[#444] focus:outline-none focus:border-white/10 transition-colors"
        />
      </div>

      {/* Folder filter */}
      {folders.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setActiveFolderId(null)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              !activeFolderId ? "bg-white/10 text-white" : "text-[#555] hover:text-[#888]"
            }`}
          >
            Todas
          </button>
          {folders.map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFolderId(activeFolderId === f.id ? null : f.id)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                activeFolderId === f.id ? "bg-white/10 text-white" : "text-[#555] hover:text-[#888]"
              }`}
            >
              <FolderIcon className="h-3 w-3" />
              {f.name}
            </button>
          ))}
        </div>
      )}

      {/* Notes */}
      {loading ? (
        <div className="space-y-2 animate-pulse">
          {[1,2,3].map(i => <div key={i} className="h-14 bg-[#111] rounded-lg" />)}
        </div>
      ) : groups.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-[#444] text-sm">Nenhuma entrada encontrada</p>
          <button
            onClick={() => navigate("/journal/new")}
            className="mt-3 text-[#3ecf8e] text-sm hover:underline"
          >
            Escrever primeira entrada →
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map(([date, dayNotes]) => (
            <div key={date}>
              <p className="text-xs font-medium text-[#555] mb-2 font-mono uppercase tracking-wider">
                {dateLabel(date)}
              </p>
              <div className="space-y-1">
                {dayNotes.map((note) => (
                  <div key={note.id} className="group flex items-center gap-2">
                    <button
                      onClick={() => navigate(`/journal/${note.id}`)}
                      className="flex-1 flex items-center gap-3 p-3 bg-[#111] border border-white/5 rounded-lg hover:border-white/10 transition-all text-left"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#ddd] truncate">
                          {note.title || "Sem título"}
                        </p>
                        {note.preview && (
                          <p className="text-xs text-[#555] mt-0.5 truncate">{note.preview}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] font-mono text-[#444]">
                          {format(parseISO(note.createdAt), "HH:mm")}
                        </span>
                        <ChevronRight className="h-3.5 w-3.5 text-[#333] group-hover:text-[#555] transition-colors" />
                      </div>
                    </button>
                    <button
                      onClick={() => setDeleteTarget(note)}
                      className="p-2 rounded-md text-[#333] hover:text-red-400 hover:bg-red-500/5 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-[#111] border border-white/10 rounded-xl p-6 w-full max-w-sm">
            <h3 className="font-semibold mb-2">Arquivar nota?</h3>
            <p className="text-sm text-[#666] mb-5">"{deleteTarget.title || "Sem título"}" será arquivada.</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 text-sm text-[#888] hover:text-white transition-colors">
                Cancelar
              </button>
              <button onClick={handleDelete} className="px-4 py-2 text-sm bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-md transition-colors">
                Arquivar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
