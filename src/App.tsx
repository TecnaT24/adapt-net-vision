import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Architecture from "./pages/Architecture";
import DataFlow from "./pages/DataFlow";
import ConceptualFramework from "./pages/ConceptualFramework";
import Dashboard from "./pages/Dashboard";
import NetworkTopology from "./pages/NetworkTopology";
import AnomalyDashboard from "./pages/AnomalyDashboard";
import FuzzyLogicEngine from "./pages/FuzzyLogicEngine";
import About from "./pages/About";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/architecture" element={<Architecture />} />
            <Route path="/dataflow" element={<DataFlow />} />
            <Route path="/framework" element={<ConceptualFramework />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/topology" element={<NetworkTopology />} />
            <Route path="/anomaly" element={<AnomalyDashboard />} />
            <Route path="/fuzzy" element={<FuzzyLogicEngine />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
