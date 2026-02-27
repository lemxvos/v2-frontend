import { useState } from "react";
import { accountService } from "@/services/accountService";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await accountService.forgot(email);
      toast.success("Verifique seu email para instruções");
      navigate("/login");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erro ao enviar email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-white mb-4">Recuperar senha</h1>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="block text-xs text-[#666] mb-1.5 font-medium">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#111] border border-white/10 rounded-md px-3 py-2.5 text-sm text-white placeholder-[#444] focus:outline-none focus:border-[#3ecf8e]/50 transition-colors"
              placeholder="email@exemplo.com"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-[#3ecf8e] hover:bg-[#3ecf8e]/90 disabled:opacity-50 text-black font-semibold py-2.5 rounded-md text-sm transition-colors"
          >
            Enviar
          </button>
        </form>
      </div>
    </div>
  );
}