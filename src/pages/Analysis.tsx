import { useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { Layout } from "@/components/Layout";
import { ProgressCircle } from "@/components/ProgressCircle";
import { SkillChip } from "@/components/SkillChip";
import { StepIndicator } from "@/components/StepIndicator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle, AlertCircle, ArrowRight, BarChart3 } from "lucide-react";

export const Analysis = () => {
  const { 
    selectedRole, 
    analysis, 
    analysisProgress,
    userSkills, 
    roadmapProgress,
    isAuthenticated,
    analyzeSkillGap, 
    generateRoadmap, 
    loadRoadmapProgress,
    loading, 
    error, 
    clearError
  } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    if (!selectedRole) {
      navigate("/roles");
      return;
    }
    
    // Only analyze if we don't have analysis data and not currently loading
    if (!analysis && !loading) {
      analyzeSkillGap();
    }
  }, [selectedRole, navigate]); // Removed analysis and loading from dependencies to prevent loops

  // Separate effect for loading roadmap progress - only run once when component mounts
  useEffect(() => {
    if (isAuthenticated && selectedRole) {
      loadRoadmapProgress();
    }
  }, [isAuthenticated, selectedRole]); // Only depend on authentication and selected role

  const handleViewRoadmap = () => {
    navigate("/roadmap");
  };

  // Memoize expensive calculations
  const scoreMessage = useMemo(() => {
    if (!analysis) return "";
    if (analysis.readinessScore >= 80) return "You're almost there!";
    if (analysis.readinessScore >= 60) return "Good progress, keep learning!";
    if (analysis.readinessScore >= 40) return "You're on your way!";
    return "Time to start building skills!";
  }, [analysis?.readinessScore]);

  const scoreColor = useMemo(() => {
    if (!analysis) return "text-muted-foreground";
    if (analysis.readinessScore >= 70) return "text-progress-high";
    if (analysis.readinessScore >= 40) return "text-progress-medium";
    return "text-progress-low";
  }, [analysis?.readinessScore]);

  // Early return with loading state
  if (!selectedRole || !analysis) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-pulse text-muted-foreground">Analyzing skills...</div>
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
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-progress-high/10 text-progress-high rounded-full text-sm">
              <CheckCircle2 className="h-4 w-4" />
              Analysis updates automatically as you complete roadmap items
            </div>
          )}
          {error && (
            <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-lg">
              {error}
              <Button variant="ghost" size="sm" onClick={clearError} className="ml-2">
                Dismiss
              </Button>
            </div>
          )}
        </div>

        {/* Readiness Score */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-br from-primary/5 to-accent/5 p-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <ProgressCircle value={analysis.readinessScore} size="xl" />
              <div className="text-center md:text-left">
                <h2 className="text-2xl font-bold mb-2">Role Readiness Score</h2>
                <p className={`text-xl font-semibold ${scoreColor}`}>
                  {scoreMessage}
                </p>
                <p className="text-muted-foreground mt-2">
                  You have {analysis.matchedSkills.length} of {selectedRole.requiredSkills.length} required skills at the needed level.
                </p>
                
                {/* Progress Comparison */}
                {analysisProgress && analysisProgress.scoreImprovement !== 0 && (
                  <div className="mt-4 p-4 bg-background/50 rounded-lg border">
                    <h3 className="font-medium mb-2">Progress Since Initial Analysis</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Score Improvement:</span>
                        <div className={`font-semibold ${analysisProgress.scoreImprovement > 0 ? 'text-progress-high' : 'text-muted-foreground'}`}>
                          {analysisProgress.scoreImprovement > 0 ? '+' : ''}{analysisProgress.scoreImprovement}%
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Skills Gained:</span>
                        <div className={`font-semibold ${analysisProgress.skillsImprovement > 0 ? 'text-progress-high' : 'text-muted-foreground'}`}>
                          {analysisProgress.skillsImprovement > 0 ? '+' : ''}{analysisProgress.skillsImprovement}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Initial Score:</span>
                        <div className="font-semibold">{analysisProgress.initialScore}%</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Roadmap Items:</span>
                        <div className="font-semibold">{analysisProgress.completedRoadmapItems} completed</div>
                      </div>
                    </div>
                    {analysisProgress.lastUpdated && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        Last updated: {new Date(analysisProgress.lastUpdated).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Skills Breakdown */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Matched Skills */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-progress-high" />
                <CardTitle className="text-lg">Matched Skills</CardTitle>
              </div>
              <CardDescription>
                Skills you have at the required level
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analysis.matchedSkills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {analysis.matchedSkills.map(({ skill }) => (
                    <SkillChip
                      key={skill.id}
                      name={skill.name}
                      proficiency={skill.proficiency}
                      size="sm"
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No fully matched skills yet.</p>
              )}
            </CardContent>
          </Card>

          {/* Partial Skills */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-progress-medium" />
                <CardTitle className="text-lg">Need Improvement</CardTitle>
              </div>
              <CardDescription>
                Skills that need higher proficiency
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analysis.partialSkills.length > 0 ? (
                <div className="space-y-2">
                  {analysis.partialSkills.map(({ skill, required }) => (
                    <div key={skill.id} className="flex items-center justify-between text-sm">
                      <span>{skill.name}</span>
                      <span className="text-muted-foreground">
                        {skill.proficiency} → {required}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No partial matches.</p>
              )}
            </CardContent>
          </Card>

          {/* Missing Skills */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-progress-low" />
                <CardTitle className="text-lg">Missing Skills</CardTitle>
              </div>
              <CardDescription>
                Skills you need to learn
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analysis.missingSkills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {analysis.missingSkills.map((skill) => (
                    <SkillChip
                      key={skill.skillId}
                      name={skill.skillName}
                      proficiency={skill.required}
                      size="sm"
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No missing skills!</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Roadmap Progress Section */}
        {roadmapProgress?.hasRoadmap ? (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                <CardTitle>Learning Roadmap Progress</CardTitle>
              </div>
              <CardDescription>
                Your progress on the current learning roadmap
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Overall Progress */}
                <div className="space-y-4">
                  <h4 className="font-medium">Overall Progress</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Skills Completed</span>
                      <span className="text-sm font-medium">
                        {roadmapProgress.progress.overall.completedSkills} / {roadmapProgress.progress.overall.totalSkills}
                      </span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${roadmapProgress.progress.overall.skillProgress}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{roadmapProgress.progress.overall.skillProgress}% Complete</span>
                      <span>{roadmapProgress.progress.timeEstimate.estimatedWeeksRemaining} weeks remaining</span>
                    </div>
                  </div>
                </div>

                {/* Milestones Progress */}
                <div className="space-y-4">
                  <h4 className="font-medium">Milestones</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Milestones Completed</span>
                      <span className="text-sm font-medium">
                        {roadmapProgress.progress.overall.completedMilestones} / {roadmapProgress.progress.overall.totalMilestones}
                      </span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div 
                        className="bg-progress-medium h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${roadmapProgress.progress.overall.milestoneProgress}%` }}
                      />
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {roadmapProgress.progress.overall.milestoneProgress}% Complete
                    </div>
                  </div>
                </div>
              </div>

              {/* Skills by Difficulty */}
              <div className="mt-6 pt-6 border-t">
                <h4 className="font-medium mb-4">Progress by Difficulty Level</h4>
                <div className="grid grid-cols-3 gap-4">
                  {Object.entries(roadmapProgress.progress.byDifficulty).map(([difficulty, stats]: [string, any]) => (
                    <div key={difficulty} className="text-center">
                      <div className="text-sm font-medium capitalize mb-1">{difficulty}</div>
                      <div className="text-2xl font-bold text-primary">
                        {stats.completed}/{stats.total}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              {roadmapProgress.progress.recentActivity?.length > 0 && (
                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-medium mb-4">Recent Completions</h4>
                  <div className="space-y-2">
                    {roadmapProgress.progress.recentActivity.map((activity: any, index: number) => (
                      <div key={index} className="flex items-center gap-3 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-progress-high" />
                        <span className="font-medium">{activity.skillName}</span>
                        <span className="text-muted-foreground">in {activity.milestone}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ) : roadmapProgress?.hasRoadmap === false ? (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-muted-foreground" />
                <CardTitle>Learning Roadmap</CardTitle>
              </div>
              <CardDescription>
                No active roadmap found
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <p className="text-muted-foreground mb-4">
                  Generate a learning roadmap to track your progress and get personalized recommendations.
                </p>
                <Button onClick={handleViewRoadmap}>
                  <BarChart3 className="mr-2 h-4 w-4" />
                  View Roadmap
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/skills">
            <Button variant="outline">Update My Skills</Button>
          </Link>
          <Button 
            onClick={handleViewRoadmap} 
            size="lg" 
            className="group"
          >
            View Learning Roadmap
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </Layout>
  );
};
