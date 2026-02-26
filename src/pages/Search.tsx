// ─────────────────────────────────────────────────────────────────────────────

import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { entityService } from "@/services/entityService";
import type { Entity, EntityType } from "@/types/models";
import { Search as SearchIcon, ChevronRight } from "lucide-react";

const TYPE_FILTER: { value: EntityType | "ALL"; label: string }[] = [
  { value: "ALL", label: "Todas" },
  { value: "PERSON", label: "Pessoas" },
  { value: "HABIT", label: "Hábitos" },
  { value: "PROJECT", label: "Projetos" },
  { value: "GOAL", label: "Objetivos" },
];

let debounceTimer: ReturnType<typeof setTimeout>;

export default function SearchPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<EntityType | "ALL">("ALL");
  const [results, setResults] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(false);

  const search = useCallback((q: string, type: EntityType | "ALL") => {
    clearTimeout(debounceTimer);
    if (!q.trim()) { setResults([]); return; }
    debounceTimer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await entityService.search(q, type !== "ALL" ? type : undefined);
        setResults(res);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, []);

  const handleQuery = (q: string) => {
    setQuery(q);
    search(q, typeFilter);
  };

  const handleType = (t: EntityType | "ALL") => {
    setTypeFilter(t);
    search(query, t);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Buscar</h1>

      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#444]" />
        <input
          autoFocus
          value={query}
          onChange={(e) => handleQuery(e.target.value)}
          placeholder="Buscar entidades..."
          className="w-full bg-[#111] border border-white/5 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-[#444] focus:outline-none focus:border-white/10 transition-colors"
        />
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {TYPE_FILTER.map((t) => (
          <button
            key={t.value}
            onClick={() => handleType(t.value)}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              typeFilter === t.value ? "bg-white/10 text-white" : "text-[#555] hover:text-[#888]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2 animate-pulse">
          {[1,2,3].map(i => <div key={i} className="h-12 bg-[#111] rounded-lg" />)}
        </div>
      ) : results.length > 0 ? (
        <div className="space-y-1">
          {results.map((e) => (
            <button
              key={e.id}
              onClick={() => navigate(`/entities/${e.id}`)}
              className="w-full flex items-center gap-3 p-3 bg-[#111] border border-white/5 rounded-lg hover:border-white/10 transition-all text-left group"
            >
              <span className="text-base shrink-0">{e.icon || "📌"}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#ddd] truncate">{e.name}</p>
                <p className="text-[11px] text-[#555] font-mono">{e.type.toLowerCase()}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-[#333] group-hover:text-[#555] shrink-0 transition-colors" />
            </button>
          ))}
        </div>
      ) : query ? (
        <p className="text-center text-sm text-[#444] py-8">
          Nenhum resultado para "{query}"
        </p>
      ) : (
        <p className="text-center text-sm text-[#333] py-8">
          Digite para buscar entidades
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
