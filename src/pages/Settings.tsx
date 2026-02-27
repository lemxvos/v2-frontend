// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { subscriptionService } from "@/services/subscriptionService";
import { accountService } from "@/services/accountService";
import type { SubscriptionDTO } from "@/types/models";
import { toast } from "sonner";
import { LogOut, ChevronRight, Shield, CreditCard, User, Zap } from "lucide-react";
import { format, parseISO } from "date-fns";

export default function SettingsPage() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [sub, setSub] = useState<SubscriptionDTO | null>(null);
  const [canceling, setCanceling] = useState(false);

  useEffect(() => {
    subscriptionService.me().then(setSub).catch(() => {});
  }, []);

  const handleCancel = async () => {
    if (!confirm("Cancelar assinatura ao final do período?")) return;
    setCanceling(true);
    try {
      const updated = await subscriptionService.cancel();
      setSub(updated);
      toast.success("Assinatura cancelada");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erro");
    } finally {
      setCanceling(false);
    }
  };

  if (!user) return null;

  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email);
  const [acctLoading, setAcctLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);

  const saveAccount = async () => {
    setAcctLoading(true);
    try {
      await accountService.update({ username, email });
      toast.success("Conta atualizada");
      // refresh user in store
      useAuthStore.getState().updateUser({ username, email });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erro atualizar conta");
    } finally { setAcctLoading(false); }
  };

  const changePwd = async () => {
    if (!currentPassword || !newPassword) return;
    setPwdLoading(true);
    try {
      await accountService.changePassword(currentPassword, newPassword);
      toast.success("Senha alterada");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erro alterar senha");
    } finally { setPwdLoading(false); }
  };

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <h1 className="text-xl font-bold">Configurações</h1>

      {/* Account */}
      <div className="bg-[#111] border border-white/5 rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-[#555]" />
          <p className="text-xs font-medium text-[#555] uppercase tracking-wider">Conta</p>
        </div>
        <div className="space-y-3">
          <div>
            <p className="text-xs text-[#555]">Username</p>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-[#111] border border-white/10 rounded-md px-3 py-2 text-sm text-white placeholder-[#444] focus:outline-none focus:border-white/10"
            />
          </div>
          <div>
            <p className="text-xs text-[#555]">Email</p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#111] border border-white/10 rounded-md px-3 py-2 text-sm text-white placeholder-[#444] focus:outline-none focus:border-white/10"
            />
          </div>
          <button
            onClick={saveAccount}
            disabled={acctLoading}
            className="text-xs bg-[#3ecf8e] hover:bg-[#3ecf8e]/90 disabled:opacity-50 text-black font-semibold py-2 px-3 rounded-md"
          >
            {acctLoading ? "Salvando..." : "Salvar alterações"}
          </button>
        </div>
      </div>

      {/* Password change */}
      <div className="bg-[#111] border border-white/5 rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-[#555]" />
          <p className="text-xs font-medium text-[#555] uppercase tracking-wider">Senha</p>
        </div>
        <div className="space-y-3">
          <div>
            <p className="text-xs text-[#555]">Senha atual</p>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full bg-[#111] border border-white/10 rounded-md px-3 py-2 text-sm text-white placeholder-[#444] focus:outline-none focus:border-white/10"
            />
          </div>
          <div>
            <p className="text-xs text-[#555]">Nova senha</p>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-[#111] border border-white/10 rounded-md px-3 py-2 text-sm text-white placeholder-[#444] focus:outline-none focus:border-white/10"
            />
          </div>
          <button
            onClick={changePwd}
            disabled={pwdLoading}
            className="text-xs bg-[#3ecf8e] hover:bg-[#3ecf8e]/90 disabled:opacity-50 text-black font-semibold py-2 px-3 rounded-md"
          >
            {pwdLoading ? "Alterando..." : "Mudar senha"}
          </button>
        </div>
      </div>

      {/* Usage */}
      <div className="bg-[#111] border border-white/5 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="h-4 w-4 text-[#555]" />
          <p className="text-xs font-medium text-[#555] uppercase tracking-wider">Uso</p>
        </div>
        <div className="space-y-3">
          {[
            { label: "Notas", used: user.noteCount, max: sub?.maxNotes },
            { label: "Entidades", used: user.entityCount, max: sub?.maxEntities },
            { label: "Hábitos", used: user.habitCount, max: sub?.maxHabits },
          ].map(({ label, used, max }) => (
            <div key={label}>
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-[#666]">{label}</p>
                <p className="text-xs font-mono text-[#555]">
                  {used}{max ? `/${max}` : ""}
                </p>
              </div>
              {max && (
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      used / max > 0.9 ? "bg-red-400" :
                      used / max > 0.7 ? "bg-orange-400" : "bg-[#3ecf8e]"
                    }`}
                    style={{ width: `${Math.min(100, (used / max) * 100)}%` }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Subscription */}
      {sub && sub.status === "ACTIVE" && user.plan !== "FREE" && (
        <div className="bg-[#111] border border-white/5 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="h-4 w-4 text-[#555]" />
            <p className="text-xs font-medium text-[#555] uppercase tracking-wider">Assinatura</p>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[#666]">Status</span>
              <span className="text-[#ddd]">{sub.status}</span>
            </div>
            {sub.currentPeriodEnd && (
              <div className="flex justify-between">
                <span className="text-[#666]">Próxima renovação</span>
                <span className="text-[#ddd] font-mono text-xs">
                  {format(parseISO(sub.currentPeriodEnd), "dd/MM/yyyy")}
                </span>
              </div>
            )}
            {sub.cancelAtPeriodEnd && (
              <p className="text-xs text-orange-400 mt-2">
                Assinatura será cancelada ao final do período atual.
              </p>
            )}
          </div>
          {!sub.cancelAtPeriodEnd && (
            <button
              onClick={handleCancel}
              disabled={canceling}
              className="mt-4 text-xs text-red-400 hover:underline disabled:opacity-50"
            >
              {canceling ? "Cancelando..." : "Cancelar assinatura"}
            </button>
          )}
        </div>
      )}

      {/* Sign out */}
      <button
        onClick={() => { logout(); navigate("/login"); }}
        className="w-full flex items-center justify-between p-4 bg-[#111] border border-white/5 rounded-xl hover:border-red-500/20 hover:bg-red-500/5 transition-all group"
      >
        <div className="flex items-center gap-2">
          <LogOut className="h-4 w-4 text-[#555] group-hover:text-red-400 transition-colors" />
          <span className="text-sm text-[#888] group-hover:text-red-400 transition-colors">Sair da conta</span>
        </div>
        <ChevronRight className="h-4 w-4 text-[#333]" />
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
