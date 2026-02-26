// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { noteService } from "@/services/noteService";
import { entityService } from "@/services/entityService";
import type { NoteResponse, Entity } from "@/types/models";
import { toast } from "sonner";
import { ArrowLeft, Save, Loader2 } from "lucide-react";

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
  const [entities, setEntities] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionPos, setMentionPos] = useState<{ top: number; left: number } | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    entityService.list().then(setEntities).catch(() => {});
    if (id) {
      noteService.get(id)
        .then((n) => { setNote(n); setContent(n.content); })
        .catch(() => toast.error("Nota não encontrada"))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const detectMention = useCallback((text: string, cursorPos: number) => {
    const textBefore = text.slice(0, cursorPos);
    const atMatch = textBefore.match(/@(\w*)$/);
    if (atMatch) {
      setMentionQuery(atMatch[1]);
      const ta = textareaRef.current;
      if (ta) {
        // Simple position estimation
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
    const atIndex = textBefore.lastIndexOf("@");
    const newContent =
      content.slice(0, atIndex) +
      `{${entity.type.toLowerCase()}:${entity.id}}` +
      content.slice(pos);
    setContent(newContent);
    setMentionQuery("");
    setMentionPos(null);
    ta.focus();
  };

  const handleSave = async () => {
    if (!content.trim()) { toast.error("Conteúdo vazio"); return; }
    setSaving(true);
    try {
      if (id) {
        await noteService.update(id, content);
        toast.success("Nota salva");
      } else {
        const n = await noteService.create(content);
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate("/journal")} className="flex items-center gap-1.5 text-sm text-[#666] hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Journal
        </button>
        <div className="flex items-center gap-2">
          {id && <span className="text-xs text-[#444] font-mono">salvo automaticamente</span>}
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
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleChange}
          onKeyDown={(e) => {
            if (e.key === "Escape") { setMentionQuery(""); setMentionPos(null); }
          }}
          placeholder={`Escreva sua entrada...\n\nUse @ para mencionar entidades: @nome\nO formato salvo é {tipo:id}`}
          className="w-full min-h-[60vh] bg-[#0d0d0f] border border-white/5 rounded-xl px-5 py-4 text-sm text-[#ddd] placeholder-[#333] focus:outline-none focus:border-white/10 resize-none leading-relaxed font-mono transition-colors"
        />
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

      <p className="text-xs text-[#333]">
        Dica: use <code className="text-[#555]">@nome</code> para mencionar pessoas, hábitos, projetos e objetivos.
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
