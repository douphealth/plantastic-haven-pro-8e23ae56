import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import ProRoute from "@/components/shared/ProRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Diagnose from "./pages/Diagnose";
import CarePlan from "./pages/CarePlan";
import FreePDF from "./pages/FreePDF";
import PlantGuides from "./pages/PlantGuides";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import ResetPassword from "./pages/Auth/ResetPassword";
import Dashboard from "./pages/Dashboard";
import MyGarden from "./pages/MyGarden";
import CareCalendar from "./pages/CareCalendar";
import PlantIdentifier from "./pages/PlantIdentifier";
import EmailSequences from "./pages/EmailSequences";
import Community from "./pages/Community";
import Settings from "./pages/Settings";
import PaymentSuccess from "./pages/PaymentSuccess";
import PlantDetail from "./pages/PlantDetail";

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
            <Route path="/diagnose" element={<Diagnose />} />
            <Route path="/care-plan" element={<CarePlan />} />
            <Route path="/free-pdf" element={<FreePDF />} />
            <Route path="/guides" element={<PlantGuides />} />
            <Route path="/plant-guides" element={<PlantGuides />} />

            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payment-success"
              element={
                <ProtectedRoute>
                  <PaymentSuccess />
                </ProtectedRoute>
              }
            />

            <Route
              path="/my-garden"
              element={
                <ProRoute>
                  <MyGarden />
                </ProRoute>
              }
            />
            <Route
              path="/care-calendar"
              element={
                <ProRoute>
                  <CareCalendar />
                </ProRoute>
              }
            />
            <Route
              path="/plant-identifier"
              element={
                <ProRoute>
                  <PlantIdentifier />
                </ProRoute>
              }
            />
            <Route
              path="/email-sequences"
              element={
                <ProRoute>
                  <EmailSequences />
                </ProRoute>
              }
            />
            <Route
              path="/community"
              element={
                <ProRoute>
                  <Community />
                </ProRoute>
              }
            />
            <Route
              path="/plant/:id"
              element={
                <ProRoute>
                  <PlantDetail />
                </ProRoute>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
