import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/context/AuthContext";
import { AppDataProvider } from "@/context/AppDataContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { SimpleLanding } from "@/pages/SimpleLanding";
import { Login } from "@/pages/auth/Login";
import { Onboarding } from "@/pages/Onboarding";
import { Skills } from "@/pages/Skills";
import { Roles } from "@/pages/Roles";
import { Analysis } from "@/pages/Analysis";
import { Roadmap } from "@/pages/Roadmap";
import { Dashboard } from "@/pages/Dashboard";
import { Profile } from "@/pages/Profile";
import { Resources } from "@/pages/Resources";
import { TestFeatures } from "@/pages/TestFeatures";
import { FeatureShowcase } from "@/pages/FeatureShowcase";
import { PDFTest } from "@/pages/PDFTest";
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
import { Courses } from "@/pages/Courses";
import Help from "@/pages/Help";
import NotFound from "./pages/NotFound";
import AddSkillsGuide from "@/pages/guide/AddSkills";
import CareerGoalGuide from "@/pages/guide/CareerGoal";
import SkillGapGuide from "@/pages/guide/SkillGap";
import RoadmapGuide from "@/pages/guide/Roadmap";
import GrowthTrackingGuide from "@/pages/guide/GrowthTracking";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem storageKey="skillbridge-theme">
      <AuthProvider>
        <AppDataProvider>
          <ErrorBoundary>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<SimpleLanding />} />
                  <Route path="/login" element={<Login />} />
                  
                  {/* Protected Routes */}
                  <Route path="/onboarding" element={
                    <ProtectedRoute>
                      <Onboarding />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/skills" element={
                    <ProtectedRoute>
                      <Skills />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/roles" element={
                    <ProtectedRoute>
                      <Roles />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/analysis" element={
                    <ProtectedRoute>
                      <Analysis />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/roadmap" element={
                    <ProtectedRoute>
                      <Roadmap />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/resources" element={
                    <ProtectedRoute>
                      <Resources />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/test-features" element={
                    <ProtectedRoute>
                      <TestFeatures />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/showcase" element={
                    <ProtectedRoute>
                      <FeatureShowcase />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/pdf-test" element={
                    <ProtectedRoute>
                      <PDFTest />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/career-hub" element={
                    <ProtectedRoute>
                      <CareerHub />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/skill-intelligence" element={
                    <ProtectedRoute>
                      <SkillIntelligence />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/skills/intelligence" element={
                    <ProtectedRoute>
                      <SkillIntelligence />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/learning-history" element={
                    <ProtectedRoute>
                      <LearningHistory />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/assessments" element={
                    <ProtectedRoute>
                      <Assessments />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/opportunities" element={
                    <ProtectedRoute>
                      <Opportunities />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/readiness" element={
                    <ProtectedRoute>
                      <Readiness />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/resume-intelligence" element={
                    <ProtectedRoute>
                      <ResumeIntelligence />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/insights" element={
                    <ProtectedRoute>
                      <Insights />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/roadmap-builder" element={
                    <ProtectedRoute>
                      <RoadmapBuilder />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/activity" element={
                    <ProtectedRoute>
                      <Activity />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/settings" element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/courses" element={
                    <ProtectedRoute>
                      <Courses />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/help" element={
                    <ProtectedRoute>
                      <Help />
                    </ProtectedRoute>
                  } />
                  
                  {/* Guide Routes */}
                  <Route path="/guide/add-skills" element={
                    <ProtectedRoute>
                      <AddSkillsGuide />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/guide/career-goal" element={
                    <ProtectedRoute>
                      <CareerGoalGuide />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/guide/skill-gap" element={
                    <ProtectedRoute>
                      <SkillGapGuide />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/guide/roadmap" element={
                    <ProtectedRoute>
                      <RoadmapGuide />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/guide/growth-tracking" element={
                    <ProtectedRoute>
                      <GrowthTrackingGuide />
                    </ProtectedRoute>
                  } />
                  
                  {/* Catch all route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </ErrorBoundary>
        </AppDataProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;