import { useEffect, useState } from "react";
import { useAppData } from "@/context/AppDataContext";
import { Layout } from "@/components/Layout";
import { MotivationDashboard } from "@/components/gamification/MotivationDashboard";
import { gamificationService, MotivationDashboard as DashboardDataType } from "@/services/gamificationService";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export const Motivation = () => {
  const { roadmapModules, loadRoadmapModules, loading: appLoading, selectedRole } = useAppData();
  const [dashboardData, setDashboardData] = useState<DashboardDataType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      await gamificationService.syncLegacyProgress();
      const data = await gamificationService.getDashboard();
      setDashboardData(data);
    } catch (err: any) {
      console.error("❌ Failed to fetch motivation dashboard:", err);
      setError(err?.message || "Failed to load motivation data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  useEffect(() => {
    // If we have a selected role and modules are not loaded, load them
    if (selectedRole && roadmapModules.length === 0) {
      loadRoadmapModules();
    }
  }, [selectedRole, roadmapModules.length, loadRoadmapModules]);

  const handleRetry = () => {
    fetchDashboard();
    if (selectedRole) {
      loadRoadmapModules();
    }
  };

  return (
    <Layout>
      <div className="w-full">
        {loading || (appLoading && roadmapModules.length === 0) ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground animate-pulse">
              Loading motivation engine...
            </p>
          </div>
        ) : error ? (
          <div className="max-w-xl mx-auto mt-12 space-y-4">
            <Alert variant="destructive" className="border-red-500/20 bg-red-500/5">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error Loading Dashboard</AlertTitle>
              <AlertDescription className="text-sm">
                {error}
              </AlertDescription>
            </Alert>
            <div className="text-center">
              <Button onClick={handleRetry} variant="outline" className="gap-2">
                Retry loading
              </Button>
            </div>
          </div>
        ) : dashboardData ? (
          <MotivationDashboard data={dashboardData} roadmapModules={roadmapModules} />
        ) : null}
      </div>
    </Layout>
  );
};

export default Motivation;
