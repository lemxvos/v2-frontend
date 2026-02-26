// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function RegisterPage() {
  const navigate = useNavigate();
  const register = useAuthStore((s) => s.register);
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 8) { toast.error("Senha deve ter no mínimo 8 caracteres"); return; }
    setLoading(true);
    try {
      await register(form);
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erro ao criar conta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="font-mono text-sm font-bold tracking-widest text-[#3ecf8e]">CONTINUUM</span>
          <h1 className="mt-3 text-2xl font-bold text-white">Criar conta</h1>
          <p className="mt-1 text-sm text-[#666]">Comece a mapear sua vida</p>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="block text-xs text-[#666] mb-1.5 font-medium">Username</label>
            <input
              required
              value={form.username}
              onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
              className="w-full bg-[#111] border border-white/10 rounded-md px-3 py-2.5 text-sm text-white placeholder-[#444] focus:outline-none focus:border-[#3ecf8e]/50 transition-colors"
              placeholder="seunome"
            />
          </div>
          <div>
            <label className="block text-xs text-[#666] mb-1.5 font-medium">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="w-full bg-[#111] border border-white/10 rounded-md px-3 py-2.5 text-sm text-white placeholder-[#444] focus:outline-none focus:border-[#3ecf8e]/50 transition-colors"
              placeholder="email@exemplo.com"
            />
          </div>
          <div>
            <label className="block text-xs text-[#666] mb-1.5 font-medium">Senha</label>
            <input
              type="password"
              required
              minLength={8}
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              className="w-full bg-[#111] border border-white/10 rounded-md px-3 py-2.5 text-sm text-white placeholder-[#444] focus:outline-none focus:border-[#3ecf8e]/50 transition-colors"
              placeholder="mínimo 8 caracteres"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-[#3ecf8e] hover:bg-[#3ecf8e]/90 disabled:opacity-50 text-black font-semibold py-2.5 rounded-md text-sm transition-colors flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Criar conta
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-[#555]">
          Já tem conta?{" "}
          <Link to="/login" className="text-[#3ecf8e] hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
