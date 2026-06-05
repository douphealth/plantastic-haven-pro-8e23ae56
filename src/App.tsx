import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Diagnose from "./pages/Diagnose";
import CarePlan from "./pages/CarePlan";
import FreePDF from "./pages/FreePDF";
import PlantGuides from "./pages/PlantGuides";

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
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
