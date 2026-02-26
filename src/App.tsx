// ─────────────────────────────────────────────────────────────────────────────

import { Toaster } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/AppLayout";
import LoginPage from "@/pages/Login";
import RegisterPage from "@/pages/Register";
import DashboardPage from "@/pages/Dashboard";
import JournalPage from "@/pages/Journal";
import JournalEditorPage from "@/pages/JournalEditor";
import HabitsPage from "@/pages/Habits";
import AllEntitiesPage from "@/pages/AllEntities";
import EntityCreatePage from "@/pages/EntityCreate";
import EntityDetailPage from "@/pages/EntityDetail";
import ConnectionsPage from "@/pages/Connections";
import SearchPage from "@/pages/Search";
import SettingsPage from "@/pages/Settings";
import UpgradePage from "@/pages/Upgrade";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

function AppRoutes() {
  const hydrate = useAuthStore((s) => s.hydrate);
  useEffect(() => { hydrate(); }, [hydrate]);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/journal" element={<JournalPage />} />
                <Route path="/journal/new" element={<JournalEditorPage />} />
                <Route path="/journal/:id" element={<JournalEditorPage />} />
                <Route path="/habits" element={<HabitsPage />} />
                <Route path="/entities" element={<AllEntitiesPage />} />
                <Route path="/entities/new" element={<EntityCreatePage />} />
                <Route path="/entities/:id" element={<EntityDetailPage />} />
                <Route path="/connections" element={<ConnectionsPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/upgrade" element={<UpgradePage />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </AppLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster theme="dark" position="top-right" richColors />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
