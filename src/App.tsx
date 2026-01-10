import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Home from "./pages/Home";
import Architecture from "./pages/Architecture";
import DataFlow from "./pages/DataFlow";
import ConceptualFramework from "./pages/ConceptualFramework";
import Dashboard from "./pages/Dashboard";
import NetworkTopology from "./pages/NetworkTopology";
import AnomalyDashboard from "./pages/AnomalyDashboard";
import FuzzyLogicEngine from "./pages/FuzzyLogicEngine";
import ExpertSystem from "./pages/ExpertSystem";
import AlertSystem from "./pages/AlertSystem";
import TrafficClassifier from "./pages/TrafficClassifier";
import PredictiveFaultDetection from "./pages/PredictiveFaultDetection";
import SecuritySystem from "./pages/SecuritySystem";
import AutomatedRemediation from "./pages/AutomatedRemediation";
import IncidentReports from "./pages/IncidentReports";
import IncidentAnalytics from "./pages/IncidentAnalytics";
import DemoControl from "./pages/DemoControl";
import HowItWorks from "./pages/HowItWorks";
import ResearchObjectives from "./pages/ResearchObjectives";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import ITSMDashboard from "./pages/itsm/ITSMDashboard";
import IncidentList from "./pages/itsm/IncidentList";
import NewIncident from "./pages/itsm/NewIncident";
import IncidentDetail from "./pages/itsm/IncidentDetail";
import KnowledgeBase from "./pages/itsm/KnowledgeBase";
import Changes from "./pages/itsm/Changes";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
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
              <Route path="/expert" element={<ExpertSystem />} />
              <Route path="/alerts" element={<AlertSystem />} />
              <Route path="/traffic" element={<TrafficClassifier />} />
              <Route path="/predictive" element={<PredictiveFaultDetection />} />
              <Route path="/security" element={<SecuritySystem />} />
              <Route path="/remediation" element={<AutomatedRemediation />} />
              <Route path="/reports" element={<IncidentReports />} />
              <Route path="/analytics" element={<IncidentAnalytics />} />
              <Route path="/demo" element={<DemoControl />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/research" element={<ResearchObjectives />} />
              <Route path="/about" element={<About />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/itsm" element={<ITSMDashboard />} />
              <Route path="/itsm/incidents" element={<IncidentList />} />
              <Route path="/itsm/incidents/new" element={<NewIncident />} />
              <Route path="/itsm/incidents/:id" element={<IncidentDetail />} />
              <Route path="/itsm/knowledge" element={<KnowledgeBase />} />
              <Route path="/itsm/changes" element={<Changes />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
