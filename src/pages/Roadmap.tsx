import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAppData } from "@/context/AppDataContext";
import { Layout } from "@/components/Layout";
import { SkillChip } from "@/components/SkillChip";
import { StepIndicator } from "@/components/StepIndicator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  BookOpen, 
  ExternalLink, 
  Clock, 
  CheckCircle2, 
  Circle,
  Video,
  FileText,
  GraduationCap,
  Code
} from "lucide-react";
import { cn } from "@/lib/utils";

const resourceTypeIcons = {
  course: GraduationCap,
  tutorial: Code,
  documentation: FileText,
  video: Video,
};

export const Roadmap = () => {
  const { selectedRole, roadmap, analysis, markRoadmapItemComplete, generateRoadmap, loadRoadmapProgress } = useAppData();
  const navigate = useNavigate();

  useEffect(() => {
    if (!selectedRole) {
      navigate("/roles");
      return;
    }
    if (!analysis) {
      navigate("/analysis");
      return;
    }
    
    // First try to load existing roadmap progress
    const initializeRoadmap = async () => {
      try {
        await loadRoadmapProgress();
        
        // If no roadmap was loaded, generate a new one
        if (roadmap.length === 0) {
          await generateRoadmap();
        }
      } catch (error) {
        console.error('Failed to initialize roadmap:', error);
        // Fallback to generating new roadmap
        try {
          await generateRoadmap();
        } catch (generateError) {
          console.error('Failed to generate fallback roadmap:', generateError);
        }
      }
    };
    
    initializeRoadmap();
  }, [selectedRole, analysis, loadRoadmapProgress, generateRoadmap, navigate]);

  const completedCount = roadmap.filter((item) => item.completed).length;
  const progressPercent = roadmap.length > 0 ? Math.round((completedCount / roadmap.length) * 100) : 0;

  if (!selectedRole || roadmap.length === 0) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Roadmap Available</h2>
          <p className="text-muted-foreground mb-4">
            Complete the skill analysis first to generate your learning roadmap.
          </p>
          <Link to="/analysis">
            <Button>Go to Analysis</Button>
          </Link>
        </div>
      </Layout>
    );
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
            Follow this personalized roadmap to bridge your skill gaps. 
            Mark items as complete as you progress.
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
                className="h-full bg-accent transition-all duration-500 ease-out rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-center text-2xl font-bold mt-4 text-accent">
              {progressPercent}% Complete
            </p>
          </CardContent>
        </Card>

        {/* Roadmap Timeline */}
        <div className="space-y-0">
          {roadmap.map((item, index) => (
            <div key={item.id} className="relative">
              {/* Timeline Line */}
              {index < roadmap.length - 1 && (
                <div
                  className={cn(
                    "absolute left-5 top-12 w-0.5 h-full -translate-x-1/2",
                    item.completed ? "bg-accent" : "bg-border"
                  )}
                />
              )}

              <Card
                className={cn(
                  "relative ml-10 mb-4 transition-all",
                  item.completed && "opacity-75"
                )}
              >
                {/* Timeline Node */}
                <div
                  className={cn(
                    "absolute -left-10 top-6 h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all",
                    item.completed
                      ? "bg-accent border-accent text-accent-foreground"
                      : "bg-background border-border text-muted-foreground"
                  )}
                >
                  {item.completed ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <Circle className="h-5 w-5" />
                  )}
                </div>

                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <CardTitle className={cn("text-xl", item.completed && "line-through")}>
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
                        onCheckedChange={async () => {
                          try {
                            await markRoadmapItemComplete(item.id);
                          } catch (error) {
                            console.error('Failed to update roadmap item:', error);
                            // You might want to show a toast notification here
                          }
                        }}
                        className="h-6 w-6"
                        disabled={false} // Could add loading state here
                      />
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-3">Learning Resources</h4>
                    {item.resources.length > 0 ? (
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
                      <p className="text-sm text-muted-foreground">
                        No specific resources available. Try searching online for tutorials.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-4">
          <Link to="/analysis">
            <Button variant="outline">Back to Analysis</Button>
          </Link>
          <Link to="/dashboard">
            <Button>Go to Dashboard</Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
};
