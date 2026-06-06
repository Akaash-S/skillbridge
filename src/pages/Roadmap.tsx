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
  BarChart3,
  TrendingUp,
  Trophy,
  Award,
  Sparkles,
  Shield,
  Lock,
  ChevronLeft,
  HelpCircle,
  Check
} from "lucide-react";
import { cn, isRoadmapCompleted } from "@/lib/utils";
import { apiClient } from "@/services/apiClient";
import { hasRoadmapTemplate } from "@/data/fixedRoadmaps";
import { CompletionMessage } from "@/components/CompletionMessage";
import { Certificate } from "@/components/Certificate";
import { certificateService, Certificate as CertificateData } from "@/services/certificateService";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { toast } from "sonner";

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
    clearError,
    learningMode,
    roadmapModules,
    setLearningMode,
    loadRoadmapModules,
    completeModule,
    fetchModuleQuiz,
    submitModuleQuiz,
    roadmapProgress
  } = useAppData();

  const navigate = useNavigate();
  const [localLoading, setLocalLoading] = useState(false);
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
  const [issuedCertificate, setIssuedCertificate] = useState<CertificateData | null>(null);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [isIssuing, setIsIssuing] = useState(false);
  const [assessmentStatus, setAssessmentStatus] = useState<{ passed: boolean; checked: boolean }>({ passed: false, checked: false });

  // Guided learning journey views and states
  const [currentView, setCurrentView] = useState<'roadmap-list' | 'learning-pref' | 'learning-screen' | 'quiz-screen'>('roadmap-list');
  const [selectedModuleIndex, setSelectedModuleIndex] = useState<number | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizResult, setQuizResult] = useState<{ score: number; passed: boolean; quizAttempts: number } | null>(null);

  // Calculate progress - MUST be declared before any useEffect that references it
  const completedCount = roadmap.filter((item) => item.completed).length;
  const progressPercent = roadmap.length > 0 ? Math.round((completedCount / roadmap.length) * 100) : 0;

  // Simplified initialization logic - Allow roadmap to render even with 0% progress
  useEffect(() => {
    const initializeRoadmap = async () => {

      // Check prerequisites - but allow users with analysis to proceed even with 0% progress
      if (!selectedRole) {
        navigate("/roles");
        return;
      }

      // Allow users to access roadmap if they have a selected role, even without analysis
      // This enables the roadmap template to render for users with 0% progress
      if (!analysis && !hasRoadmapTemplate(selectedRole.id)) {
        navigate("/analysis");
        return;
      }

      // Load roadmap if not already loaded and not currently loading
      if (roadmap.length === 0 && !loading && !localLoading) {
        setLocalLoading(true);
        try {
          await loadFixedRoadmap();
        } catch (error) {
          console.error('❌ Failed to load roadmap:', error);
        } finally {
          setLocalLoading(false);
        }
      } else if (roadmap.length > 0) {
      }
    };

    // Run initialization if we have a selected role
    if (selectedRole) {
      initializeRoadmap();
    }
  }, [selectedRole?.id, loading]); // Removed analysis dependency to allow 0% users

  // Reset assessment status when role changes
  useEffect(() => {
    setAssessmentStatus({ passed: false, checked: false });
  }, [selectedRole?.id]);

  // Load roadmap modules on mount or role load
  useEffect(() => {
    if (selectedRole && roadmapModules.length === 0 && !loading) {
      loadRoadmapModules();
    }
  }, [selectedRole?.id, roadmapModules.length, loading]);

  // Route guard: Auto-redirect to learning preference screen if not set
  useEffect(() => {
    if (roadmap.length > 0 && learningMode === null && !loading) {
      setCurrentView('learning-pref');
    } else if (learningMode !== null && currentView === 'learning-pref') {
      setCurrentView('roadmap-list');
    }
  }, [roadmap.length, learningMode, loading]);

  // Handle saving learning mode preference
  const handleSavePref = async (mode: 'video' | 'documentation' | 'mixed') => {
    try {
      setLocalLoading(true);
      await setLearningMode(mode);
      setCurrentView('roadmap-list');
      toast.success(`Learning preference set to ${mode}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save learning preference.");
    } finally {
      setLocalLoading(false);
    }
  };

  // Check assessment eligibility and status when roadmap is 100%
  useEffect(() => {
    const checkAssessment = async () => {
      if (progressPercent === 100 && selectedRole && !assessmentStatus.checked) {
        try {
          const res = await apiClient.get<any>(`/assessment/eligibility/${selectedRole.id}`);
          setAssessmentStatus({
            passed: res.reason === 'Assessment already passed',
            checked: true
          });
        } catch (error) {
          console.error("Failed to check assessment status:", error);
        }
      }
    };
    checkAssessment();
  }, [progressPercent, selectedRole?.id, assessmentStatus.checked]);

  // Handle roadmap item completion with optimistic updates and analysis refresh
  const handleItemComplete = async (itemId: string) => {
    if (updatingItems.has(itemId)) return; // Prevent double-clicks

    setUpdatingItems(prev => new Set(prev).add(itemId));

    try {
      await markRoadmapItemComplete(itemId);

      // Show success message with analysis update info
      const roadmapItem = roadmap.find(item => item.id === itemId);
      if (roadmapItem?.completed) {
        // Item was just completed
        setTimeout(() => {
        }, 1000);
      }
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

  const handleClaimCertificate = async () => {
    if (!selectedRole) return;

    setIsIssuing(true);
    try {
      const certificate = await certificateService.verifyAndIssue(selectedRole.id);
      setIssuedCertificate(certificate);
      setIsCertModalOpen(true);
      toast.success("Certificate issued successfully!");
    } catch (error: any) {
      console.error('❌ Failed to claim certificate:', error);
      toast.error(error.message || "Failed to issue certificate. Please ensure roadmap is complete.");
    } finally {
      setIsIssuing(false);
    }
  };

  // progressPercent and completedCount are declared above, before the useEffect hooks

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

  // Only redirect to analysis if we don't have a roadmap template for the role
  if (!analysis && !hasRoadmapTemplate(selectedRole.id)) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center max-w-md mx-auto">
          <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Analysis Required</h2>
          <p className="text-muted-foreground mb-6">
            Complete the skill analysis to access your curated learning roadmap for {selectedRole.title}.
          </p>
          <Link to="/analysis">
            <Button>Go to Analysis</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  // Loading state
  if ((loading || localLoading) && roadmap.length === 0) {
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

  const allQuizzesPassed = roadmapModules.length > 0
    ? roadmapModules.every((m: any) => m.quizPassed)
    : progressPercent === 100;

  if (currentView === 'learning-pref') {
    return (
      <Layout>
        <div className="max-w-md mx-auto space-y-6 py-12 px-4">
          <div className="text-center space-y-2">
            <Sparkles className="h-10 w-10 text-primary mx-auto animate-pulse" />
            <h2 className="text-2xl font-bold">Learning Preference</h2>
            <p className="text-muted-foreground text-sm">
              Tailor your learning journey! Choose your preferred content format to customize the resources displayed for each module.
            </p>
          </div>

          <div className="grid gap-4 pt-2">
            <button
              onClick={() => handleSavePref('video')}
              className="flex items-start gap-4 p-5 rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition-all text-left group"
            >
              <div className="p-3 bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 rounded-lg group-hover:scale-110 transition-transform">
                <Video className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-base">Video Learning</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Focus on video-based courses, tutorials, lectures, and visually engaging content.
                </p>
              </div>
            </button>

            <button
              onClick={() => handleSavePref('documentation')}
              className="flex items-start gap-4 p-5 rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition-all text-left group"
            >
              <div className="p-3 bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-lg group-hover:scale-110 transition-transform">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-base">Documentation Learning</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Focus on official docs, written articles, books, cheat sheets, and text guides.
                </p>
              </div>
            </button>

            <button
              onClick={() => handleSavePref('mixed')}
              className="flex items-start gap-4 p-5 rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition-all text-left group"
            >
              <div className="p-3 bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400 rounded-lg group-hover:scale-110 transition-transform flex gap-1">
                <Video className="h-5 w-5" />
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-base">Mixed Learning</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Show both video courses and documentation resources for a well-rounded experience.
                </p>
              </div>
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  if (currentView === 'learning-screen' && selectedModuleIndex !== null) {
    const module = roadmapModules[selectedModuleIndex];
    if (!module) return null;

    const videos: any[] = [];
    const docs: any[] = [];

    module.skills?.forEach((skill: any) => {
      skill.resources?.forEach((res: any) => {
        const resourceType = res.type?.toLowerCase() || 'course';
        const isVideo = resourceType === 'video' || resourceType === 'youtube';
        const resourceWithContext = { ...res, skillName: skill.skillName };

        if (learningMode === 'video' && !isVideo) return;
        if (learningMode === 'documentation' && isVideo) return;

        if (isVideo) {
          videos.push(resourceWithContext);
        } else {
          docs.push(resourceWithContext);
        }
      });
    });

    return (
      <Layout>
        <div className="max-w-3xl mx-auto space-y-6 py-6 px-4">
          <div className="flex items-center justify-between border-b pb-4">
            <Button
              variant="ghost"
              onClick={() => setCurrentView('roadmap-list')}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Roadmap
            </Button>
            <div className="text-right">
              <span className="text-xs text-muted-foreground block font-medium">Target Role</span>
              <span className="font-bold text-sm bg-primary/10 text-primary px-3 py-1 rounded-full">
                {selectedRole.title}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase bg-muted px-2 py-0.5 rounded">
                Module {selectedModuleIndex + 1}
              </span>
              {module.quizPassed && (
                <span className="text-xs font-semibold text-green-600 bg-green-100 dark:bg-green-950/40 px-2 py-0.5 rounded flex items-center gap-1">
                  <Check className="h-3 w-3" /> Passed
                </span>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold">{module.title}</h1>
            <p className="text-muted-foreground text-sm">{module.description}</p>
          </div>

          <Card className="bg-muted/30">
            <CardContent className="p-4 flex items-center justify-between gap-4">
              <div>
                <span className="text-sm font-semibold block">Module Skills Completed</span>
                <span className="text-xs text-muted-foreground">
                  {module.skills?.filter((s: any) => s.completed).length || 0} of {module.skills?.length || 0} skills mastered
                </span>
              </div>
              <div className="text-lg font-bold text-primary">
                {Math.round(((module.skills?.filter((s: any) => s.completed).length || 0) / (module.skills?.length || 1)) * 100)}%
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            {videos.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-bold flex items-center gap-2 text-red-600 dark:text-red-400">
                  <Video className="h-5 w-5" />
                  Video Resources
                </h3>
                <div className="grid gap-3">
                  {videos.map((res, rIdx) => (
                    <a
                      key={rIdx}
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-4 p-4 rounded-xl border border-border hover:border-red-500 hover:bg-red-500/5 transition-all group"
                    >
                      <div className="p-2.5 bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 rounded-lg">
                        <Video className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] uppercase font-semibold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                          {res.skillName}
                        </span>
                        <h4 className="font-semibold text-sm mt-1 truncate group-hover:text-red-600 transition-colors">
                          {res.title}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {res.provider} • {res.duration}
                        </p>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-red-600 transition-colors flex-shrink-0 mt-1" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {docs.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-bold flex items-center gap-2 text-blue-600 dark:text-blue-400">
                  <FileText className="h-5 w-5" />
                  Documentation Resources
                </h3>
                <div className="grid gap-3">
                  {docs.map((res, rIdx) => (
                    <a
                      key={rIdx}
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-4 p-4 rounded-xl border border-border hover:border-blue-500 hover:bg-blue-500/5 transition-all group"
                    >
                      <div className="p-2.5 bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-lg">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] uppercase font-semibold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                          {res.skillName}
                        </span>
                        <h4 className="font-semibold text-sm mt-1 truncate group-hover:text-blue-600 transition-colors">
                          {res.title}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {res.provider} • {res.duration}
                        </p>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-blue-600 transition-colors flex-shrink-0 mt-1" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {videos.length === 0 && docs.length === 0 && (
              <div className="text-center py-12 border border-dashed rounded-xl p-6">
                <HelpCircle className="h-10 w-10 mx-auto text-muted-foreground opacity-50 mb-3" />
                <h4 className="font-semibold text-base">No Resources Found</h4>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto mt-1">
                  No learning resources match your current selection mode ({learningMode}).
                </p>
                <Button
                  onClick={() => setCurrentView('learning-pref')}
                  className="mt-4 gap-2 bg-gradient-to-r from-primary to-emerald-500 text-white hover:from-primary/80 hover:to-emerald-500/80 animate-pulse shadow-lg ring-4 ring-primary/50 hover:ring-primary/70"
                >
                  Change Preference
                </Button>
              </div>
            )}
          </div>

          <div className="pt-6 border-t flex justify-end">
            <Button
              onClick={async () => {
                try {
                  setLocalLoading(true);
                  await completeModule(selectedModuleIndex);
                  const questions = await fetchModuleQuiz(selectedModuleIndex);
                  setQuizQuestions(questions);
                  setQuizAnswers({});
                  setQuizResult(null);
                  setCurrentView('quiz-screen');
                } catch (err) {
                  toast.error("Failed to proceed to quiz.");
                } finally {
                  setLocalLoading(false);
                }
              }}
              className="gap-2 bg-gradient-to-r from-primary to-accent text-white font-semibold py-6 px-8 rounded-xl"
              disabled={localLoading}
            >
              {localLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Award className="h-5 w-5" />}
              Complete Learning & Start Quiz
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  if (currentView === 'quiz-screen' && selectedModuleIndex !== null) {
    const module = roadmapModules[selectedModuleIndex];
    if (!module) return null;

    const allAnswered = quizQuestions.length > 0 && quizQuestions.every(q => quizAnswers[q.id] !== undefined);

    const handleSubmitQuiz = async () => {
      try {
        setLocalLoading(true);
        const result = await submitModuleQuiz(selectedModuleIndex, quizAnswers);
        setQuizResult(result);
        if (result.passed) {
          toast.success("Congratulations! You passed the quiz!");
        } else {
          toast.error("Quiz failed. Please review the material and try again.");
        }
      } catch (err) {
        toast.error("Failed to submit quiz.");
      } finally {
        setLocalLoading(false);
      }
    };

    const handleRetryQuiz = async () => {
      try {
        setLocalLoading(true);
        const questions = await fetchModuleQuiz(selectedModuleIndex);
        setQuizQuestions(questions);
        setQuizAnswers({});
        setQuizResult(null);
      } catch (err) {
        toast.error("Failed to reload quiz.");
      } finally {
        setLocalLoading(false);
      }
    };

    return (
      <Layout>
        <div className="max-w-2xl mx-auto space-y-6 py-6 px-4">
          <div className="flex items-center justify-between border-b pb-4">
            <Button
              variant="ghost"
              onClick={() => {
                if (quizResult) {
                  setCurrentView('roadmap-list');
                } else {
                  setCurrentView('learning-screen');
                }
              }}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
            <span className="text-xs font-semibold text-muted-foreground uppercase bg-muted px-2 py-0.5 rounded">
              Module {selectedModuleIndex + 1} Quiz
            </span>
          </div>

          <div className="text-center space-y-2">
            <h2 className="text-xl md:text-2xl font-bold">{module.title} Verification</h2>
            <p className="text-xs md:text-sm text-muted-foreground max-w-md mx-auto">
              Answer all 5 questions correctly to verify your learning and unlock the next module. You need at least 4/5 (70%+) to pass.
            </p>
          </div>

          {quizResult ? (
            <Card className={cn(
              "border-2",
              quizResult.passed ? "border-green-500 bg-green-50/10" : "border-red-500 bg-red-50/10"
            )}>
              <CardHeader className="text-center p-6 space-y-4">
                <div className={cn(
                  "mx-auto h-16 w-16 rounded-full flex items-center justify-center border-4",
                  quizResult.passed ? "border-green-500 text-green-500" : "border-red-500 text-red-500"
                )}>
                  {quizResult.passed ? (
                    <Trophy className="h-8 w-8" />
                  ) : (
                    <AlertCircle className="h-8 w-8" />
                  )}
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-2xl font-bold">
                    {quizResult.passed ? "🎉 Module Quiz Passed!" : "❌ Try Again!"}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {quizResult.passed
                      ? "Excellent work! You have successfully verified your skills for this module."
                      : "You didn't meet the passing score of 4/5. Review the resources and try again."}
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="p-6 pt-0 space-y-6">
                <div className="flex justify-around border-y py-4 text-center">
                  <div>
                    <span className="text-xs text-muted-foreground block uppercase font-medium">Your Score</span>
                    <span className={cn(
                      "text-3xl font-black",
                      quizResult.passed ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                    )}>
                      {quizResult.score}/5
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block uppercase font-medium">Attempts</span>
                    <span className="text-3xl font-black text-foreground">
                      {quizResult.quizAttempts}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                  {quizResult.passed ? (
                    <Button
                      onClick={() => {
                        setCurrentView('roadmap-list');
                        setSelectedModuleIndex(null);
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto font-semibold"
                    >
                      Return to Roadmap
                    </Button>
                  ) : (
                    <>
                      <Button
                        onClick={handleRetryQuiz}
                        className="bg-primary hover:bg-primary/90 text-white w-full sm:w-auto font-semibold"
                        disabled={localLoading}
                      >
                        {localLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Retry Quiz"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setCurrentView('learning-screen')}
                        className="w-full sm:w-auto font-semibold"
                      >
                        Review Learning Material
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {quizQuestions.map((q, qIdx) => (
                <Card key={q.id} className="border border-border">
                  <CardHeader className="p-5 pb-3">
                    <CardTitle className="text-base font-bold flex gap-2">
                      <span className="text-primary font-mono">{qIdx + 1}.</span>
                      <span>{q.question}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-5 pt-0">
                    <div className="grid gap-2">
                      {q.options.map((option: string, oIdx: number) => {
                        const isSelected = quizAnswers[q.id] === oIdx;
                        return (
                          <button
                            key={oIdx}
                            onClick={() => {
                              setQuizAnswers(prev => ({
                                ...prev,
                                [q.id]: oIdx
                              }));
                            }}
                            className={cn(
                              "w-full text-left p-3.5 rounded-lg border text-sm transition-all flex items-center justify-between font-medium",
                              isSelected
                                ? "border-primary bg-primary/10 text-primary font-semibold ring-1 ring-primary"
                                : "border-border hover:border-muted-foreground/30 hover:bg-muted/50"
                            )}
                          >
                            <span>{option}</span>
                            {isSelected && <CheckCircle2 className="h-4 w-4 text-primary" />}
                          </button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}

              <div className="pt-4 flex justify-end">
                <Button
                  onClick={handleSubmitQuiz}
                  className="bg-primary hover:bg-primary/95 text-white py-6 px-8 rounded-xl font-bold text-base w-full sm:w-auto gap-2"
                  disabled={!allAnswered || localLoading}
                >
                  {localLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Submit Quiz Responses"}
                </Button>
              </div>
            </div>
          )}
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
        <div className="text-center space-y-2 px-4 relative">
          <h1 className="text-2xl md:text-3xl font-bold">Your Path to {selectedRole.title}</h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto">
            Follow this guided journey to master essential skills for your target role.
          </p>
          {learningMode && (
            <div className="pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentView('learning-pref')}
                className="gap-2 bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto"
              >
                Preference: <span className="capitalize font-semibold">{learningMode}</span> (Change)
              </Button>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-sm">Skills Mastered</span>
                <span className="text-xs text-muted-foreground">
                  {completedCount} of {roadmap.length} skills
                </span>
              </div>
              <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500 ease-out rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {roadmapModules.length > 0 && (
              <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                <div>
                  <span className="text-xs text-muted-foreground block font-medium uppercase tracking-wider">Modules Completed</span>
                  <span className="text-lg font-bold text-foreground">
                    {roadmapModules.filter((m: any) => m.completed).length} of {roadmapModules.length} ({Math.round(roadmapProgress?.moduleProgress || 0)}%)
                  </span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block font-medium uppercase tracking-wider">Quizzes Passed</span>
                  <span className="text-lg font-bold text-foreground">
                    {roadmapModules.filter((m: any) => m.quizPassed).length} of {roadmapModules.length} ({Math.round(roadmapProgress?.quizProgress || 0)}%)
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Completion Message */}
        <CompletionMessage isCompleted={allQuizzesPassed} />

        {/* Success Message */}
        {allQuizzesPassed && (
          <Alert className="border-green-200 bg-green-50 dark:bg-green-950 p-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="h-16 w-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0">
                <Trophy className="h-8 w-8 text-green-600" />
              </div>
              <div className="flex-1 text-center md:text-left space-y-2">
                <AlertDescription className="text-green-800 dark:text-green-200 text-base md:text-lg font-semibold">
                  🎉 Congratulations! You've completed your roadmap for {selectedRole.title}.
                </AlertDescription>
                <p className="text-xs md:text-sm text-green-700 dark:text-green-300">
                  Your dedication has paid off. You have mastered all the required skills, passed all verification quizzes, and are now officially ready for this role!
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start pt-2">
                  {assessmentStatus.passed ? (
                    <Button
                      onClick={handleClaimCertificate}
                      className="gap-2 bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto"
                      disabled={isIssuing}
                    >
                      {isIssuing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Award className="h-4 w-4" />}
                      Claim Your Certificate
                    </Button>
                  ) : (
                    <Button
                      onClick={() => navigate(`/assessment/${selectedRole.id}`)}
                      className="gap-2 bg-primary hover:bg-primary/90 text-white w-full sm:w-auto"
                    >
                      <Shield className="h-4 w-4" />
                      Take Final Assessment
                    </Button>
                  )}
                  <Button variant="outline" className="border-green-300 text-green-700 hover:bg-green-100 w-full sm:w-auto" asChild>
                    <Link to="/analysis">View Final Analysis</Link>
                  </Button>
                </div>
              </div>
            </div>
          </Alert>
        )}

        {/* Smart Progress Tracking Info */}
        {roadmapModules.length > 0 && (
          <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800 dark:text-blue-200">
              <strong>Smart Progress Tracking:</strong> Complete learning modules and pass quizzes to unlock subsequent modules. Your readiness score is updated dynamically in your <Link to="/analysis" className="underline font-medium">Analysis page</Link>!
            </AlertDescription>
          </Alert>
        )}

        {/* Modules Timeline */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Roadmap Modules
          </h2>
          <div className="grid gap-4">
            {roadmapModules.map((module, idx) => {
              const isUnlocked = module.unlocked;
              const isCompleted = module.completed;
              const isQuizPassed = module.quizPassed;

              return (
                <Card
                  key={idx}
                  className={cn(
                    "transition-all duration-300 border",
                    isUnlocked ? "hover:border-primary shadow-sm cursor-pointer" : "opacity-60 bg-muted/30 pointer-events-none select-none",
                    isQuizPassed && "border-green-200 dark:border-green-800 bg-green-50/20 dark:bg-green-950/5"
                  )}
                  onClick={() => {
                    if (isUnlocked) {
                      setSelectedModuleIndex(idx);
                      setCurrentView('learning-screen');
                    }
                  }}
                >
                  <CardHeader className="p-5 flex flex-row items-start justify-between gap-4">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Module {idx + 1}
                        </span>
                        {isQuizPassed ? (
                          <span className="flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-950/50 px-2 py-0.5 rounded-full">
                            <Trophy className="h-3 w-3" />
                            Passed
                          </span>
                        ) : isCompleted ? (
                          <span className="flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-950/50 px-2 py-0.5 rounded-full font-semibold">
                            Quiz Ready
                          </span>
                        ) : isUnlocked ? (
                          <span className="flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full font-semibold">
                            Active
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                            Locked
                          </span>
                        )}
                      </div>
                      <CardTitle className="text-lg font-bold pt-1">
                        {module.title}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {module.description}
                      </CardDescription>

                      {/* Skills covered */}
                      {module.skills && module.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-2.5">
                          {module.skills.map((skill: any, sIdx: number) => (
                            <span
                              key={sIdx}
                              className={cn(
                                "text-xs px-2.5 py-0.5 rounded-md border font-semibold",
                                skill.completed
                                  ? "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20"
                                  : "bg-muted text-muted-foreground border-border"
                              )}
                            >
                              {skill.skillName}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex-shrink-0 pt-1">
                      {isQuizPassed ? (
                        <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 flex items-center justify-center border border-green-200">
                          <CheckCircle2 className="h-5 w-5" />
                        </div>
                      ) : isUnlocked ? (
                        <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center border border-primary/20 hover:scale-105 transition-transform">
                          <BookOpen className="h-5 w-5" />
                        </div>
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-muted text-muted-foreground flex items-center justify-center border border-border">
                          <Lock className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
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

      {/* Certificate Success Modal */}
      <Dialog open={isCertModalOpen} onOpenChange={setIsCertModalOpen}>
        <DialogContent className="max-w-3xl sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <DialogHeader>
                <DialogTitle className="text-2xl text-center flex items-center justify-center gap-2">
                  <Sparkles className="h-6 w-6 text-yellow-500" />
                  Professional Certificate Earned!
                </DialogTitle>
                <DialogDescription className="text-center text-lg">
                  You've officially completed the {selectedRole.title} Learning Path.
                </DialogDescription>
              </DialogHeader>
            </div>
            <div className="flex-1 flex items-center justify-center">
              {issuedCertificate && (
                <Certificate
                  userName={issuedCertificate.userName}
                  roleName={issuedCertificate.roleName}
                  completionDate={issuedCertificate.completionDate}
                  certificateId={issuedCertificate.certificateId}
                />
              )}
            </div>
          </div>
          <div className="flex justify-center pb-4 mt-4">
            <Button variant="ghost" onClick={() => setIsCertModalOpen(false)}>
              Close Preview
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};
