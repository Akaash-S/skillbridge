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

interface Question {
  id: string;
  text: string;
  options: string[];
}

export const ProctoredAssessment = () => {
  const { roleId } = useParams<{ roleId: string }>();
  const navigate = useNavigate();
  
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
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full bg-slate-900 border-slate-800 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent" />
          <CardHeader className="text-center space-y-4">
            <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto border border-primary/20">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-3xl font-bold">Secure Assessment</CardTitle>
              <CardDescription className="text-slate-400">
                Validate your expertise for the {roleId?.replace('-', ' ').toUpperCase()} certification.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                <Timer className="h-5 w-5 text-primary mb-2" />
                <h3 className="font-semibold">10 Minutes</h3>
                <p className="text-xs text-slate-400">Strict time limit per attempt</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                <AlertTriangle className="h-5 w-5 text-yellow-500 mb-2" />
                <h3 className="font-semibold">3 Violations</h3>
                <p className="text-xs text-slate-400">Automatic termination threshold</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-lg flex gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-bold text-yellow-500">Hybrid Question System</p>
                  <p className="text-slate-400">Questions are sourced dynamically from QuizAPI and verified by our SkillBridge Engine.</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Security Protocol</h4>
                <ul className="space-y-3 text-sm text-slate-300">
                  <li className="flex items-start gap-3">
                    <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    </div>
                    <span>Fullscreen mode is mandatory and strictly enforced.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    </div>
                    <span>Real-time webcam monitoring for candidate verification.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    </div>
                    <span>Automatic termination on tab switching or restricted shortcuts.</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-4 space-y-3">
              <Button onClick={() => setStep("prep")} className="w-full py-7 text-lg font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
                Begin Verification Flow
              </Button>
              <Button variant="ghost" onClick={() => navigate(-1)} className="w-full text-slate-500 hover:text-white">
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
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <Card className="max-w-xl w-full bg-slate-900 border-slate-800 text-white shadow-2xl overflow-hidden">
          <div className="p-1 bg-gradient-to-r from-primary via-accent to-primary animate-gradient-x" />
          <CardHeader className="text-center">
            <CardTitle>Hardware & Security Check</CardTitle>
            <CardDescription>We need to verify your environment before starting.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 p-8 text-center">
            <div className="relative group mx-auto">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
              <WebcamProctor 
                onPermissionGranted={() => setCameraReady(true)}
                onPermissionDenied={() => setCameraReady(false)}
              />
            </div>

            <div className="space-y-4">
              <div className={cn(
                "p-4 rounded-xl border-2 flex items-center justify-between transition-all duration-300",
                cameraReady ? "bg-green-500/5 border-green-500/20" : "bg-red-500/5 border-red-500/20"
              )}>
                <div className="flex items-center gap-3 text-left">
                  <Camera className={cn("h-5 w-5", cameraReady ? "text-green-500" : "text-red-500")} />
                  <div>
                    <p className="font-bold text-sm">Webcam Verification</p>
                    <p className="text-xs text-slate-500">{cameraReady ? "Active and monitoring" : "Grant access to proceed"}</p>
                  </div>
                </div>
                {cameraReady ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <Loader2 className="h-5 w-5 text-red-500 animate-spin" />}
              </div>

              <div className={cn(
                "p-4 rounded-xl border-2 flex items-center justify-between transition-all duration-300",
                proctoring.isFullscreen ? "bg-green-500/5 border-green-500/20" : "bg-slate-800/50 border-slate-700"
              )}>
                <div className="flex items-center gap-3 text-left">
                  <Maximize className={cn("h-5 w-5", proctoring.isFullscreen ? "text-green-500" : "text-slate-500")} />
                  <div>
                    <p className="font-bold text-sm">Secure Fullscreen</p>
                    <p className="text-xs text-slate-500">{proctoring.isFullscreen ? "Environment Locked" : "Mandatory requirement"}</p>
                  </div>
                </div>
                {proctoring.isFullscreen ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <Button size="sm" onClick={handleFullscreen} className="bg-primary hover:bg-primary/90 text-xs h-8">
                    Enable Fullscreen
                  </Button>
                )}
              </div>
            </div>

            <div className="pt-4">
              {proctoring.isFullscreen ? (
                <Button 
                  onClick={startTest} 
                  disabled={!cameraReady || loading}
                  className="w-full py-8 text-xl font-black uppercase tracking-widest shadow-2xl shadow-primary/30"
                >
                  {loading ? <RefreshCw className="h-6 w-6 animate-spin" /> : "Initiate Assessment Session"}
                </Button>
              ) : (
                <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-sm font-bold flex items-center justify-center gap-2">
                  <Lock className="h-4 w-4" />
                  ENABLE FULLSCREEN TO UNLOCK SESSION
                </div>
              )}
              <p className="text-[10px] text-slate-500 mt-4 uppercase tracking-tighter">
                By clicking start, you agree to our strict proctoring terms and server-side verification logic.
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
      <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans select-none overflow-hidden">
        {/* Modern Assessment Header */}
        <header className="h-20 border-b border-white/5 bg-slate-900/50 backdrop-blur-3xl flex items-center justify-between px-8 sticky top-0 z-50">
          <div className="flex items-center gap-6">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">SkillBridge Engine</span>
              <span className="text-lg font-bold tracking-tight">Active Assessment</span>
            </div>
            <div className="h-10 w-px bg-white/5" />
            <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-800/50 border border-white/5">
              <Timer className={cn("h-5 w-5", timeLeft < 60 ? "text-red-500 animate-pulse" : "text-primary")} />
              <span className={cn("font-mono font-black text-xl", timeLeft < 60 ? "text-red-500" : "text-white")}>
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-8">
             <div className={cn(
               "flex items-center gap-4 px-6 py-2.5 rounded-full border transition-all duration-500 shadow-2xl",
               proctoring.violations === 0 ? "bg-slate-800/30 border-white/5" : 
               proctoring.violations === 1 ? "bg-yellow-500/10 border-yellow-500/30" : 
               "bg-red-500/10 border-red-500/30"
             )}>
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Security Status</span>
                <span className={cn("text-xs font-black uppercase", proctoring.violations > 0 ? "text-red-500" : "text-green-500")}>
                  Violations: {proctoring.violations} / 3
                </span>
              </div>
              <div className={cn(
                "h-2 w-2 rounded-full",
                proctoring.violations === 0 ? "bg-green-500" : 
                proctoring.violations === 1 ? "bg-yellow-500" : "bg-red-500"
              )} />
            </div>
            
            <div className="hidden lg:block grayscale hover:grayscale-0 transition-all duration-500 opacity-50 hover:opacity-100">
              <WebcamProctor onPermissionGranted={() => {}} onPermissionDenied={() => {}} />
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-5xl w-full mx-auto p-6 md:p-12 space-y-12 overflow-y-auto pb-48">
          {/* Progress Architecture */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-3xl font-black tracking-tighter italic">QUESTION {currentQuestionIndex + 1}</h2>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Section: {roleId?.replace('-', ' ')} Core Competency</p>
              </div>
              <div className="text-right">
                <span className="text-4xl font-black text-primary/50">{Math.round(progress)}%</span>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Overall Progress</p>
              </div>
            </div>
            <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-1000 ease-out" 
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Question Display */}
          {questions.length > 0 ? (
            <div className="space-y-12">
              <div className="space-y-8">
                <h1 className="text-2xl md:text-4xl font-medium leading-[1.4] text-slate-100">
                  {currentQuestion?.text}
                </h1>
                
                <div className="grid gap-4">
                  {currentQuestion?.options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAnswer(currentQuestion.id, option)}
                      className={cn(
                        "group w-full p-6 text-left rounded-3xl border-2 transition-all duration-300 flex items-center gap-6 relative overflow-hidden",
                        answers[currentQuestion.id] === option
                          ? "bg-primary/10 border-primary shadow-[0_0_40px_rgba(var(--primary),0.1)] scale-[1.01]"
                          : "bg-slate-900/50 border-white/5 hover:border-white/20 hover:bg-slate-800/50"
                      )}
                    >
                      <div className={cn(
                        "h-8 w-8 rounded-xl border-2 flex items-center justify-center shrink-0 font-bold text-sm transition-all",
                        answers[currentQuestion.id] === option ? "border-primary bg-primary text-white" : "border-slate-700 text-slate-500"
                      )}>
                        {String.fromCharCode(65 + idx)}
                      </div>
                      <span className={cn(
                        "text-lg font-medium",
                        answers[currentQuestion.id] === option ? "text-white" : "text-slate-400"
                      )}>
                        {option}
                      </span>
                      {answers[currentQuestion.id] === option && (
                        <div className="absolute top-0 right-0 h-full w-1.5 bg-primary" />
                      )}
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

        {/* Fixed Bottom Navigation Bar - Always visible */}
        {questions.length > 0 && (
          <footer className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-2xl border-t border-white/5">
            {/* Question Dot Navigator */}
            <div className="max-w-5xl mx-auto px-6 pt-4 pb-2">
              <div className="flex items-center justify-center gap-2 flex-wrap">
                {questions.map((q, idx) => (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestionIndex(idx)}
                    title={`Question ${idx + 1}${answers[q.id] ? ' (Answered)' : ''}`}
                    className={cn(
                      "h-3 w-3 rounded-full transition-all duration-300 hover:scale-125",
                      idx === currentQuestionIndex
                        ? "bg-primary scale-125 ring-2 ring-primary/30"
                        : answers[q.id]
                          ? "bg-green-500"
                          : "bg-slate-700 hover:bg-slate-500"
                    )}
                  />
                ))}
              </div>
              <p className="text-center text-[10px] text-slate-500 mt-1">
                {Object.keys(answers).length} of {questions.length} answered
              </p>
            </div>

            {/* Navigation Buttons */}
            <div className="max-w-5xl mx-auto px-6 pb-5 flex items-center justify-between gap-4">
              <Button
                variant="ghost"
                disabled={currentQuestionIndex === 0}
                onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                className="h-14 px-8 rounded-2xl text-slate-500 hover:text-white transition-all"
              >
                <ArrowLeft className="mr-2 h-5 w-5" />
                Previous
              </Button>

              <div className="text-center">
                <span className="text-sm font-bold text-slate-400">
                  {currentQuestionIndex + 1} / {questions.length}
                </span>
              </div>

              {currentQuestionIndex < questions.length - 1 ? (
                <Button
                  disabled={!answers[currentQuestion?.id]}
                  onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                  className="h-14 px-10 rounded-2xl bg-primary hover:bg-primary/90 font-black uppercase tracking-widest group"
                >
                  Next
                  <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={loading || Object.keys(answers).length < questions.length}
                  className="h-14 px-12 rounded-2xl bg-green-600 hover:bg-green-700 font-black tracking-[0.15em] uppercase shadow-[0_10px_30px_rgba(22,163,74,0.3)] animate-pulse hover:animate-none"
                >
                  {loading ? <RefreshCw className="h-5 w-5 animate-spin" /> : "Submit"}
                </Button>
              )}
            </div>
          </footer>
        )}

        {/* Security Warning Overlay - Non-dismissible */}
        {(!proctoring.isFullscreen || !proctoring.isFocused || !proctoring.isVisible) && (
          <div className="fixed inset-0 z-[100] bg-slate-950/98 backdrop-blur-[120px] flex items-center justify-center p-8 text-center animate-in fade-in duration-500">
            <div className="max-w-xl space-y-12">
              <div className="relative mx-auto w-32 h-32">
                <div className="absolute inset-0 bg-red-600/30 rounded-full animate-ping" />
                <div className="relative h-32 w-32 bg-red-600/20 rounded-full flex items-center justify-center border-4 border-red-600/40 shadow-[0_0_50px_rgba(220,38,38,0.3)]">
                  <Lock className="h-16 w-16 text-red-600" />
                </div>
              </div>
              
              <div className="space-y-4">
                <h2 className="text-6xl font-black text-red-600 uppercase tracking-tighter italic">SECURITY BREACH</h2>
                <div className="space-y-3">
                  <p className="text-3xl font-bold text-white">
                    {!proctoring.isFullscreen ? "FULLSCREEN EXIT DETECTED" : 
                     !proctoring.isVisible ? "TAB SWITCH DETECTED" : "WINDOW FOCUS LOST"}
                  </p>
                  <p className="text-slate-400 text-lg leading-relaxed max-w-md mx-auto">
                    {!proctoring.isFullscreen 
                      ? "The secure environment has been closed. You must return to fullscreen immediately to continue the assessment."
                      : "Interaction outside this window is strictly prohibited. Your session is currently suspended and a violation has been recorded."}
                  </p>
                </div>
              </div>

              {!proctoring.isFullscreen && (
                <Button 
                  onClick={handleFullscreen} 
                  className="bg-red-600 hover:bg-red-700 w-full py-10 text-2xl font-black uppercase tracking-[0.2em] shadow-[0_20px_60px_rgba(220,38,38,0.4)] group"
                >
                  <Maximize className="mr-4 h-8 w-8 group-hover:scale-110 transition-transform" />
                  RESTORE SECURE MODE
                </Button>
              )}

              <div className="p-8 rounded-3xl bg-red-600/10 border-2 border-red-600/20 backdrop-blur-md">
                <p className="text-red-500 font-black text-2xl uppercase tracking-[0.3em] mb-2">
                  VIOLATION: {proctoring.violations} / 3
                </p>
                <div className="h-2 w-full bg-red-950 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-red-600 transition-all duration-500" 
                    style={{ width: `${(proctoring.violations / 3) * 100}%` }}
                  />
                </div>
                <p className="text-red-400/60 text-xs mt-4 uppercase font-bold tracking-widest">
                  Automatic termination will occur at 3 violations.
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
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full bg-slate-900 border-slate-800 text-white shadow-2xl relative overflow-hidden">
          <div className={cn(
            "absolute top-0 left-0 w-full h-1.5",
            result?.passed ? "bg-green-500" : "bg-red-500"
          )} />
          <CardHeader className="text-center space-y-6 pt-12">
            <div className={cn(
              "h-24 w-24 rounded-3xl flex items-center justify-center mx-auto border-4 rotate-3 transition-transform hover:rotate-0 duration-500",
              result?.passed ? "bg-green-500/10 border-green-500/50 text-green-500 shadow-[0_0_40px_rgba(34,197,94,0.2)]" : "bg-red-500/10 border-red-500/50 text-red-500"
            )}>
              {result?.passed ? <CheckCircle2 className="h-12 w-12" /> : <XCircle className="h-12 w-12" />}
            </div>
            <div className="space-y-2">
              <CardTitle className="text-4xl font-black tracking-tighter uppercase">
                {result?.passed ? "Expertise Validated" : "Validation Failed"}
              </CardTitle>
              <CardDescription className={cn("text-lg font-medium", result?.passed ? "text-green-400/70" : "text-red-400/70")}>
                {result?.passed 
                  ? `Congratulations! You are now a certified ${roleId?.replace('-', ' ')}.` 
                  : "Performance did not meet the certification threshold."}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-10 p-10">
            <div className="grid grid-cols-2 gap-6">
              <div className="p-8 rounded-3xl bg-slate-800/30 border border-white/5 text-center relative group">
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mb-2">Final Score</p>
                <p className={cn("text-5xl font-black tracking-tighter", result?.passed ? "text-white" : "text-slate-400")}>{result?.score}%</p>
              </div>
              <div className="p-8 rounded-3xl bg-slate-800/30 border border-white/5 text-center">
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mb-2">Integrity Status</p>
                <p className={cn("text-5xl font-black tracking-tighter", (result?.violations ?? 0) > 0 ? "text-red-500" : "text-green-500")}>
                  {result?.violations}
                </p>
                <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Total Violations</p>
              </div>
            </div>

            <div className="space-y-4">
              {result?.passed ? (
                <div className="space-y-4">
                  <div className="p-6 rounded-2xl bg-green-500/10 border border-green-500/20 flex gap-4 items-center">
                    <CheckCircle2 className="h-6 w-6 text-green-500 shrink-0" />
                    <p className="text-sm text-green-400 leading-relaxed font-medium">
                      Your SkillBridge Professional Certificate is now available. This digital credential can be shared on LinkedIn and your professional portfolio.
                    </p>
                  </div>
                  <Button onClick={() => navigate("/roadmap")} className="w-full py-8 text-xl font-black uppercase tracking-widest bg-green-600 hover:bg-green-700 shadow-xl shadow-green-600/20">
                    Claim Your Certificate
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 flex gap-4 items-center">
                    <AlertCircle className="h-6 w-6 text-red-500 shrink-0" />
                    <p className="text-sm text-red-400 leading-relaxed font-medium">
                      {(result?.violations ?? 0) >= 3 
                        ? "Security protocol was breached. Your assessment session was terminated automatically."
                        : "Required pass score is 70%. We recommend reviewing the failed sections in your roadmap before retaking."}
                    </p>
                  </div>
                  <Button variant="outline" onClick={() => navigate("/roadmap")} className="w-full py-8 text-lg font-bold border-white/10 hover:bg-white/5 uppercase tracking-widest">
                    Return to Training
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
