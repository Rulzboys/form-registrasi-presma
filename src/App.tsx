import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Success from "./pages/Success";
import StatusTracking from "./pages/StatusTracking";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminKandidat from "./pages/admin/AdminKandidat";
import AdminKandidatDetail from "./pages/admin/AdminKandidatDetail";
import AdminSettings from "./pages/admin/AdminSettings";
import NotFound from "./pages/NotFound";
import RequireAuth from "@/components/RequireAuth";
import WhatsAppButton from "./layout/WhatsAppButton";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
      <WhatsAppButton /> 
        <Routes>
          {/* Halaman Publik */}
          <Route path="/" element={<Index />} />
          <Route path="/success" element={<Success />} />
          <Route path="/status/:id" element={<StatusTracking />} />
          <Route path="/admin-login" element={<AdminLogin />} />

          {/* Halaman Admin (Butuh Login) */}
          <Route
            path="/admin"
            element={
              <RequireAuth>
                <AdminDashboard />
              </RequireAuth>
            }
          />
          <Route
            path="/admin/kandidat"
            element={
              <RequireAuth>
                <AdminKandidat />
              </RequireAuth>
            }
          />
          <Route
            path="/admin/kandidat/:id"
            element={
              <RequireAuth>
                <AdminKandidatDetail />
              </RequireAuth>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <RequireAuth>
                <AdminSettings />
              </RequireAuth>
            }
          />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
