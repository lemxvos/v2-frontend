// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { entityService } from "@/services/entityService";
import { trackingService } from "@/services/trackingService";
import type { Entity, TrackingEvent, TrackingStats } from "@/types/models";
import { toast } from "sonner";
import { format } from "date-fns";
import { CheckCircle2, Circle, Plus, TrendingUp, Flame, Target, ChevronRight, Loader2 } from "lucide-react";

type HabitRow = {
  entity: Entity;
  stats: TrackingStats | null;
  todayDone: boolean;
  todayEvent: TrackingEvent | null;
};

function StreakBadge({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <span className="flex items-center gap-0.5 text-orange-400 font-mono text-xs">
      <Flame className="h-3 w-3" />
      {count}
    </span>
  );
}

function HeatmapBar({ entityId }: { entityId: string }) {
  const [heatmap, setHeatmap] = useState<Record<string, number>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const to = new Date().toISOString().slice(0, 10);
    const from = new Date(Date.now() - 28 * 86400000).toISOString().slice(0, 10);
    trackingService.heatmap(entityId, from, to)
      .then(setHeatmap)
      .finally(() => setLoaded(true));
  }, [entityId]);

  if (!loaded) return <div className="flex gap-0.5">{Array.from({length: 28}).map((_, i) => <div key={i} className="w-2.5 h-2.5 rounded-sm bg-white/5" />)}</div>;

  const days: string[] = [];
  for (let i = 27; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    days.push(d.toISOString().slice(0, 10));
  }

  return (
    <div className="flex gap-0.5">
      {days.map((d) => {
        const v = heatmap[d] || 0;
        return (
          <div
            key={d}
            title={`${d}: ${v}`}
            className={`w-2.5 h-2.5 rounded-sm transition-colors ${
              v === 0 ? "bg-white/5" :
              v === 1 ? "bg-[#3ecf8e]/40" :
              v <= 3 ? "bg-[#3ecf8e]/70" : "bg-[#3ecf8e]"
            }`}
          />
        );
      })}
    </div>
  );
}

function CheckinDialog({ habit, onClose, onSuccess }: {
  habit: Entity;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [value, setValue] = useState("1");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const isNumeric = habit.tracking?.type === "INTEGER" || habit.tracking?.type === "DECIMAL";
  const isDecimal = habit.tracking?.type === "DECIMAL";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const today = format(new Date(), "yyyy-MM-dd");
      await trackingService.track(habit.id, {
        date: today,
        [isDecimal ? "decimalValue" : "value"]: isNumeric ? parseFloat(value) : 1,
        note: note || undefined,
      });
      toast.success(`${habit.name} ✓`);
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erro ao registrar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div className="bg-[#111] border border-white/10 rounded-xl p-6 w-full max-w-sm">
        <h3 className="font-semibold mb-1">{habit.icon || "🎯"} {habit.name}</h3>
        <p className="text-xs text-[#555] mb-4">
          {habit.tracking?.unit ? `Meta: ${habit.tracking.goal} ${habit.tracking.unit}` : "Check-in diário"}
        </p>
        <form onSubmit={submit} className="space-y-3">
          {isNumeric && (
            <div>
              <label className="text-xs text-[#666] block mb-1.5">
                Valor {habit.tracking?.unit ? `(${habit.tracking.unit})` : ""}
              </label>
              <input
                type="number"
                step={isDecimal ? "0.1" : "1"}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full bg-[#1a1a1c] border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-[#3ecf8e]/50"
              />
            </div>
          )}
          <div>
            <label className="text-xs text-[#666] block mb-1.5">Nota (opcional)</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Como foi?"
              className="w-full bg-[#1a1a1c] border border-white/10 rounded-md px-3 py-2 text-sm text-white placeholder-[#444] focus:outline-none focus:border-[#3ecf8e]/50"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2 text-sm text-[#666] hover:text-white transition-colors">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-[#3ecf8e] hover:bg-[#3ecf8e]/90 disabled:opacity-50 text-black font-semibold py-2 rounded-md text-sm transition-colors flex items-center justify-center gap-1.5"
            >
              {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Registrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function HabitsPage() {
  const navigate = useNavigate();
  const [habits, setHabits] = useState<HabitRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkinTarget, setCheckinTarget] = useState<Entity | null>(null);

  const today = format(new Date(), "yyyy-MM-dd");

  const load = async () => {
    setLoading(true);
    try {
      const [entities, todayEvents] = await Promise.all([
        entityService.list("HABIT"),
        trackingService.today(),
      ]);

      const rows: HabitRow[] = await Promise.all(
        entities.filter((e) => !e.archivedAt && e.tracking?.enabled).map(async (entity) => {
          const todayEvent = todayEvents.find((ev) => ev.entityId === entity.id) || null;
          let stats: TrackingStats | null = null;
          try { stats = await trackingService.stats(entity.id); } catch { /* not tracked yet */ }
          return { entity, stats, todayDone: !!todayEvent, todayEvent };
        })
      );

      // Sort: not done first, then by streak desc
      rows.sort((a, b) => {
        if (a.todayDone !== b.todayDone) return a.todayDone ? 1 : -1;
        return (b.stats?.currentStreak ?? 0) - (a.stats?.currentStreak ?? 0);
      });

      setHabits(rows);
    } catch {
      toast.error("Erro ao carregar hábitos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleUntrack = async (entityId: string) => {
    try {
      await trackingService.untrack(entityId, today);
      setHabits((prev) =>
        prev.map((h) =>
          h.entity.id === entityId
            ? { ...h, todayDone: false, todayEvent: null }
            : h
        )
      );
      toast.success("Registro removido");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erro");
    }
  };

  const done = habits.filter((h) => h.todayDone);
  const pending = habits.filter((h) => !h.todayDone);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Hábitos</h1>
          <p className="text-xs text-[#555] mt-0.5 font-mono">
            {done.length}/{habits.length} concluídos hoje
          </p>
        </div>
        <button
          onClick={() => navigate("/entities/new?type=HABIT")}
          className="flex items-center gap-1.5 bg-[#3ecf8e]/10 hover:bg-[#3ecf8e]/20 text-[#3ecf8e] text-xs font-semibold px-3 py-2 rounded-md transition-colors border border-[#3ecf8e]/20"
        >
          <Plus className="h-3.5 w-3.5" />
          Novo hábito
        </button>
      </div>

      {/* Progress bar */}
      {habits.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-[#555]">Progresso de hoje</span>
            <span className="text-xs font-mono text-[#3ecf8e]">{Math.round((done.length / habits.length) * 100)}%</span>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#3ecf8e] rounded-full transition-all duration-500"
              style={{ width: `${(done.length / habits.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-2 animate-pulse">
          {[1,2,3].map(i => <div key={i} className="h-16 bg-[#111] rounded-lg" />)}
        </div>
      ) : habits.length === 0 ? (
        <div className="text-center py-16">
          <Target className="h-10 w-10 text-[#333] mx-auto mb-3" />
          <p className="text-sm text-[#555]">Nenhum hábito criado ainda</p>
          <button
            onClick={() => navigate("/entities/new?type=HABIT")}
            className="mt-3 text-[#3ecf8e] text-sm hover:underline"
          >
            Criar primeiro hábito →
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Pending */}
          {pending.length > 0 && (
            <div>
              <p className="text-xs font-medium text-[#555] uppercase tracking-wider mb-2">Pendentes</p>
              <div className="space-y-2">
                {pending.map(({ entity, stats }) => (
                  <div key={entity.id} className="group bg-[#111] border border-white/5 rounded-lg p-4 hover:border-white/10 transition-all">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setCheckinTarget(entity)}
                        className="w-6 h-6 rounded-full border-2 border-white/20 hover:border-[#3ecf8e] transition-colors flex items-center justify-center shrink-0"
                      >
                        <Circle className="h-3.5 w-3.5 text-transparent" />
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{entity.icon || "🎯"}</span>
                          <span className="text-sm font-medium text-[#ddd] truncate">{entity.name}</span>
                          {stats && <StreakBadge count={stats.currentStreak} />}
                        </div>
                        {entity.tracking?.goal && (
                          <p className="text-xs text-[#555] mt-0.5">
                            Meta: {entity.tracking.goal} {entity.tracking.unit || ""}
                          </p>
                        )}
                        <div className="mt-2">
                          <HeatmapBar entityId={entity.id} />
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {stats && (
                          <div className="text-right mr-2 hidden md:block">
                            <p className="text-xs font-mono text-[#555]">{stats.totalDays}d total</p>
                            {stats.longestStreak > 0 && (
                              <p className="text-xs text-[#444]">melhor: {stats.longestStreak}</p>
                            )}
                          </div>
                        )}
                        <button
                          onClick={() => navigate(`/entities/${entity.id}`)}
                          className="p-1.5 text-[#333] hover:text-[#666] transition-colors"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Done */}
          {done.length > 0 && (
            <div>
              <p className="text-xs font-medium text-[#3ecf8e]/60 uppercase tracking-wider mb-2">
                Concluídos hoje ✓
              </p>
              <div className="space-y-2">
                {done.map(({ entity, stats, todayEvent }) => (
                  <div key={entity.id} className="group bg-[#111] border border-[#3ecf8e]/10 rounded-lg p-4 opacity-70">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleUntrack(entity.id)}
                        title="Desfazer check-in"
                        className="w-6 h-6 rounded-full bg-[#3ecf8e]/20 border-2 border-[#3ecf8e]/40 flex items-center justify-center shrink-0 hover:bg-red-500/10 hover:border-red-400/40 transition-colors"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 text-[#3ecf8e]" />
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{entity.icon || "🎯"}</span>
                          <span className="text-sm font-medium text-[#888] line-through truncate">{entity.name}</span>
                          {stats && <StreakBadge count={stats.currentStreak} />}
                        </div>
                        {todayEvent?.value != null && (
                          <p className="text-xs text-[#444] mt-0.5 font-mono">
                            {todayEvent.value} {entity.tracking?.unit || ""} registrado
                          </p>
                        )}
                        {todayEvent?.note && (
                          <p className="text-xs text-[#444] mt-0.5 italic">{todayEvent.note}</p>
                        )}
                      </div>
                      <button
                        onClick={() => navigate(`/entities/${entity.id}`)}
                        className="p-1.5 text-[#333] hover:text-[#555] transition-colors"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Check-in dialog */}
      {checkinTarget && (
        <CheckinDialog
          habit={checkinTarget}
          onClose={() => setCheckinTarget(null)}
          onSuccess={load}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
