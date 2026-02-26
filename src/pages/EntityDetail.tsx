// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { entityService } from "@/services/entityService";
import { trackingService } from "@/services/trackingService";
import { metricsService } from "@/services/metricsService";
import type { Entity, TrackingStats, EntityTimeline } from "@/types/models";
import { toast } from "sonner";
import { ArrowLeft, Trash2, CheckCircle2, Flame, TrendingUp, Hash } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

function HeatmapGrid({ heatmap, days = 90 }: { heatmap: Record<string, number>; days?: number }) {
  const dateList: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    dateList.push(new Date(Date.now() - i * 86400000).toISOString().slice(0, 10));
  }
  const max = Math.max(1, ...Object.values(heatmap));
  const weeks: string[][] = [];
  let week: string[] = [];
  for (const d of dateList) {
    if (week.length === 7) { weeks.push(week); week = []; }
    week.push(d);
  }
  if (week.length) weeks.push(week);

  return (
    <div className="flex gap-0.5 overflow-x-auto">
      {weeks.map((w, wi) => (
        <div key={wi} className="flex flex-col gap-0.5">
          {w.map((d) => {
            const v = heatmap[d] || 0;
            const intensity = v / max;
            return (
              <div
                key={d}
                title={`${d}: ${v}`}
                className={`w-2.5 h-2.5 rounded-sm ${
                  v === 0 ? "bg-white/5" :
                  intensity < 0.33 ? "bg-[#3ecf8e]/30" :
                  intensity < 0.66 ? "bg-[#3ecf8e]/60" : "bg-[#3ecf8e]"
                }`}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

export default function EntityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [entity, setEntity] = useState<Entity | null>(null);
  const [stats, setStats] = useState<TrackingStats | null>(null);
  const [timeline, setTimeline] = useState<EntityTimeline | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);

  useEffect(() => {
    if (!id) return;
    load();
  }, [id]);

  const load = async () => {
    setLoading(true);
    try {
      const [e, tl] = await Promise.allSettled([
        entityService.get(id!),
        metricsService.timeline(id!),
      ]);
      if (e.status === "fulfilled") setEntity(e.value);
      if (tl.status === "fulfilled") setTimeline(tl.value);

      // Load tracking stats if trackable
      if (e.status === "fulfilled" && e.value.tracking?.enabled) {
        trackingService.stats(id!).then(setStats).catch(() => {});
      }
    } catch {
      toast.error("Erro ao carregar entidade");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!entity) return;
    setCheckingIn(true);
    try {
      await trackingService.track(entity.id, {
        date: new Date().toISOString().slice(0, 10),
        value: 1,
      });
      toast.success("Registrado ✓");
      const newStats = await trackingService.stats(entity.id);
      setStats(newStats);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erro");
    } finally {
      setCheckingIn(false);
    }
  };

  const handleDelete = async () => {
    try {
      await entityService.archive(id!);
      toast.success("Entidade arquivada");
      navigate(-1);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erro");
    }
  };

  if (loading) return (
    <div className="space-y-3 animate-pulse max-w-2xl mx-auto">
      <div className="h-20 bg-[#111] rounded-xl" />
      <div className="h-32 bg-[#111] rounded-xl" />
      <div className="h-48 bg-[#111] rounded-xl" />
    </div>
  );

  if (!entity) return (
    <div className="text-center py-16">
      <p className="text-[#555]">Entidade não encontrada</p>
      <button onClick={() => navigate(-1)} className="mt-3 text-[#3ecf8e] text-sm">← Voltar</button>
    </div>
  );

  const isTrackable = entity.tracking?.enabled;

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      {/* Header */}
      <div className="bg-[#111] border border-white/5 rounded-xl p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <button onClick={() => navigate(-1)} className="text-[#555] hover:text-white transition-colors mt-0.5">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">{entity.icon || "📌"}</span>
                <h1 className="text-xl font-bold">{entity.name}</h1>
              </div>
              {entity.description && (
                <p className="text-sm text-[#666] mt-1">{entity.description}</p>
              )}
              <p className="text-xs text-[#444] font-mono mt-2">
                {entity.type.toLowerCase()} · criado em {format(parseISO(entity.createdAt), "dd/MM/yyyy")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {isTrackable && (
              <button
                onClick={handleCheckIn}
                disabled={checkingIn}
                className="flex items-center gap-1.5 bg-[#3ecf8e]/10 hover:bg-[#3ecf8e]/20 text-[#3ecf8e] text-xs font-semibold px-3 py-1.5 rounded-md transition-colors border border-[#3ecf8e]/20"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Hoje
              </button>
            )}
            <button
              onClick={() => setDeleteOpen(true)}
              className="p-2 text-[#444] hover:text-red-400 hover:bg-red-500/5 rounded-md transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Tracking stats */}
      {isTrackable && stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <div className="bg-[#111] border border-white/5 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-orange-400">
              <Flame className="h-4 w-4" />
              <span className="text-xl font-bold font-mono">{stats.currentStreak}</span>
            </div>
            <p className="text-[11px] text-[#555] mt-0.5">Streak atual</p>
          </div>
          <div className="bg-[#111] border border-white/5 rounded-lg p-3 text-center">
            <p className="text-xl font-bold font-mono">{stats.longestStreak}</p>
            <p className="text-[11px] text-[#555] mt-0.5">Maior streak</p>
          </div>
          <div className="bg-[#111] border border-white/5 rounded-lg p-3 text-center">
            <p className="text-xl font-bold font-mono">{stats.totalDays}</p>
            <p className="text-[11px] text-[#555] mt-0.5">Total de dias</p>
          </div>
          {entity.tracking?.type !== "BOOLEAN" && (
            <div className="bg-[#111] border border-white/5 rounded-lg p-3 text-center">
              <p className="text-xl font-bold font-mono">{stats.avgValue.toFixed(1)}</p>
              <p className="text-[11px] text-[#555] mt-0.5">Média {entity.tracking?.unit || ""}</p>
            </div>
          )}
        </div>
      )}

      {/* Heatmap (tracking) */}
      {isTrackable && timeline && Object.keys(timeline.heatmap).length > 0 && (
        <div className="bg-[#111] border border-white/5 rounded-xl p-4">
          <p className="text-xs font-medium text-[#555] uppercase tracking-wider mb-3">
            Atividade (90 dias)
          </p>
          <HeatmapGrid heatmap={timeline.heatmap as Record<string, number>} days={90} />
        </div>
      )}

      {/* Mention metrics */}
      {timeline && (
        <div className="bg-[#111] border border-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Hash className="h-4 w-4 text-purple-400" />
            <p className="text-xs font-medium text-[#666] uppercase tracking-wider">
              Menções no journal
            </p>
            <span className="ml-auto text-xs font-mono text-[#444]">{timeline.totalMentions}</span>
          </div>

          {/* Mention heatmap */}
          {Object.keys(timeline.heatmap).length > 0 && !isTrackable && (
            <div className="mb-4">
              <HeatmapGrid heatmap={timeline.heatmap as Record<string, number>} days={90} />
            </div>
          )}

          {/* Mention list */}
          {timeline.mentions.length === 0 ? (
            <p className="text-sm text-[#444] py-2">Nenhuma menção ainda</p>
          ) : (
            <div className="space-y-2 mt-2">
              {timeline.mentions.slice(0, 10).map((m, i) => (
                <button
                  key={i}
                  onClick={() => navigate(`/journal/${m.noteId}`)}
                  className="w-full text-left p-3 bg-[#0d0d0f] rounded-lg hover:bg-white/[0.03] transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-[11px] font-mono text-[#3ecf8e]">
                      {format(parseISO(m.date), "dd MMM yyyy", { locale: ptBR })}
                    </p>
                    <p className="text-xs text-[#555] truncate">{m.noteTitle}</p>
                  </div>
                  {m.context && (
                    <p className="text-xs text-[#666] italic leading-relaxed line-clamp-2">
                      "...{m.context}..."
                    </p>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Delete confirm */}
      {deleteOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-[#111] border border-white/10 rounded-xl p-6 w-full max-w-sm">
            <h3 className="font-semibold mb-2">Arquivar "{entity.name}"?</h3>
            <p className="text-sm text-[#666] mb-5">Os dados de tracking e menções no journal serão preservados.</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setDeleteOpen(false)} className="px-4 py-2 text-sm text-[#888] hover:text-white transition-colors">Cancelar</button>
              <button onClick={handleDelete} className="px-4 py-2 text-sm bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-md transition-colors">Arquivar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
