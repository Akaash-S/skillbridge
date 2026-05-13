import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Shield, 
  Timer, 
  AlertTriangle, 
  ChevronRight, 
  CheckCircle2, 
  XCircle,
  Maximize,
  Camera,
  Loader2,
  Lock,
  ArrowLeft,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { useProctoring } from "@/hooks/useProctoring";
import { WebcamProctor } from "@/components/assessment/WebcamProctor";
import { apiClient } from "@/services/apiClient";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/context/AuthContext";
import { Certificate } from "@/components/Certificate";

interface Question {
  id: string;
  text: string;
  options: string[];
}

export const ProctoredAssessment = () => {
  const { roleId } = useParams<{ roleId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [step, setStep] = useState<"intro" | "prep" | "test" | "result">("intro");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [result, setResult] = useState<{ score: number; passed: boolean; violations: number } | null>(null);

  const onTerminate = useCallback(() => {
    toast.error("Assessment terminated due to multiple security violations.");
    setStep("result");
    // We don't call handleSubmit here to avoid race conditions with violation logging
    // The backend will terminate the session automatically on the 3rd violation log
  }, []);

  const proctoring = useProctoring(3, onTerminate);

  // Fetch questions and start session
  const startTest = async () => {
    if (!document.fullscreenElement) {
      toast.error("Please enable fullscreen mode to start the assessment.");
      return;
    }

    setLoading(true);
    try {
      // Start session
      const sessionRes = await apiClient.post<any>("/assessment/start", { roleId });
      setSessionId(sessionRes.sessionId);

      // Fetch questions (Hybrid: Backend will fetch from QuizAPI if not cached)
      const questionsRes = await apiClient.get<Question[]>(`/assessment/questions/${roleId}`);
      setQuestions(questionsRes);
      
      setStep("test");
      proctoring.startProctoring();
    } catch (error) {
      console.error("Failed to start assessment:", error);
      toast.error("Failed to initialize assessment session. Please check your internet connection.");
      // If session started but questions failed, we might need to cleanup
    } finally {
      setLoading(false);
    }
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {
        toast.error("Fullscreen request denied. Please check your browser settings.");
      });
    }
  };

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = async () => {
    if (!sessionId) return;
    
    setLoading(true);
    proctoring.stopProctoring();
    
    // Attempt to exit fullscreen gracefully
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch (e) {
      console.warn("Fullscreen exit failed", e);
    }

    try {
      const res = await apiClient.post<any>("/assessment/submit", {
        sessionId,
        answers
      });
      setResult({
        score: res.score,
        passed: res.passed,
        violations: proctoring.violations
      });
      setStep("result");
    } catch (error) {
      console.error("Failed to submit assessment:", error);
      toast.error("Error submitting your answers. Your progress might be lost.");
    } finally {
      setLoading(false);
    }
  };

  // Timer logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === "test" && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && step === "test") {
      handleSubmit();
    }
    return () => clearInterval(timer);
  }, [step, timeLeft]);

  // Log violations to backend
  useEffect(() => {
    if (proctoring.isStarted && proctoring.lastViolationType && sessionId) {
      apiClient.post("/assessment/violation", {
        sessionId,
        type: proctoring.lastViolationType,
        details: `Violation detected on frontend: ${proctoring.lastViolationType}`
      }).catch(err => {
        console.error("Failed to log violation to backend", err);
      });
    }
  }, [proctoring.violations, proctoring.lastViolationType, sessionId, proctoring.isStarted]);

  // Special handling for termination
  useEffect(() => {
    if (step === "test" && proctoring.violations >= 3) {
      handleSubmit();
    }
  }, [proctoring.violations, step]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Toggle body styles for security
  useEffect(() => {
    if (proctoring.isStarted) {
      document.body.classList.add("select-none");
      document.body.style.overflow = "hidden";
    } else {
      document.body.classList.remove("select-none");
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.classList.remove("select-none");
      document.body.style.overflow = "auto";
    };
  }, [proctoring.isStarted]);

  if (step === "intro") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full shadow-lg">
          <CardHeader className="text-center space-y-4 pb-2">
            <div className="h-14 w-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto">
              <Shield className="h-7 w-7 text-primary" />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-2xl font-bold">Secure Assessment</CardTitle>
              <CardDescription>
                Validate your expertise for the {roleId?.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())} certification.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-lg bg-muted/50 border">
                <Timer className="h-5 w-5 text-primary mb-2" />
                <h3 className="font-semibold text-sm">10 Minutes</h3>
                <p className="text-xs text-muted-foreground">Strict time limit per attempt</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 border">
                <AlertTriangle className="h-5 w-5 text-yellow-500 mb-2" />
                <h3 className="font-semibold text-sm">3 Violations Max</h3>
                <p className="text-xs text-muted-foreground">Automatic termination threshold</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg flex gap-3">
                <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-amber-600 dark:text-amber-400">Hybrid Question System</p>
                  <p className="text-muted-foreground text-xs">Questions are sourced dynamically from QuizAPI and verified by our SkillBridge Engine.</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Security Protocol</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                    Fullscreen mode is mandatory and strictly enforced.
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                    Real-time webcam monitoring for candidate verification.
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                    Automatic termination on tab switching or restricted shortcuts.
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <Button onClick={() => setStep("prep")} className="w-full h-11">
                Begin Verification
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="ghost" onClick={() => navigate(-1)} className="w-full h-10 text-muted-foreground">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Return to Roadmap
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === "prep") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-xl w-full shadow-lg overflow-hidden">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl font-bold">Hardware & Security Check</CardTitle>
            <CardDescription>Verify your environment requirements before starting.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-6 md:p-8 text-center">
            <div className="relative group mx-auto mb-8">
              <WebcamProctor 
                onPermissionGranted={() => setCameraReady(true)}
                onPermissionDenied={() => setCameraReady(false)}
              />
            </div>

            <div className="space-y-3">
              <div className={cn(
                "p-4 rounded-xl border flex items-center justify-between transition-all duration-300",
                cameraReady ? "bg-green-500/5 border-green-500/20" : "bg-muted/30 border-muted"
              )}>
                <div className="flex items-center gap-3 text-left">
                  <Camera className={cn("h-5 w-5", cameraReady ? "text-green-500" : "text-muted-foreground")} />
                  <div>
                    <p className="font-semibold text-sm">Webcam Verification</p>
                    <p className="text-xs text-muted-foreground">{cameraReady ? "Active and monitoring" : "Grant access to proceed"}</p>
                  </div>
                </div>
                {cameraReady ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />}
              </div>

              <div className={cn(
                "p-4 rounded-xl border flex items-center justify-between transition-all duration-300",
                proctoring.isFullscreen ? "bg-green-500/5 border-green-500/20" : "bg-muted/30 border-muted"
              )}>
                <div className="flex items-center gap-3 text-left">
                  <Maximize className={cn("h-5 w-5", proctoring.isFullscreen ? "text-green-500" : "text-muted-foreground")} />
                  <div>
                    <p className="font-semibold text-sm">Secure Fullscreen</p>
                    <p className="text-xs text-muted-foreground">{proctoring.isFullscreen ? "Environment Locked" : "Mandatory requirement"}</p>
                  </div>
                </div>
                {proctoring.isFullscreen ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <Button size="sm" onClick={handleFullscreen} className="text-xs h-8">
                    Enable Fullscreen
                  </Button>
                )}
              </div>
            </div>

            <div className="pt-4 space-y-4">
              {proctoring.isFullscreen ? (
                <Button 
                  onClick={startTest} 
                  disabled={!cameraReady || loading}
                  className="w-full h-12 text-lg font-bold"
                >
                  {loading ? <RefreshCw className="h-5 w-5 animate-spin mr-2" /> : "Start Assessment"}
                </Button>
              ) : (
                <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-sm font-semibold flex items-center justify-center gap-2">
                  <Lock className="h-4 w-4" />
                  Enable Fullscreen to Unlock Session
                </div>
              )}
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                By starting, you agree to our proctoring terms and verification logic.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === "test") {
    const currentQuestion = questions[currentQuestionIndex];
    const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

    return (
      <div className="min-h-screen bg-background flex flex-col font-sans select-none overflow-hidden">
        {/* Professional Header */}
        <header className="h-16 border-b bg-card/50 backdrop-blur-md flex items-center justify-between px-6 md:px-8 sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-primary uppercase tracking-wider">SkillBridge Assessment</span>
              <span className="text-sm font-bold truncate max-w-[150px] md:max-w-none">
                {roleId?.replace('-', ' ').toUpperCase()}
              </span>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-muted border">
              <Timer className={cn("h-4 w-4", timeLeft < 60 ? "text-destructive animate-pulse" : "text-primary")} />
              <span className={cn("font-mono font-bold text-base", timeLeft < 60 ? "text-destructive" : "text-foreground")}>
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
             <div className={cn(
               "hidden sm:flex items-center gap-3 px-4 py-1.5 rounded-full border bg-muted/50",
               proctoring.violations > 0 && "border-destructive/30 bg-destructive/5"
             )}>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Security</span>
              <div className={cn(
                "h-2 w-2 rounded-full",
                proctoring.violations === 0 ? "bg-green-500" : 
                proctoring.violations === 1 ? "bg-amber-500" : "bg-destructive"
              )} />
              <span className={cn("text-[10px] font-bold uppercase", proctoring.violations > 0 ? "text-destructive" : "text-green-600")}>
                {proctoring.violations}/3
              </span>
            </div>
            
            <div className="hidden md:block">
              <WebcamProctor onPermissionGranted={() => {}} onPermissionDenied={() => {}} />
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-4xl w-full mx-auto p-6 md:p-8 space-y-8 overflow-y-auto pb-40">
          {/* Progress Architecture */}
          <div className="space-y-4">
            <div className="flex items-end justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Question {currentQuestionIndex + 1} of {questions.length}</p>
                <h2 className="text-xl font-bold tracking-tight">Core Competency Evaluation</h2>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-primary">{Math.round(progress)}%</span>
              </div>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>

          {/* Question Display */}
          {questions.length > 0 ? (
            <div className="space-y-8">
              <div className="space-y-6">
                <h1 className="text-xl md:text-2xl font-semibold leading-relaxed text-foreground">
                  {currentQuestion?.text}
                </h1>
                
                <div className="grid gap-3">
                  {currentQuestion?.options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAnswer(currentQuestion.id, option)}
                      className={cn(
                        "group w-full p-4 text-left rounded-xl border transition-all duration-200 flex items-center gap-4 relative",
                        answers[currentQuestion.id] === option
                          ? "bg-primary/5 border-primary ring-1 ring-primary/20 shadow-sm"
                          : "bg-card border-border hover:border-primary/50 hover:bg-muted/50"
                      )}
                    >
                      <div className={cn(
                        "h-7 w-7 rounded-lg border flex items-center justify-center shrink-0 font-bold text-xs transition-all",
                        answers[currentQuestion.id] === option ? "border-primary bg-primary text-primary-foreground" : "border-muted text-muted-foreground"
                      )}>
                        {String.fromCharCode(65 + idx)}
                      </div>
                      <span className={cn(
                        "text-base font-medium",
                        answers[currentQuestion.id] === option ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                      )}>
                        {option}
                      </span>
                    </button>
                  ))}
                </div>
              </div>


            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 space-y-6">
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
              <p className="text-slate-500 font-bold uppercase tracking-widest">Sourcing questions from SkillBridge Engine...</p>
            </div>
          )}
        </main>

        {/* Fixed Bottom Navigation Bar */}
        {questions.length > 0 && (
          <footer className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-t shadow-lg">
            {/* Question Dot Navigator */}
            <div className="max-w-4xl mx-auto px-6 pt-3 pb-2">
              <div className="flex items-center justify-center gap-1.5 flex-wrap">
                {questions.map((q, idx) => (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={cn(
                      "h-2 w-2 rounded-full transition-all duration-200",
                      idx === currentQuestionIndex
                        ? "bg-primary w-4"
                        : answers[q.id]
                          ? "bg-primary/40"
                          : "bg-muted hover:bg-muted-foreground/30"
                    )}
                  />
                ))}
              </div>
              <p className="text-center text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                {Object.keys(answers).length} / {questions.length} Completed
              </p>
            </div>

            {/* Navigation Buttons */}
            <div className="max-w-4xl mx-auto px-6 pb-4 flex items-center justify-between gap-4">
              <Button
                variant="outline"
                disabled={currentQuestionIndex === 0}
                onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                className="h-10 px-6 rounded-lg text-xs font-bold"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>

              {currentQuestionIndex < questions.length - 1 ? (
                <Button
                  disabled={!answers[currentQuestion?.id]}
                  onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                  className="h-10 px-8 rounded-lg text-xs font-bold"
                >
                  Next Question
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={loading || Object.keys(answers).length < questions.length}
                  className="h-10 px-8 rounded-lg text-xs font-bold"
                >
                  {loading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : "Finish Assessment"}
                </Button>
              )}
            </div>
          </footer>
        )}

        {/* Security Warning Overlay */}
        {(!proctoring.isFullscreen || !proctoring.isFocused || !proctoring.isVisible) && (
          <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-md flex items-center justify-center p-8 text-center animate-in fade-in duration-300">
            <div className="max-w-md space-y-8">
              <div className="relative mx-auto w-24 h-24">
                <div className="absolute inset-0 bg-destructive/20 rounded-full animate-ping" />
                <div className="relative h-24 w-24 bg-destructive/10 rounded-full flex items-center justify-center border-2 border-destructive/30">
                  <Lock className="h-10 w-10 text-destructive" />
                </div>
              </div>
              
              <div className="space-y-3">
                <h2 className="text-4xl font-bold text-destructive tracking-tight">Security Alert</h2>
                <div className="space-y-2">
                  <p className="text-xl font-semibold">
                    {!proctoring.isFullscreen ? "Fullscreen Exit Detected" : 
                     !proctoring.isVisible ? "Tab Switch Detected" : "Window Focus Lost"}
                  </p>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {!proctoring.isFullscreen 
                      ? "The secure environment has been closed. You must return to fullscreen immediately to continue."
                      : "Interaction outside this window is strictly prohibited. Your session is suspended and a violation recorded."}
                  </p>
                </div>
              </div>

              {!proctoring.isFullscreen && (
                <Button 
                  onClick={handleFullscreen} 
                  variant="destructive"
                  className="w-full h-12 text-base font-bold shadow-lg"
                >
                  <Maximize className="mr-2 h-5 w-5" />
                  Restore Secure Mode
                </Button>
              )}

              <div className="p-6 rounded-2xl bg-destructive/5 border border-destructive/20">
                <p className="text-destructive font-bold text-sm uppercase tracking-widest mb-3">
                  Violations: {proctoring.violations} / 3
                </p>
                <Progress value={(proctoring.violations / 3) * 100} className="h-2 bg-destructive/10" />
                <p className="text-destructive/60 text-[10px] mt-3 font-bold tracking-wider">
                  Automatic termination at 3 violations.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (step === "result") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-xl w-full shadow-lg overflow-hidden relative">
          <div className={cn(
            "absolute top-0 left-0 w-full h-1.5",
            result?.passed ? "bg-green-500" : "bg-destructive"
          )} />
          <CardHeader className="text-center space-y-4 pt-10">
            <div className={cn(
              "h-20 w-20 rounded-2xl flex items-center justify-center mx-auto border-2 transition-transform duration-500",
              result?.passed ? "bg-green-500/10 border-green-500/20 text-green-600" : "bg-destructive/10 border-destructive/20 text-destructive"
            )}>
              {result?.passed ? <CheckCircle2 className="h-10 w-10" /> : <XCircle className="h-10 w-10" />}
            </div>
            <div className="space-y-1">
              <CardTitle className="text-3xl font-bold tracking-tight">
                {result?.passed ? "Expertise Validated" : "Validation Failed"}
              </CardTitle>
              <CardDescription className="text-base font-medium">
                {result?.passed 
                  ? `You have successfully earned your ${roleId?.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())} certification.` 
                  : "Your performance did not meet the certification threshold."}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-8 p-6 md:p-10">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 rounded-xl bg-muted/50 border text-center">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Final Score</p>
                <p className="text-3xl font-bold">{result?.score}%</p>
              </div>
              <div className="p-6 rounded-xl bg-muted/50 border text-center">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Integrity Status</p>
                <p className={cn("text-3xl font-bold", (result?.violations ?? 0) > 0 ? "text-destructive" : "text-green-600")}>
                  {result?.violations === 0 ? "Clean" : `${result?.violations} Violations`}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {result?.passed ? (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                  <div className="space-y-4">
                    <Alert className="bg-green-500/5 border-green-500/20">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-sm font-medium text-green-700 dark:text-green-400">
                        Your professional expertise has been validated. You can now download and share your official SkillBridge certification.
                      </AlertDescription>
                    </Alert>
                  </div>

                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-green-500/20 to-primary/20 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
                    <div className="relative overflow-hidden rounded-xl border border-border shadow-2xl bg-card">
                      <Certificate 
                        userName={user?.name || "SkillBridge Professional"}
                        roleName={roleId?.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase()) || "Professional"}
                        completionDate={new Date()}
                        className="p-4"
                      />
                    </div>
                  </div>

                  <Button onClick={() => navigate("/roadmap")} className="w-full h-14 text-lg font-bold shadow-xl shadow-primary/20 transition-all hover:scale-[1.01] active:scale-[0.99]">
                    Continue to Dashboard
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Alert variant="destructive" className="bg-destructive/5 border-destructive/20">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm font-medium">
                      {(result?.violations ?? 0) >= 3 
                        ? "Security protocol breach detected. Session was automatically terminated."
                        : "Required passing score is 70%. We suggest reviewing your roadmap before retaking."}
                    </AlertDescription>
                  </Alert>
                  <Button variant="outline" onClick={() => navigate("/roadmap")} className="w-full h-12 text-base font-bold">
                    Return to Roadmap
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};
