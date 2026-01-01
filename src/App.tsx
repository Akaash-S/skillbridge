import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AppProvider } from "@/context/AppContext";
import { Landing } from "@/pages/Landing";
import { Login } from "@/pages/Login";
import { Onboarding } from "@/pages/Onboarding";
import { Skills } from "@/pages/Skills";
import { Roles } from "@/pages/Roles";
import { Analysis } from "@/pages/Analysis";
import { Roadmap } from "@/pages/Roadmap";
import { Dashboard } from "@/pages/Dashboard";
import { Profile } from "@/pages/Profile";
import { CareerHub } from "@/pages/CareerHub";
import { SkillIntelligence } from "@/pages/SkillIntelligence";
import { LearningHistory } from "@/pages/LearningHistory";
import { Assessments } from "@/pages/Assessments";
import { Opportunities } from "@/pages/Opportunities";
import { Readiness } from "@/pages/Readiness";
import { ResumeIntelligence } from "@/pages/ResumeIntelligence";
import { Insights } from "@/pages/Insights";
import { RoadmapBuilder } from "@/pages/RoadmapBuilder";
import { Activity } from "@/pages/Activity";
import { Settings } from "@/pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem storageKey="skillbridge-theme">
      <AppProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/skills" element={<Skills />} />
              <Route path="/skills/intelligence" element={<SkillIntelligence />} />
              <Route path="/roles" element={<Roles />} />
              <Route path="/analysis" element={<Analysis />} />
              <Route path="/roadmap" element={<Roadmap />} />
              <Route path="/roadmap/custom" element={<RoadmapBuilder />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/career-hub" element={<CareerHub />} />
              <Route path="/learning-history" element={<LearningHistory />} />
              <Route path="/assessments" element={<Assessments />} />
              <Route path="/opportunities" element={<Opportunities />} />
              <Route path="/readiness" element={<Readiness />} />
              <Route path="/resume-intelligence" element={<ResumeIntelligence />} />
              <Route path="/insights" element={<Insights />} />
              <Route path="/activity" element={<Activity />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AppProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
