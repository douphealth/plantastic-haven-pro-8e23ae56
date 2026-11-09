import { lazy, Suspense, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import PremiumRoute from "@/components/shared/PremiumRoute";
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Diagnose = lazy(() => import("./pages/Diagnose"));
const CarePlan = lazy(() => import("./pages/CarePlan"));
const FreePDF = lazy(() => import("./pages/FreePDF"));
const PlantGuides = lazy(() => import("./pages/PlantGuides"));
const Login = lazy(() => import("./pages/Auth/Login"));
const Register = lazy(() => import("./pages/Auth/Register"));
const ForgotPassword = lazy(() => import("./pages/Auth/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/Auth/ResetPassword"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const MyGarden = lazy(() => import("./pages/MyGarden"));
const PlantDetail = lazy(() => import("./pages/PlantDetail"));
const CareCalendar = lazy(() => import("./pages/CareCalendar"));
const PlantIdentifier = lazy(() => import("./pages/PlantIdentifier"));
const Community = lazy(() => import("./pages/Community"));
const Settings = lazy(() => import("./pages/Settings"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const EmailSequences = lazy(() => import("./pages/EmailSequences"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));

const PAGE_TITLES: Record<string, string> = {
  "/": "Free plant care tools",
  "/diagnose": "Plant problem checklist",
  "/care-plan": "Care plan",
  "/free-pdf": "Care plan PDF",
  "/guides": "Plant care guides",
  "/plant-guides": "Plant care guides",
  "/login": "Sign in",
  "/register": "Create account",
  "/forgot-password": "Reset password",
  "/reset-password": "New password",
  "/settings": "Settings",
  "/payment-success": "Payment",
  "/dashboard": "Dashboard",
  "/my-garden": "My garden",
  "/care-calendar": "Care calendar",
  "/plant-identifier": "Plant identifier",
  "/community": "Community",
  "/email-sequences": "Care lessons",
  "/privacy": "Privacy",
  "/terms": "Terms",
};

const DocumentTitle = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const known = PAGE_TITLES[pathname];
    const title = known || (pathname.startsWith("/plant/") ? "Plant" : "Page not found");
    document.title = `${title} · PlantasticHaven Pro`;
  }, [pathname]);

  return null;
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <DocumentTitle />
          <Suspense
            fallback={
              <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">
                Loading…
              </div>
            }
          >
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/diagnose" element={<Diagnose />} />
            <Route path="/care-plan" element={<CarePlan />} />
            <Route path="/free-pdf" element={<FreePDF />} />
            <Route path="/guides" element={<PlantGuides />} />
            <Route path="/plant-guides" element={<PlantGuides />} />

            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

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
              path="/dashboard"
              element={
                <PremiumRoute>
                  <Dashboard />
                </PremiumRoute>
              }
            />
            <Route
              path="/my-garden"
              element={
                <PremiumRoute>
                  <MyGarden />
                </PremiumRoute>
              }
            />
            <Route
              path="/plant/:id"
              element={
                <PremiumRoute>
                  <PlantDetail />
                </PremiumRoute>
              }
            />
            <Route
              path="/care-calendar"
              element={
                <PremiumRoute>
                  <CareCalendar />
                </PremiumRoute>
              }
            />
            <Route
              path="/plant-identifier"
              element={
                <PremiumRoute>
                  <PlantIdentifier />
                </PremiumRoute>
              }
            />
            <Route
              path="/community"
              element={
                <PremiumRoute>
                  <Community />
                </PremiumRoute>
              }
            />
            <Route
              path="/email-sequences"
              element={
                <PremiumRoute>
                  <EmailSequences />
                </PremiumRoute>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
