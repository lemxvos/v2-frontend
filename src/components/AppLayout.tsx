// ─────────────────────────────────────────────────────────────────────────────

import { NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import {
  BarChart3, BookOpen, Users, Target, Search,
  Settings, LogOut, Zap, ChevronRight,
} from "lucide-react";

const NAV = [
  { to: "/dashboard",  icon: BarChart3, label: "Dashboard" },
  { to: "/journal",    icon: BookOpen,  label: "Journal" },
  { to: "/habits",     icon: Target,    label: "Hábitos" },
  { to: "/entities",   icon: Users,     label: "Entidades" },
  { to: "/connections",icon: Zap,       label: "Conexões" },
  { to: "/search",     icon: Search,    label: "Buscar" },
];

const MOBILE_NAV = [
  { to: "/dashboard", icon: BarChart3, label: "Início" },
  { to: "/journal",   icon: BookOpen,  label: "Journal" },
  { to: "/habits",    icon: Target,    label: "Hábitos" },
  { to: "/entities",  icon: Users,     label: "Entidades" },
  { to: "/settings",  icon: Settings,  label: "Config" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#e8e8e8] flex">
      {/* Sidebar — desktop */}
      <aside className="hidden md:flex flex-col w-56 border-r border-white/5 h-screen sticky top-0 bg-[#0d0d0f]">
        <div className="p-5 border-b border-white/5">
          <span className="font-mono text-[13px] font-bold tracking-wider text-[#3ecf8e]">CONTINUUM</span>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-0.5">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] font-medium transition-all ${
                  isActive
                    ? "bg-[#3ecf8e]/10 text-[#3ecf8e]"
                    : "text-[#888] hover:text-[#e8e8e8] hover:bg-white/[0.04]"
                }`
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-white/5 space-y-1">
          {user?.plan === "FREE" && (
            <button
              onClick={() => navigate("/upgrade")}
              className="w-full flex items-center justify-between px-3 py-2 rounded-md bg-[#3ecf8e]/10 text-[#3ecf8e] text-[12px] font-medium hover:bg-[#3ecf8e]/15 transition-colors"
            >
              <span>Upgrade PRO</span>
              <ChevronRight className="h-3 w-3" />
            </button>
          )}
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] transition-all ${
                isActive ? "bg-white/5 text-[#e8e8e8]" : "text-[#666] hover:text-[#e8e8e8] hover:bg-white/[0.04]"
              }`
            }
          >
            <Settings className="h-4 w-4" />
            Config
          </NavLink>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] text-[#666] hover:text-red-400 hover:bg-red-500/5 transition-all"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
          {user && (
            <div className="px-3 py-2 mt-1">
              <p className="text-[11px] text-[#555] truncate">{user.email}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                  user.plan === "FREE" ? "bg-[#333] text-[#888]" :
                  user.plan === "PRO"  ? "bg-[#3ecf8e]/20 text-[#3ecf8e]" :
                  "bg-purple-500/20 text-purple-400"
                }`}>{user.plan}</span>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-h-screen pb-20 md:pb-0">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {children}
        </div>
      </main>

      {/* Bottom nav — mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0d0d0f] border-t border-white/5 z-50">
        <div className="flex items-center justify-around px-2 py-2">
          {MOBILE_NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-all ${
                  isActive ? "text-[#3ecf8e]" : "text-[#555]"
                }`
              }
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
