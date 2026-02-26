// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { subscriptionService } from "@/services/subscriptionService";
import { toast } from "sonner";
import { Check, Loader2, ArrowLeft } from "lucide-react";

const PLANS = [
  {
    id: "PRO",
    name: "Pro",
    price: "R$ 19/mês",
    priceId: import.meta.env.VITE_STRIPE_PRICE_PRO || "",
    features: [
      "Notas ilimitadas",
      "Entidades ilimitadas",
      "50 hábitos",
      "Métricas avançadas",
      "Histórico completo",
    ],
    color: "border-[#3ecf8e]/30",
    badge: "text-[#3ecf8e] bg-[#3ecf8e]/10",
    button: "bg-[#3ecf8e] hover:bg-[#3ecf8e]/90 text-black",
  },
  {
    id: "VISION",
    name: "Vision",
    price: "R$ 39/mês",
    priceId: import.meta.env.VITE_STRIPE_PRICE_VISION || "",
    features: [
      "Tudo do Pro",
      "Hábitos ilimitados",
      "Export de dados",
      "Suporte prioritário",
      "Acesso antecipado",
    ],
    color: "border-purple-500/30",
    badge: "text-purple-400 bg-purple-500/10",
    button: "bg-purple-500 hover:bg-purple-400 text-white",
  },
];

export default function UpgradePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<string | null>(null);

  const handleUpgrade = async (plan: typeof PLANS[0]) => {
    if (!plan.priceId) { toast.error("Plano não configurado"); return; }
    setLoading(plan.id);
    try {
      const { url } = await subscriptionService.checkout(plan.priceId);
      window.location.href = url;
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erro ao iniciar checkout");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-[#666] hover:text-white transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold">Upgrade</h1>
          <p className="text-xs text-[#555] mt-0.5">Desbloqueie mais recursos</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {PLANS.map((plan) => (
          <div key={plan.id} className={`bg-[#111] border rounded-xl p-6 ${plan.color}`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${plan.badge}`}>{plan.name}</span>
              </div>
              <p className="text-lg font-bold">{plan.price}</p>
            </div>
            <ul className="space-y-2 mb-6">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-[#888]">
                  <Check className="h-3.5 w-3.5 text-[#3ecf8e] shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleUpgrade(plan)}
              disabled={loading === plan.id}
              className={`w-full py-2.5 rounded-md text-sm font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 ${plan.button}`}
            >
              {loading === plan.id && <Loader2 className="h-4 w-4 animate-spin" />}
              Assinar {plan.name}
            </button>
          </div>
        ))}
      </div>

      <p className="text-xs text-[#444] text-center">
        Pagamento seguro via Stripe. Cancele quando quiser.
      </p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// END OF FILE
// ═══════════════════════════════════════════════════════════════════════════════
