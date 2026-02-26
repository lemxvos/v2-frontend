// ─────────────────────────────────────────────────────────────────────────────

import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token, user, isLoading } = useAuthStore();
  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0b]">
      <div className="w-5 h-5 border-2 border-[#3ecf8e]/40 border-t-[#3ecf8e] rounded-full animate-spin" />
    </div>
  );
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

// ─────────────────────────────────────────────────────────────────────────────
