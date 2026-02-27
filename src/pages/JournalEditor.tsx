// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { noteService } from "@/services/noteService";
import { entityService } from "@/services/entityService";
import { folderService } from "@/services/folderService";
import type { NoteResponse, Entity, Folder } from "@/types/models";
import { toast } from "sonner";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import MarkdownEditor from "@/components/MarkdownEditor";

// Simple mention parser: {type:id} patterns shown as colored spans in preview
const MENTION_RE = /\{(\w+):([a-zA-Z0-9_-]+)\}/g;

function MentionSuggestion({ entities, query, onSelect }: {
  entities: Entity[];
  query: string;
  onSelect: (e: Entity) => void;
}) {
  const matches = entities.filter(
    (e) => e.name.toLowerCase().includes(query.toLowerCase()) && !e.archivedAt
  ).slice(0, 6);

  if (!query || matches.length === 0) return null;

  return (
    <div className="absolute z-50 bg-[#1a1a1c] border border-white/10 rounded-lg shadow-xl overflow-hidden w-64">
      {matches.map((e) => (
        <button
          key={e.id}
          onMouseDown={(ev) => { ev.preventDefault(); onSelect(e); }}
          className="w-full flex items-center gap-2 px-3 py-2 hover:bg-white/[0.06] transition-colors text-left"
        >
          <span className="text-sm">{e.icon || "📌"}</span>
          <div>
            <p className="text-sm text-[#e0e0e0]">{e.name}</p>
            <p className="text-[10px] text-[#555] font-mono">{e.type.toLowerCase()}</p>
          </div>
        </button>
      ))}
    </div>
  );
}

export default function JournalEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState("");
  const [note, setNote] = useState<NoteResponse | null>(null);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionPos, setMentionPos] = useState<{ top: number; left: number } | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    entityService.list().then(setEntities).catch(() => {});
    folderService.list().then(setFolders).catch(() => {});
    if (id) {
      noteService.get(id)
        .then((n) => {
          setNote(n);
          setContent(n.content);
          setSelectedFolder(n.folderId || null);
        })
        .catch(() => toast.error("Nota não encontrada"))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const detectMention = useCallback((text: string, cursorPos: number) => {
    const textBefore = text.slice(0, cursorPos);
    const braceMatch = textBefore.match(/\{(\w*)$/);
    if (braceMatch) {
      setMentionQuery(braceMatch[1]);
      const ta = textareaRef.current;
      if (ta) {
        setMentionPos({ top: ta.offsetTop + 30, left: ta.offsetLeft + 20 });
      }
    } else {
      setMentionQuery("");
      setMentionPos(null);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setContent(val);
    detectMention(val, e.target.selectionStart ?? val.length);

    // Auto-save after 1.5s of inactivity
    if (id) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => autoSave(val), 1500);
    }
  };

  const autoSave = async (text: string) => {
    if (!id || !text.trim()) return;
    try {
      await noteService.update(id, text);
    } catch { /* silent */ }
  };

  const insertMention = (entity: Entity) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const pos = ta.selectionStart;
    const textBefore = content.slice(0, pos);
    const braceIndex = textBefore.lastIndexOf("{");
    const newContent =
      content.slice(0, braceIndex) +
      `{${entity.type.toLowerCase()}:${entity.id}}` +
      content.slice(pos);
    setContent(newContent);
    setMentionQuery("");
    setMentionPos(null);
    ta.focus();
  };

  // Save on shortcuts and attempt save before logout
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().includes('MAC');
      if ((e.ctrlKey && e.key.toLowerCase() === 's') || (e.metaKey && e.key === 's')) {
        e.preventDefault();
        handleSave();
      }
      if ((e.metaKey && e.key === 'Enter') || (e.ctrlKey && e.key === 'Enter')) {
        e.preventDefault();
        handleSave();
      }
    };
    const onAuthLogout = () => { if (id) autoSave(content); };
    window.addEventListener('keydown', onKey as EventListener);
    window.addEventListener('auth:logout', onAuthLogout as EventListener);
    window.addEventListener('beforeunload', () => { if (id) localStorage.setItem(`draft_note_${id}`, content); });
    return () => {
      window.removeEventListener('keydown', onKey as EventListener);
      window.removeEventListener('auth:logout', onAuthLogout as EventListener);
    };
  }, [content, id]);

  const handleSave = async () => {
    if (!content.trim()) { toast.error("Conteúdo vazio"); return; }
    setSaving(true);
    try {
      if (id) {
        await noteService.update(id, content);
        // move if folder changed
        if (selectedFolder !== note?.folderId) {
          await noteService.move(id, selectedFolder ?? null);
        }
        toast.success("Nota salva");
      } else {
        const n = await noteService.create(content, selectedFolder || undefined);
        toast.success("Nota criada");
        navigate(`/journal/${n.id}`, { replace: true });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <Loader2 className="h-5 w-5 animate-spin text-[#444]" />
    </div>
  );

  // substitute mentions to show friendly names during preview
  const renderedContent = preview
    ? content.replace(MENTION_RE, (_, type, id) => {
        const ent = entities.find((e) => e.id === id);
        return ent ? `${ent.icon ? ent.icon + ' ' : ''}${ent.name}` : `{${type}:${id}}`;
      })
    : content;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate("/journal")} className="flex items-center gap-1.5 text-sm text-[#666] hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Journal
        </button>
        <div className="flex items-center gap-2">
          {id && <span className="text-xs text-[#444] font-mono">salvo automaticamente</span>}
          <select
            value={selectedFolder || ""}
            onChange={(e) => setSelectedFolder(e.target.value || null)}
            className="bg-[#111] border border-white/10 text-xs rounded-md px-2 py-1 text-white"
          >
            <option value="">Sem pasta</option>
            {folders.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 bg-[#3ecf8e] hover:bg-[#3ecf8e]/90 disabled:opacity-50 text-black text-xs font-semibold px-3 py-1.5 rounded-md transition-colors"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            Salvar
          </button>
        </div>
      </div>

      <div className="relative">
        <MarkdownEditor
          ref={textareaRef}
          value={renderedContent}
          onChange={(v) => { setContent(v); detectMention(v, textareaRef.current?.selectionStart ?? v.length); }}
          placeholder={`Escreva sua entrada...\n\nUse { para mencionar entidades: {nome\nO formato salvo é {tipo:id}`}
          preview={preview}
        />
        {/* when previewing we want readable mentions */}

        {mentionPos && (
          <div style={{ position: "absolute", top: mentionPos.top, left: mentionPos.left }}>
            <MentionSuggestion
              entities={entities}
              query={mentionQuery}
              onSelect={insertMention}
            />
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <label className="text-xs text-[#555] flex items-center gap-1">
          <input
            type="checkbox"
            checked={preview}
            onChange={(e) => setPreview(e.target.checked)}
            className="bg-[#111] border border-white/5"
          />
          Mostrar preview
        </label>
      </div>

      <p className="text-xs text-[#333]">
        Dica: digite {'{'} seguido do nome para mencionar pessoas, hábitos, projetos e objetivos. (o formato salvo é {'{tipo:id}'})
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
