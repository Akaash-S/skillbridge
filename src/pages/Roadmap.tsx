import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAppData } from "@/context/AppDataContext";
import { Layout } from "@/components/Layout";
import { SkillChip } from "@/components/SkillChip";
import { StepIndicator } from "@/components/StepIndicator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  BookOpen, 
  ExternalLink, 
  Clock, 
  CheckCircle2, 
  Circle,
  Video,
  FileText,
  GraduationCap,
  Code,
  Loader2,
  AlertCircle,
  RefreshCw,
  BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";
import { hasRoadmapTemplate } from "@/data/fixedRoadmaps";

const resourceTypeIcons = {
  course: GraduationCap,
  tutorial: Code,
  documentation: FileText,
  video: Video,
};

export const Roadmap = () => {
  const { 
    selectedRole, 
    roadmap, 
    analysis, 
    loading,
    error,
    markRoadmapItemComplete, 
    loadFixedRoadmap,
    clearError
  } = useAppData();
  
  const navigate = useNavigate();
  const [localLoading, setLocalLoading] = useState(false);
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());

  // Debug logging
  console.log('🔍 Roadmap Component State:', {
    selectedRole: selectedRole?.title || 'None',
    hasAnalysis: !!analysis,
    roadmapLength: roadmap.length,
    loading,
    localLoading,
    error: error || 'None'
  });

  // Simplified initialization logic - Fixed to prevent circular dependencies
  useEffect(() => {
    const initializeRoadmap = async () => {
      console.log('🔄 Initializing roadmap component...');
      
      // Check prerequisites
      if (!selectedRole) {
        console.log('❌ No role selected, redirecting to roles page');
        navigate("/roles");
        return;
      }
      
      if (!analysis) {
        console.log('❌ No analysis found, redirecting to analysis page');
        navigate("/analysis");
        return;
      }

      // Load roadmap if not already loaded and not currently loading
      if (roadmap.length === 0 && !loading && !localLoading) {
        console.log('📋 Loading roadmap for role:', selectedRole.id);
        setLocalLoading(true);
        try {
          await loadFixedRoadmap();
          console.log('✅ Roadmap loaded successfully');
        } catch (error) {
          console.error('❌ Failed to load roadmap:', error);
        } finally {
          setLocalLoading(false);
        }
      } else if (roadmap.length > 0) {
        console.log('✅ Roadmap already loaded with', roadmap.length, 'items');
      }
    };

    // Only run initialization if we have the required dependencies
    if (selectedRole && analysis) {
      initializeRoadmap();
    }
  }, [selectedRole?.id, analysis?.readinessScore, loading]); // Stable dependencies to prevent loops

  // Handle roadmap item completion with optimistic updates
  const handleItemComplete = async (itemId: string) => {
    if (updatingItems.has(itemId)) return; // Prevent double-clicks

    setUpdatingItems(prev => new Set(prev).add(itemId));
    
    try {
      await markRoadmapItemComplete(itemId);
      console.log('✅ Roadmap item updated successfully:', itemId);
    } catch (error) {
      console.error('❌ Failed to update roadmap item:', error);
      // Error handling is done in the context, UI will revert automatically
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  // Calculate progress
  const completedCount = roadmap.filter((item) => item.completed).length;
  const progressPercent = roadmap.length > 0 ? Math.round((completedCount / roadmap.length) * 100) : 0;

  // Early return for missing prerequisites (before any rendering)
  if (!selectedRole) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center max-w-md mx-auto">
          <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Target Role Selected</h2>
          <p className="text-muted-foreground mb-6">
            Please select a target role first to generate your learning roadmap.
          </p>
          <Link to="/roles">
            <Button>Select Role</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  if (!analysis) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center max-w-md mx-auto">
          <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Analysis Required</h2>
          <p className="text-muted-foreground mb-6">
            Complete the skill analysis to access your curated learning roadmap.
          </p>
          <Link to="/analysis">
            <Button>Go to Analysis</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  // Loading state
  if (loading || localLoading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <h2 className="text-xl font-semibold mb-2">Loading Your Roadmap</h2>
          <p className="text-muted-foreground">
            Preparing your personalized learning path for {selectedRole.title}...
          </p>
        </div>
      </Layout>
    );
  }

  // Error state
  if (error) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center max-w-md mx-auto">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h2 className="text-xl font-semibold mb-2">Unable to Load Roadmap</h2>
          <p className="text-muted-foreground mb-6">
            {error}
          </p>
          <div className="flex gap-3">
            <Button onClick={() => {
              clearError();
              loadFixedRoadmap();
            }} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
            <Link to="/analysis">
              <Button variant="outline">Back to Analysis</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  // No roadmap data state (after loading completed)
  if (roadmap.length === 0) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center max-w-md mx-auto">
          <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Roadmap Available</h2>
          <p className="text-muted-foreground mb-6">
            {selectedRole && !hasRoadmapTemplate(selectedRole.id)
              ? `We don't have a pre-built roadmap for ${selectedRole.title} yet. Try selecting a different role or check back later.`
              : "Unable to load roadmap data. Please try again."
            }
          </p>
          <div className="flex gap-3">
            {selectedRole && !hasRoadmapTemplate(selectedRole.id) ? (
              <>
                <Link to="/roles">
                  <Button>Choose Different Role</Button>
                </Link>
                <Link to="/analysis">
                  <Button variant="outline">Back to Analysis</Button>
                </Link>
              </>
            ) : (
              <>
                <Button 
                  onClick={() => loadFixedRoadmap()}
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Retry Loading
                </Button>
                <Link to="/analysis">
                  <Button variant="outline">Back to Analysis</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </Layout>
    );
  }

  // Main roadmap content - only render if we have valid roadmap data
  if (roadmap.length > 0) {
    console.log('✅ Rendering roadmap with', roadmap.length, 'items');
  } else {
    console.log('⚠️ No roadmap items to render');
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Step Indicator */}
        <StepIndicator currentStep={4} />

        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Your Path to {selectedRole.title}</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Follow this curated roadmap to master the essential skills for your target role. 
            Mark items as complete as you progress through your learning journey.
          </p>
        </div>

        {/* Progress Bar */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium">Overall Progress</span>
              <span className="text-sm text-muted-foreground">
                {completedCount} of {roadmap.length} skills completed
              </span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500 ease-out rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-center text-2xl font-bold mt-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {progressPercent}% Complete
            </p>
          </CardContent>
        </Card>

        {/* Success Message */}
        {progressPercent === 100 && (
          <Alert className="border-green-200 bg-green-50 dark:bg-green-950">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              🎉 Congratulations! You've completed your roadmap for {selectedRole.title}. 
              You're now ready to apply for positions in this role!
            </AlertDescription>
          </Alert>
        )}

        {/* Roadmap Timeline */}
        <div className="space-y-0">
          {roadmap.map((item, index) => {
            const isUpdating = updatingItems.has(item.id);
            
            return (
              <div key={item.id} className="relative">
                {/* Timeline Line */}
                {index < roadmap.length - 1 && (
                  <div
                    className={cn(
                      "absolute left-5 top-12 w-0.5 h-full -translate-x-1/2 transition-colors duration-300",
                      item.completed ? "bg-gradient-to-b from-primary to-accent" : "bg-border"
                    )}
                  />
                )}

                <Card
                  className={cn(
                    "relative ml-10 mb-4 transition-all duration-300",
                    item.completed && "opacity-75 bg-muted/30",
                    isUpdating && "opacity-50"
                  )}
                >
                  {/* Timeline Node */}
                  <div
                    className={cn(
                      "absolute -left-10 top-6 h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                      item.completed
                        ? "bg-gradient-to-r from-primary to-accent border-primary text-white shadow-lg"
                        : "bg-background border-border text-muted-foreground hover:border-primary/50"
                    )}
                  >
                    {isUpdating ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : item.completed ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <Circle className="h-5 w-5" />
                    )}
                  </div>

                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <CardTitle className={cn(
                          "text-xl transition-all duration-300",
                          item.completed && "line-through text-muted-foreground"
                        )}>
                          {item.skillName}
                        </CardTitle>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <SkillChip
                            name={item.difficulty}
                            size="sm"
                            showProficiency={false}
                          />
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {item.estimatedTime}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={item.completed}
                          onCheckedChange={() => handleItemComplete(item.id)}
                          className="h-6 w-6"
                          disabled={isUpdating}
                        />
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-3">Learning Resources</h4>
                      {item.resources && item.resources.length > 0 ? (
                        <div className="grid gap-2">
                          {item.resources.map((resource, resourceIndex) => {
                            const Icon = resourceTypeIcons[resource.type] || FileText;
                            return (
                              <a
                                key={`${item.id}-resource-${resource.id || resourceIndex}`}
                                href={resource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
                              >
                                <div className="h-8 w-8 rounded-md bg-background flex items-center justify-center">
                                  <Icon className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                                    {resource.title}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {resource.provider} • {resource.duration}
                                  </p>
                                </div>
                                <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                              </a>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-6 text-muted-foreground">
                          <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">
                            No specific resources available yet.
                          </p>
                          <p className="text-xs mt-1">
                            Try searching online for "{item.skillName}" tutorials and courses.
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-4 pt-8">
          <Link to="/analysis">
            <Button variant="outline" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Back to Analysis
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button className="gap-2">
              <BookOpen className="h-4 w-4" />
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
};
