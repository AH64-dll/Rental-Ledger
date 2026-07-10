import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Layout } from "./components/Layout";
import { AuthGuard } from "./components/AuthGuard";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { PropertiesList } from "./pages/PropertiesList";
import { TenantsList } from "./pages/TenantsList";
import { TenantProfile } from "./pages/TenantProfile";
import { LeasesList } from "./pages/LeasesList";
import { LeaseDetail } from "./pages/LeaseDetail";
import { ChargesList } from "./pages/ChargesList";
import { DebtsList } from "./pages/DebtsList";
import { Settings } from "./pages/Settings";
import { ToastProvider } from "./components/ui/Toast";
import { ConfirmProvider } from "./components/ui/ConfirmDialog";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <ConfirmProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route element={<AuthGuard />}>
                <Route element={<Layout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/properties" element={<PropertiesList />} />
                  <Route path="/tenants" element={<TenantsList />} />
                  <Route path="/tenants/:id" element={<TenantProfile />} />
                  <Route path="/leases" element={<LeasesList />} />
                  <Route path="/leases/:id" element={<LeaseDetail />} />
                  <Route path="/charges" element={<ChargesList />} />
                  <Route path="/debts" element={<DebtsList />} />
                  <Route path="/settings" element={<Settings />} />
                </Route>
              </Route>
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </BrowserRouter>
        </ConfirmProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}
