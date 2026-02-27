import React, { useState, useEffect } from "react";
import { entityService } from "@/services/entityService";
import { Save, Loader2 } from "lucide-react";
import type { Entity, EntityType, TrackingFrequency } from "@/types/models";
import { toast } from "sonner";

const ENTITY_TYPES: { value: EntityType; label: string; trackable: boolean }[] = [
  { value: "PERSON", label: "Pessoa", trackable: false },
  { value: "HABIT", label: "Hábito", trackable: true },
  { value: "PROJECT", label: "Projeto", trackable: true },
  { value: "GOAL", label: "Objetivo", trackable: true },
  { value: "DREAM", label: "Sonho", trackable: false },
  { value: "EVENT", label: "Evento", trackable: false },
  { value: "CUSTOM", label: "Custom", trackable: true },
];

const FREQ: { value: TrackingFrequency; label: string }[] = [
  { value: "DAILY", label: "Diário" },
  { value: "WEEKLY", label: "Semanal" },
  { value: "MONTHLY", label: "Mensal" },
];

interface Props {
  entity?: Entity;
  onSaved?: (e: Entity) => void;
  onCancel?: () => void;
}

export default function EntityForm({ entity, onSaved, onCancel }: Props) {
  const [form, setForm] = useState({
    name: entity?.name || "",
    description: entity?.description || "",
    type: entity?.type || ("PERSON" as EntityType),
    icon: entity?.icon || "",
    color: entity?.color || "",
    trackingEnabled: entity?.tracking?.enabled ?? (entity?.type === "HABIT"),
    frequency: entity?.tracking?.frequency || "DAILY",
    goal: entity?.tracking?.goal?.toString() || "",
    unit: entity?.tracking?.unit || "",
    trackingType: entity?.tracking?.type || ("BOOLEAN" as "BOOLEAN" | "INTEGER" | "DECIMAL"),
  });
  const [loading, setLoading] = useState(false);

  const typeInfo = ENTITY_TYPES.find((t) => t.value === form.type)!;
  const showTracking = typeInfo.trackable && form.trackingEnabled;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error("Nome obrigatório"); return; }
    setLoading(true);
    try {
      let result: Entity;
      if (entity) {
        result = await entityService.update(entity.id, {
          name: form.name.trim(),
          description: form.description || undefined,
          icon: form.icon || undefined,
          color: form.color || undefined,
          tracking: showTracking ? {
            enabled: true,
            frequency: form.frequency,
            goal: form.goal ? Number(form.goal) : undefined,
            unit: form.unit || undefined,
            type: form.trackingType,
          } : undefined,
        });
        toast.success("Entidade atualizada");
      } else {
        result = await entityService.create({
          name: form.name.trim(),
          description: form.description || undefined,
          type: form.type,
          icon: form.icon || undefined,
          color: form.color || undefined,
          tracking: showTracking ? {
            enabled: true,
            frequency: form.frequency,
            goal: form.goal ? Number(form.goal) : undefined,
            unit: form.unit || undefined,
            type: form.trackingType,
          } : undefined,
        });
        toast.success("Entidade criada");
      }
      onSaved && onSaved(result);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erro");
    } finally {
      setLoading(false);
    }
  };

  const inp = "w-full bg-[#111] border border-white/10 rounded-md px-3 py-2.5 text-sm text-white placeholder-[#444] focus:outline-none focus:border-white/20 transition-colors";

  return (
    <form onSubmit={submit} className="space-y-4 p-4">
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

      {/* rest of form same as EntityCreatePage... */}
      {/* Description, Icon, Color, Tracking toggle, tracking config */}
      <div>
        <label className="block text-xs text-[#666] mb-1.5 font-medium">Descrição</label>
        <input
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          className={inp}
          placeholder="Opcional"
        />
      </div>
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
                {t}
              </button>
            ))}
          </div>
          {form.trackingType !== "BOOLEAN" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-[#666] block mb-1.5">Meta</label>
                <input
                  type="number"
                  value={form.goal}
                  onChange={(e) => setForm((f) => ({ ...f, goal: e.target.value }))}
                  className="w-full bg-[#1a1a1c] border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-[#3ecf8e]/50"
                />
              </div>
              <div>
                <label className="text-xs text-[#666] block mb-1.5">Unidade</label>
                <input
                  value={form.unit}
                  onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
                  className="w-full bg-[#1a1a1c] border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-[#3ecf8e]/50"
                />
              </div>
            </div>
          )}
      )}
      <div className="flex justify-end gap-2">
        {onCancel && (
          <button type="button" onClick={onCancel} className="text-sm text-[#888] hover:text-white">Cancelar</button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-1.5 bg-[#3ecf8e] hover:bg-[#3ecf8e]/90 disabled:opacity-50 text-black text-xs font-semibold px-3 py-1.5 rounded-md transition-colors"
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          {entity ? "Atualizar" : "Salvar"}
        </button>
      </div>
    </form>
  );
}
