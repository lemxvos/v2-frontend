// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { entityService } from "@/services/entityService";
import type { Entity, EntityType } from "@/types/models";
import { toast } from "sonner";
import { Plus, Search, Trash2, ChevronRight } from "lucide-react";

const TYPE_LABELS: Record<EntityType, string> = {
  PERSON: "Pessoa",
  HABIT: "Hábito",
  PROJECT: "Projeto",
  GOAL: "Objetivo",
  DREAM: "Sonho",
  EVENT: "Evento",
  CUSTOM: "Custom",
};

const TABS: { value: EntityType | "ALL"; label: string }[] = [
  { value: "ALL", label: "Todas" },
  { value: "PERSON", label: "Pessoas" },
  { value: "PROJECT", label: "Projetos" },
  { value: "GOAL", label: "Objetivos" },
  { value: "DREAM", label: "Sonhos" },
  { value: "EVENT", label: "Eventos" },
  { value: "CUSTOM", label: "Custom" },
];

export default function AllEntitiesPage() {
  const navigate = useNavigate();
  const [entities, setEntities] = useState<Entity[]>([]);
  const [activeType, setActiveType] = useState<EntityType | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Entity | null>(null);

  useEffect(() => {
    setLoading(true);
    const type = activeType !== "ALL" ? activeType : undefined;
    entityService.list(type)
      .then(setEntities)
      .catch(() => toast.error("Erro ao carregar entidades"))
      .finally(() => setLoading(false));
  }, [activeType]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await entityService.archive(deleteTarget.id);
      setEntities((prev) => prev.filter((e) => e.id !== deleteTarget.id));
      toast.success("Entidade arquivada");
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erro");
    }
  };

  const filtered = entities.filter(
    (e) => !e.archivedAt && (!search || e.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Entidades</h1>
        <button
          onClick={() => navigate("/entities/new")}
          className="flex items-center gap-1.5 bg-[#3ecf8e]/10 hover:bg-[#3ecf8e]/20 text-[#3ecf8e] text-xs font-semibold px-3 py-2 rounded-md transition-colors border border-[#3ecf8e]/20"
        >
          <Plus className="h-3.5 w-3.5" />
          Nova
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#444]" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar entidades..."
          className="w-full bg-[#111] border border-white/5 rounded-md pl-9 pr-3 py-2 text-sm text-white placeholder-[#444] focus:outline-none transition-colors"
        />
      </div>

      {/* Type tabs */}
      <div className="flex gap-1 flex-wrap">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setActiveType(t.value)}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              activeType === t.value
                ? "bg-white/10 text-white"
                : "text-[#555] hover:text-[#888]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2 animate-pulse">
          {[1,2,3,4].map(i => <div key={i} className="h-12 bg-[#111] rounded-lg" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-sm text-[#555]">Nenhuma entidade encontrada</p>
        </div>
      ) : (
        <div className="space-y-1">
          {filtered.map((entity) => (
            <div key={entity.id} className="group flex items-center gap-2">
              <button
                onClick={() => navigate(`/entities/${entity.id}`)}
                className="flex-1 flex items-center gap-3 p-3 bg-[#111] border border-white/5 rounded-lg hover:border-white/10 transition-all text-left"
              >
                <span className="text-base shrink-0">{entity.icon || "📌"}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#ddd] truncate">{entity.name}</p>
                  <p className="text-[11px] text-[#555] font-mono">
                    {TYPE_LABELS[entity.type] || entity.type}
                    {entity.description && ` · ${entity.description.slice(0, 40)}`}
                  </p>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-[#333] group-hover:text-[#555] shrink-0 transition-colors" />
              </button>
              <button
                onClick={() => setDeleteTarget(entity)}
                className="p-2 rounded-md text-[#333] hover:text-red-400 hover:bg-red-500/5 transition-all opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-[#111] border border-white/10 rounded-xl p-6 w-full max-w-sm">
            <h3 className="font-semibold mb-2">Arquivar entidade?</h3>
            <p className="text-sm text-[#666] mb-5">"{deleteTarget.name}" será arquivada. Menções no journal serão preservadas.</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 text-sm text-[#888] hover:text-white transition-colors">Cancelar</button>
              <button onClick={handleDelete} className="px-4 py-2 text-sm bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-md transition-colors">Arquivar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
