import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { StockProvider } from "@/contexts/StockContext";
import AppLayout from "@/components/AppLayout";
import LoginPage from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Products from "@/pages/Products";
import Movements from "@/pages/Movements";
import UserManagement from "@/pages/UserManagement";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children, module }: { children: React.ReactNode; module?: string }) {
  const { isAuthenticated, hasAccess } = useAuth();
  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (module && !hasAccess(module as any)) return <Navigate to="/dashboard" replace />;
  return <AppLayout>{children}</AppLayout>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (user?.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return <AppLayout>{children}</AppLayout>;
}

function AuthGate() {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <LoginPage />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <StockProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<AuthGate />} />
              <Route path="/dashboard" element={<ProtectedRoute module="dashboard"><Dashboard /></ProtectedRoute>} />
              <Route path="/produtos" element={<ProtectedRoute module="products"><Products /></ProtectedRoute>} />
              <Route path="/movimentacoes" element={<ProtectedRoute module="movements"><Movements /></ProtectedRoute>} />
              <Route path="/usuarios" element={<AdminRoute><UserManagement /></AdminRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </StockProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
