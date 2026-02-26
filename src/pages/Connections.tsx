// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { metricsService } from "@/services/metricsService";
import { entityService } from "@/services/entityService";
import type { DashboardMetrics, Entity } from "@/types/models";
import { toast } from "sonner";
import { Hash, ArrowRight } from "lucide-react";

export default function ConnectionsPage() {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([metricsService.dashboard(), entityService.list()])
      .then(([m, e]) => {
        if (m.status === "fulfilled") setMetrics(m.value);
        if (e.status === "fulfilled") setEntities(e.value);
      })
      .catch(() => toast.error("Erro ao carregar"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-3 animate-pulse">
      {[1,2,3].map(i => <div key={i} className="h-24 bg-[#111] rounded-xl" />)}
    </div>
  );

  const allTop = [
    ...(metrics?.topPeople || []),
    ...(metrics?.topProjects || []),
    ...(metrics?.topHabits || []),
  ].sort((a, b) => b.mentions - a.mentions);

  const getEntity = (id: string) => entities.find((e) => e.id === id);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold">Conexões</h1>
        <p className="text-xs text-[#555] mt-0.5">Entidades mais mencionadas no seu journal</p>
      </div>

      {/* Global stats */}
      {metrics && (
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-[#111] border border-white/5 rounded-lg p-3 text-center">
            <p className="text-lg font-bold font-mono text-blue-400">{metrics.uniquePeople}</p>
            <p className="text-[11px] text-[#555]">Pessoas</p>
          </div>
          <div className="bg-[#111] border border-white/5 rounded-lg p-3 text-center">
            <p className="text-lg font-bold font-mono text-orange-400">{metrics.uniqueProjects}</p>
            <p className="text-[11px] text-[#555]">Projetos</p>
          </div>
          <div className="bg-[#111] border border-white/5 rounded-lg p-3 text-center">
            <p className="text-lg font-bold font-mono text-[#3ecf8e]">{metrics.totalMentions}</p>
            <p className="text-[11px] text-[#555]">Menções</p>
          </div>
        </div>
      )}

      {/* All top entities sorted */}
      <div className="bg-[#111] border border-white/5 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <Hash className="h-4 w-4 text-purple-400" />
          <p className="text-sm font-semibold">Ranking de menções</p>
        </div>
        {allTop.length === 0 ? (
          <p className="text-sm text-[#444] text-center py-4">
            Escreva entradas no journal para ver conexões
          </p>
        ) : (
          <div className="space-y-1">
            {allTop.map((e, i) => {
              const entity = getEntity(e.id);
              return (
                <button
                  key={e.id}
                  onClick={() => navigate(`/entities/${e.id}`)}
                  className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/[0.04] transition-colors group"
                >
                  <span className="text-[11px] font-mono text-[#444] w-5 shrink-0">{i + 1}</span>
                  <span className="text-sm shrink-0">{entity?.icon || "📌"}</span>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm text-[#ccc] group-hover:text-white transition-colors truncate">{e.name}</p>
                    <p className="text-[10px] text-[#444] font-mono">{e.type.toLowerCase()}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <div
                      className="h-1.5 rounded-full bg-[#3ecf8e]/40"
                      style={{ width: `${Math.max(12, (e.mentions / (allTop[0]?.mentions || 1)) * 60)}px` }}
                    />
                    <span className="text-[11px] font-mono text-[#555] w-8 text-right">{e.mentions}</span>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-[#333] group-hover:text-[#555] transition-colors" />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
