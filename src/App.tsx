
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { DataProvider } from "./contexts/DataContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";

// Pages
import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import PatientDetail from "./pages/PatientDetail";
import RendezVous from "./pages/RendezVous";
import Factures from "./pages/Factures";
import Medecins from "./pages/Medecins";
import Messages from "./pages/Messages";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <DataProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Pages publiques */}
              <Route path="/login" element={<Login />} />
              <Route path="/unauthorized" element={<Unauthorized />} />

              {/* Pages protégées */}
              <Route path="/" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              
              {/* Patients */}
              <Route path="/patients" element={
                <ProtectedRoute>
                  <Patients />
                </ProtectedRoute>
              } />
              <Route path="/patients/:id" element={
                <ProtectedRoute>
                  <PatientDetail />
                </ProtectedRoute>
              } />
              
              {/* Rendez-vous */}
              <Route path="/rendez-vous" element={
                <ProtectedRoute>
                  <RendezVous />
                </ProtectedRoute>
              } />
              
              {/* Factures */}
              <Route path="/factures" element={
                <ProtectedRoute>
                  <Factures />
                </ProtectedRoute>
              } />
              
              {/* Médecins */}
              <Route path="/medecins" element={
                <ProtectedRoute>
                  <Medecins />
                </ProtectedRoute>
              } />
              
              {/* Messagerie */}
              <Route path="/messages" element={
                <ProtectedRoute>
                  <Messages />
                </ProtectedRoute>
              } />

              {/* Route par défaut (page non trouvée) */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </DataProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
