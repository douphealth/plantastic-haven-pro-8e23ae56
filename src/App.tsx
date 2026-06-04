import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import ResetPassword from "./pages/Auth/ResetPassword";
import Dashboard from "./pages/Dashboard";
import MyGarden from "./pages/MyGarden";
import PlantDetail from "./pages/PlantDetail";
import CareCalendar from "./pages/CareCalendar";
import PlantIdentifier from "./pages/PlantIdentifier";
import Community from "./pages/Community";
import Settings from "./pages/Settings";
import PaymentSuccess from "./pages/PaymentSuccess";
import EmailSequences from "./pages/EmailSequences";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Navigate to="/dashboard" replace />} />
            <Route path="/register" element={<Navigate to="/dashboard" replace />} />
            <Route path="/forgot-password" element={<Navigate to="/dashboard" replace />} />
            <Route path="/reset-password" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/my-garden" element={<ProtectedRoute><MyGarden /></ProtectedRoute>} />
            <Route path="/plant/:id" element={<ProtectedRoute><PlantDetail /></ProtectedRoute>} />
            <Route path="/care-calendar" element={<ProtectedRoute><CareCalendar /></ProtectedRoute>} />
            <Route path="/plant-identifier" element={<ProtectedRoute><PlantIdentifier /></ProtectedRoute>} />
            <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
            <Route path="/email-sequences" element={<ProtectedRoute><EmailSequences /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/payment-success" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
