// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { entityService } from "@/services/entityService";
import type { EntityType, TrackingFrequency } from "@/types/models";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";

const ENTITY_TYPES: { value: EntityType; label: string; trackable: boolean }[] = [
  { value: "PERSON",  label: "Pessoa",   trackable: false },
  { value: "HABIT",   label: "Hábito",   trackable: true },
  { value: "PROJECT", label: "Projeto",  trackable: true },
  { value: "GOAL",    label: "Objetivo", trackable: true },
  { value: "DREAM",   label: "Sonho",    trackable: false },
  { value: "EVENT",   label: "Evento",   trackable: false },
  { value: "CUSTOM",  label: "Custom",   trackable: true },
];

const FREQ: { value: TrackingFrequency; label: string }[] = [
  { value: "DAILY",   label: "Diário" },
  { value: "WEEKLY",  label: "Semanal" },
  { value: "MONTHLY", label: "Mensal" },
];

export default function EntityCreatePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultType = (searchParams.get("type") || "PERSON") as EntityType;

  const [form, setForm] = useState({
    name: "", description: "", type: defaultType,
    icon: "", color: "",
    trackingEnabled: defaultType === "HABIT",
    frequency: "DAILY" as TrackingFrequency,
    goal: "", unit: "",
    trackingType: "BOOLEAN" as "BOOLEAN" | "INTEGER" | "DECIMAL",
  });
  const [loading, setLoading] = useState(false);

  const typeInfo = ENTITY_TYPES.find((t) => t.value === form.type)!;
  const showTracking = typeInfo.trackable && form.trackingEnabled;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error("Nome obrigatório"); return; }
    setLoading(true);
    try {
      const entity = await entityService.create({
        name: form.name.trim(),
        description: form.description || undefined,
        type: form.type,
        icon: form.icon || undefined,
        color: form.color || undefined,
        tracking: form.trackingEnabled && typeInfo.trackable ? {
          enabled: true,
          frequency: form.frequency,
          goal: form.goal ? Number(form.goal) : undefined,
          unit: form.unit || undefined,
          type: form.trackingType,
        } : undefined,
      });
      toast.success("Entidade criada!");
      navigate(form.type === "HABIT" ? "/habits" : `/entities/${entity.id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erro ao criar");
    } finally {
      setLoading(false);
    }
  };

  const inp = "w-full bg-[#111] border border-white/10 rounded-md px-3 py-2.5 text-sm text-white placeholder-[#444] focus:outline-none focus:border-white/20 transition-colors";

  return (
    <div className="space-y-5 max-w-lg mx-auto">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-[#666] hover:text-white transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold">Nova entidade</h1>
      </div>

      <form onSubmit={submit} className="space-y-4">
        {/* Type */}
        <div>
          <label className="block text-xs text-[#666] mb-2 font-medium">Tipo</label>
          <div className="grid grid-cols-4 gap-1.5">
            {ENTITY_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setForm((f) => ({ ...f, type: t.value, trackingEnabled: t.trackable && t.value === "HABIT" }))}
                className={`py-2 rounded-md text-xs font-medium transition-colors ${
                  form.type === t.value
                    ? "bg-[#3ecf8e]/20 text-[#3ecf8e] border border-[#3ecf8e]/30"
                    : "bg-[#111] text-[#666] border border-white/5 hover:border-white/10"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="block text-xs text-[#666] mb-1.5 font-medium">Nome *</label>
          <input
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className={inp}
            placeholder={form.type === "HABIT" ? "ex: Meditação diária" : "Nome da entidade"}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs text-[#666] mb-1.5 font-medium">Descrição</label>
          <input
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className={inp}
            placeholder="Opcional"
          />
        </div>

        {/* Icon + Color */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-[#666] mb-1.5 font-medium">Ícone (emoji)</label>
            <input
              value={form.icon}
              onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
              className={inp}
              placeholder="🎯"
              maxLength={4}
            />
          </div>
          <div>
            <label className="block text-xs text-[#666] mb-1.5 font-medium">Cor</label>
            <input
              type="color"
              value={form.color || "#3ecf8e"}
              onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
              className="w-full h-10 bg-[#111] border border-white/10 rounded-md px-2 cursor-pointer"
            />
          </div>
        </div>

        {/* Tracking toggle */}
        {typeInfo.trackable && (
          <div className="flex items-center justify-between p-3 bg-[#111] border border-white/5 rounded-lg">
            <div>
              <p className="text-sm font-medium">Habilitar tracking</p>
              <p className="text-xs text-[#555]">Registre progresso diariamente</p>
            </div>
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, trackingEnabled: !f.trackingEnabled }))}
              className={`w-10 h-6 rounded-full transition-colors relative ${
                form.trackingEnabled ? "bg-[#3ecf8e]" : "bg-white/10"
              }`}
            >
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                form.trackingEnabled ? "left-5" : "left-1"
              }`} />
            </button>
          </div>
        )}

        {/* Tracking config */}
        {showTracking && (
          <div className="bg-[#0d0d0f] border border-white/5 rounded-lg p-4 space-y-3">
            <p className="text-xs font-medium text-[#666] uppercase tracking-wider">Configurar tracking</p>
            <div className="grid grid-cols-3 gap-1.5">
              {FREQ.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, frequency: f.value }))}
                  className={`py-1.5 rounded text-xs font-medium transition-colors ${
                    form.frequency === f.value
                      ? "bg-[#3ecf8e]/20 text-[#3ecf8e]"
                      : "bg-white/5 text-[#555] hover:text-[#888]"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {(["BOOLEAN", "INTEGER", "DECIMAL"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, trackingType: t }))}
                  className={`py-1.5 rounded text-xs font-medium transition-colors ${
                    form.trackingType === t
                      ? "bg-white/10 text-white"
                      : "bg-white/5 text-[#555] hover:text-[#888]"
                  }`}
                >
                  {t === "BOOLEAN" ? "Sim/Não" : t === "INTEGER" ? "Inteiro" : "Decimal"}
                </button>
              ))}
            </div>
            {form.trackingType !== "BOOLEAN" && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-[#666] mb-1">Meta</label>
                  <input
                    type="number"
                    value={form.goal}
                    onChange={(e) => setForm((f) => ({ ...f, goal: e.target.value }))}
                    className={inp}
                    placeholder="ex: 30"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#666] mb-1">Unidade</label>
                  <input
                    value={form.unit}
                    onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
                    className={inp}
                    placeholder="min, km, ml..."
                  />
                </div>
              </div>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#3ecf8e] hover:bg-[#3ecf8e]/90 disabled:opacity-50 text-black font-semibold py-2.5 rounded-md text-sm transition-colors flex items-center justify-center gap-2 mt-2"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Criar entidade
        </button>
      </form>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
