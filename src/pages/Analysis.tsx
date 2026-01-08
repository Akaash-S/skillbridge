import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { Layout } from "@/components/Layout";
import { ProgressCircle } from "@/components/ProgressCircle";
import { SkillChip } from "@/components/SkillChip";
import { StepIndicator } from "@/components/StepIndicator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle, AlertCircle, ArrowRight, BarChart3, Target, TrendingUp, Loader2 } from "lucide-react";
import { apiService } from "@/services/api";

export const Analysis = () => {
  const { 
    selectedRole, 
    analysis, 
    analysisProgress,
    roadmapProgress,
    isAuthenticated,
    generateRoadmap, 
    loadRoadmapProgress,
    loading, 
    error, 
    clearError
  } = useApp();
  const navigate = useNavigate();
  
  const [detailedAnalysis, setDetailedAnalysis] = useState<any>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  useEffect(() => {
    if (!selectedRole) {
      navigate("/roles");
      return;
    }
    
    // Load detailed analysis with role matching
    loadDetailedAnalysis();
  }, [selectedRole, navigate]);

  // Load detailed skill analysis for the selected role
  const loadDetailedAnalysis = async () => {
    if (!selectedRole) return;
    
    setLoadingAnalysis(true);
    try {
      const result = await apiService.getSkillsWithRoleAnalysis(selectedRole.id);
      if (result.roleAnalysis) {
        setDetailedAnalysis(result.roleAnalysis);
      }
    } catch (error) {
      console.error('Failed to load detailed analysis:', error);
    } finally {
      setLoadingAnalysis(false);
    }
  };

  // Separate effect for loading roadmap progress - only run once when component mounts
  useEffect(() => {
    if (isAuthenticated && selectedRole) {
      loadRoadmapProgress();
    }
  }, [isAuthenticated, selectedRole]);

  const handleViewRoadmap = () => {
    navigate("/roadmap");
  };

  const handleGenerateRoadmap = async () => {
    if (selectedRole) {
      try {
        await generateRoadmap();
        navigate("/roadmap");
      } catch (error) {
        console.error('Failed to generate roadmap:', error);
      }
    }
  };

  // Use detailed analysis if available, fallback to context analysis
  const currentAnalysis = detailedAnalysis || analysis;

  // Memoize expensive calculations
  const scoreMessage = useMemo(() => {
    if (!currentAnalysis) return "";
    if (currentAnalysis.readinessScore >= 80) return "You're almost there!";
    if (currentAnalysis.readinessScore >= 60) return "Good progress, keep learning!";
    if (currentAnalysis.readinessScore >= 40) return "You're on your way!";
    return "Time to start building skills!";
  }, [currentAnalysis?.readinessScore]);

  const scoreColor = useMemo(() => {
    if (!currentAnalysis) return "text-muted-foreground";
    if (currentAnalysis.readinessScore >= 70) return "text-green-600";
    if (currentAnalysis.readinessScore >= 40) return "text-yellow-600";
    return "text-red-600";
  }, [currentAnalysis?.readinessScore]);

  if (!selectedRole) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto text-center py-12">
          <Target className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">No Target Role Selected</h2>
          <p className="text-muted-foreground mb-6">
            Please select a target role to see your skill gap analysis.
          </p>
          <Link to="/roles">
            <Button>
              Choose Target Role
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={clearError}>Try Again</Button>
          </div>
        </div>
      </Layout>
    );
  }

  // Loading state
  if (loadingAnalysis || (!currentAnalysis && loading)) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Analyzing your skills for {selectedRole.title}...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // No analysis available
  if (!currentAnalysis) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto text-center py-12">
          <BarChart3 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">Analysis Not Available</h2>
          <p className="text-muted-foreground mb-6">
            Unable to analyze skills for {selectedRole.title}. Please try again.
          </p>
          <Button onClick={loadDetailedAnalysis}>
            Retry Analysis
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Step Indicator */}
        <StepIndicator currentStep={3} />

        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Skill Gap Analysis</h1>
          <p className="text-muted-foreground">
            Here's how your skills match up against <span className="font-medium text-foreground">{selectedRole.title}</span>
          </p>
          {analysisProgress && analysisProgress.completedRoadmapItems > 0 && (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 dark:bg-green-950/20 text-green-600 rounded-full text-sm">
              <CheckCircle2 className="h-4 w-4" />
              Analysis updates automatically as you complete roadmap items
            </div>
          )}
        </div>

        {/* Readiness Score */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-br from-primary/5 to-accent/5 p-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <ProgressCircle value={currentAnalysis.readinessScore} size="xl" />
              <div className="text-center md:text-left">
                <h2 className="text-2xl font-bold mb-2">Role Readiness Score</h2>
                <p className={`text-xl font-semibold ${scoreColor}`}>
                  {scoreMessage}
                </p>
                <p className="text-muted-foreground mt-2">
                  You have {currentAnalysis.matchedSkills?.length || 0} of {currentAnalysis.totalRequired || 0} required skills at the needed level.
                </p>
                
                {/* Progress Comparison */}
                {analysisProgress && analysisProgress.scoreImprovement !== 0 && (
                  <div className="mt-4 p-4 bg-background/50 rounded-lg border">
                    <h3 className="font-medium mb-2">Progress Since Initial Analysis</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Score Improvement:</span>
                        <div className={`font-semibold ${analysisProgress.scoreImprovement > 0 ? 'text-green-600' : 'text-muted-foreground'}`}>
                          {analysisProgress.scoreImprovement > 0 ? '+' : ''}{analysisProgress.scoreImprovement}%
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Skills Gained:</span>
                        <div className={`font-semibold ${analysisProgress.skillsImprovement > 0 ? 'text-green-600' : 'text-muted-foreground'}`}>
                          +{analysisProgress.skillsImprovement}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Skills Breakdown */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Matched Skills */}
          <Card className="border-green-200 dark:border-green-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                Matched Skills ({currentAnalysis.matchedSkills?.length || 0})
              </CardTitle>
              <CardDescription>
                Skills you have at the required level
              </CardDescription>
            </CardHeader>
            <CardContent>
              {currentAnalysis.matchedSkills?.length > 0 ? (
                <div className="space-y-2">
                  {currentAnalysis.matchedSkills.map((item: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-950/20 rounded">
                      <span className="font-medium">{item.skill?.name || item.skillName}</span>
                      <span className="text-sm text-green-600 capitalize">{item.userLevel || item.skill?.proficiency}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No fully matched skills yet.</p>
              )}
            </CardContent>
          </Card>

          {/* Partial Skills */}
          <Card className="border-yellow-200 dark:border-yellow-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 text-yellow-600">
                <AlertCircle className="h-5 w-5" />
                Need Improvement ({currentAnalysis.partialSkills?.length || 0})
              </CardTitle>
              <CardDescription>
                Skills you have but need to level up
              </CardDescription>
            </CardHeader>
            <CardContent>
              {currentAnalysis.partialSkills?.length > 0 ? (
                <div className="space-y-2">
                  {currentAnalysis.partialSkills.map((item: any, index: number) => (
                    <div key={index} className="p-2 bg-yellow-50 dark:bg-yellow-950/20 rounded">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{item.skill?.name || item.skillName}</span>
                        <span className="text-sm text-yellow-600">{item.gap || `${item.userLevel} → ${item.required}`}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No partial matches.</p>
              )}
            </CardContent>
          </Card>

          {/* Missing Skills */}
          <Card className="border-red-200 dark:border-red-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 text-red-600">
                <XCircle className="h-5 w-5" />
                Missing Skills ({currentAnalysis.missingSkills?.length || 0})
              </CardTitle>
              <CardDescription>
                Skills you need to learn
              </CardDescription>
            </CardHeader>
            <CardContent>
              {currentAnalysis.missingSkills?.length > 0 ? (
                <div className="space-y-2">
                  {currentAnalysis.missingSkills.map((item: any, index: number) => (
                    <div key={index} className="p-2 bg-red-50 dark:bg-red-950/20 rounded">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{item.skillName}</span>
                        <span className="text-sm text-red-600 capitalize">{item.required}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No missing skills!</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Roadmap Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Learning Roadmap
            </CardTitle>
            <CardDescription>
              Get a personalized learning path to reach your goal
            </CardDescription>
          </CardHeader>
          <CardContent>
            {roadmapProgress ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Your roadmap is ready!</p>
                    <p className="text-sm text-muted-foreground">
                      {roadmapProgress.completedItems || 0} of {roadmapProgress.totalItems || 0} items completed
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      {Math.round(roadmapProgress.progress || 0)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Complete</div>
                  </div>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                    style={{ width: `${roadmapProgress.progress || 0}%` }}
                  />
                </div>
                <Button onClick={handleViewRoadmap} className="w-full">
                  Continue Learning
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Target className="h-8 w-8 text-primary" />
                </div>
                <p className="text-muted-foreground mb-4">
                  Ready to start your learning journey?
                </p>
                <div className="space-y-2">
                  <Button onClick={handleGenerateRoadmap} disabled={loading} className="w-full">
                    {loading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <TrendingUp className="mr-2 h-4 w-4" />
                    )}
                    Generate Learning Roadmap
                  </Button>
                  <Button variant="outline" onClick={handleViewRoadmap} className="w-full">
                    View Roadmap Page
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};