// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { metricsService } from "@/services/metricsService";
import { trackingService } from "@/services/trackingService";
import { noteService } from "@/services/noteService";
import type { DashboardMetrics, TrackingEvent, NoteIndex } from "@/types/models";
import { toast } from "sonner";
import { Plus, ArrowRight, Users, Target, FolderKanban, Hash, CheckCircle2 } from "lucide-react";
import { format, isToday, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: string }) {
  return (
    <div className={`bg-[#111] border rounded-lg p-4 flex items-center gap-3 ${color}`}>
      <div className="p-2 rounded-md bg-white/5">{icon}</div>
      <div>
        <p className="text-2xl font-bold font-mono">{value}</p>
        <p className="text-[11px] text-[#666] mt-0.5">{label}</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [todayEvents, setTodayEvents] = useState<TrackingEvent[]>([]);
  const [recentNotes, setRecentNotes] = useState<NoteIndex[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [m, t, n] = await Promise.allSettled([
        metricsService.dashboard(),
        trackingService.today(),
        noteService.recent(),
      ]);
      if (m.status === "fulfilled") setMetrics(m.value);
      if (t.status === "fulfilled") setTodayEvents(t.value);
      if (n.status === "fulfilled") setRecentNotes(n.value.slice(0, 5));
    } catch {
      toast.error("Erro ao carregar dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="space-y-4 animate-pulse">
      {[1,2,3].map(i => <div key={i} className="h-20 bg-[#111] rounded-lg" />)}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Dashboard</h1>
          <p className="text-xs text-[#555] mt-0.5 font-mono">
            {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
          </p>
        </div>
        <button
          onClick={() => navigate("/journal/new")}
          className="flex items-center gap-1.5 bg-[#3ecf8e] hover:bg-[#3ecf8e]/90 text-black text-xs font-semibold px-3 py-2 rounded-md transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Nova entrada
        </button>
      </div>

      {/* Stats */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <StatCard label="Pessoas" value={metrics.uniquePeople} icon={<Users className="h-4 w-4 text-blue-400" />} color="border-blue-500/10" />
          <StatCard label="Projetos" value={metrics.uniqueProjects} icon={<FolderKanban className="h-4 w-4 text-orange-400" />} color="border-orange-500/10" />
          <StatCard label="Hábitos" value={metrics.uniqueHabits} icon={<Target className="h-4 w-4 text-[#3ecf8e]" />} color="border-[#3ecf8e]/10" />
          <StatCard label="Menções" value={metrics.totalMentions} icon={<Hash className="h-4 w-4 text-purple-400" />} color="border-purple-500/10" />
        </div>
      )}

      {/* Today's habit check-ins */}
      <div className="bg-[#111] border border-white/5 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-[#3ecf8e]" />
            Check-ins de hoje
          </h2>
          <button onClick={() => navigate("/habits")} className="text-xs text-[#555] hover:text-[#888] transition-colors flex items-center gap-1">
            Ver todos <ArrowRight className="h-3 w-3" />
          </button>
        </div>
        {todayEvents.length === 0 ? (
          <p className="text-xs text-[#555] py-3">Nenhum hábito registrado hoje.</p>
        ) : (
          <div className="space-y-2">
            {todayEvents.slice(0, 5).map((ev) => (
              <div key={ev.id} className="flex items-center gap-2 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-[#3ecf8e]" />
                <span className="text-[#888]">{ev.entityId}</span>
                {ev.value != null && (
                  <span className="text-[11px] font-mono text-[#555]">× {ev.value}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top entities */}
      {metrics && (metrics.topPeople.length > 0 || metrics.topProjects.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {metrics.topPeople.length > 0 && (
            <div className="bg-[#111] border border-white/5 rounded-lg p-4">
              <h2 className="text-xs font-semibold text-[#666] uppercase tracking-wider mb-3">Top Pessoas</h2>
              <div className="space-y-2">
                {metrics.topPeople.slice(0, 5).map((e, i) => (
                  <button
                    key={e.id}
                    onClick={() => navigate(`/entities/${e.id}`)}
                    className="w-full flex items-center gap-2 group"
                  >
                    <span className="text-[11px] font-mono text-[#444] w-4">{i + 1}</span>
                    <span className="flex-1 text-sm text-left text-[#ccc] group-hover:text-white transition-colors truncate">{e.name}</span>
                    <span className="text-[11px] font-mono text-[#555]">{e.mentions}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          {metrics.topProjects.length > 0 && (
            <div className="bg-[#111] border border-white/5 rounded-lg p-4">
              <h2 className="text-xs font-semibold text-[#666] uppercase tracking-wider mb-3">Top Projetos</h2>
              <div className="space-y-2">
                {metrics.topProjects.slice(0, 5).map((e, i) => (
                  <button
                    key={e.id}
                    onClick={() => navigate(`/entities/${e.id}`)}
                    className="w-full flex items-center gap-2 group"
                  >
                    <span className="text-[11px] font-mono text-[#444] w-4">{i + 1}</span>
                    <span className="flex-1 text-sm text-left text-[#ccc] group-hover:text-white transition-colors truncate">{e.name}</span>
                    <span className="text-[11px] font-mono text-[#555]">{e.mentions}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recent notes */}
      <div className="bg-[#111] border border-white/5 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold">Entradas recentes</h2>
          <button onClick={() => navigate("/journal")} className="text-xs text-[#555] hover:text-[#888] transition-colors flex items-center gap-1">
            Ver tudo <ArrowRight className="h-3 w-3" />
          </button>
        </div>
        {recentNotes.length === 0 ? (
          <p className="text-xs text-[#555] py-3">Nenhuma nota ainda.</p>
        ) : (
          <div className="space-y-1">
            {recentNotes.map((note) => (
              <button
                key={note.id}
                onClick={() => navigate(`/journal/${note.id}`)}
                className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-white/[0.04] transition-colors group text-left"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#ccc] group-hover:text-white transition-colors truncate">
                    {note.title || "Sem título"}
                  </p>
                  <p className="text-[11px] text-[#555] font-mono">
                    {format(parseISO(note.createdAt), "dd/MM HH:mm")}
                    {isToday(parseISO(note.createdAt)) && <span className="ml-2 text-[#3ecf8e]">hoje</span>}
                  </p>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-[#444] group-hover:text-[#888] transition-colors shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
