// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Credenciais inválidas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="font-mono text-sm font-bold tracking-widest text-[#3ecf8e]">CONTINUUM</span>
          <h1 className="mt-3 text-2xl font-bold text-white">Bem-vindo de volta</h1>
          <p className="mt-1 text-sm text-[#666]">Entre na sua conta</p>
        </div>

        <form onSubmit={submit} className="space-y-3">
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
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              className="w-full bg-[#111] border border-white/10 rounded-md px-3 py-2.5 text-sm text-white placeholder-[#444] focus:outline-none focus:border-[#3ecf8e]/50 transition-colors"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-[#3ecf8e] hover:bg-[#3ecf8e]/90 disabled:opacity-50 text-black font-semibold py-2.5 rounded-md text-sm transition-colors flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Entrar
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-[#555]">
          Não tem conta?{" "}
          <Link to="/register" className="text-[#3ecf8e] hover:underline">
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
