import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { 
  Award, 
  ShieldCheck, 
  Calendar, 
  BookOpen, 
  ClipboardCheck, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Lock, 
  AlertTriangle,
  Loader2,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useAppData } from "@/context/AppDataContext";
import { certificateService, Certificate as CertData } from "@/services/certificateService";
import { apiClient } from "@/services/apiClient";
import { Certificate } from "@/components/Certificate";

interface AssessmentSession {
  sessionId: string;
  roleId: string;
  status: "passed" | "failed" | "terminated" | "active";
  score: number;
  completed: boolean;
}

export const Certifications = () => {
  const { selectedRole, roadmap, roadmapModules } = useAppData();
  
  // State
  const [certificates, setCertificates] = useState<CertData[]>([]);
  const [sessions, setSessions] = useState<AssessmentSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [selectedCert, setSelectedCert] = useState<CertData | null>(null);

  // Load user certificates and assessment sessions
  const loadData = async () => {
    try {
      setLoading(true);
      const [certsRes, sessionsRes] = await Promise.all([
        certificateService.getUserCertificates(),
        apiClient.get<AssessmentSession[]>("/assessment/sessions")
      ]);
      setCertificates(certsRes || []);
      setSessions(sessionsRes || []);
    } catch (error) {
      console.error("Failed to load certifications data:", error);
      toast.error("Failed to load your credentials dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Calculate active roadmap completion percent
  const completedCount = roadmapModules.length > 0 
    ? roadmapModules.filter((m: any) => m.quizPassed).length 
    : roadmap.filter((item) => item.completed).length;
    
  const progressPercent = roadmapModules.length > 0 
    ? Math.round((completedCount / roadmapModules.length) * 100) 
    : roadmap.length > 0 ? Math.round((completedCount / roadmap.length) * 100) : 0;

  // Check if active role has passed assessment
  const activeRoleSession = selectedRole 
    ? sessions.find(s => s.roleId === selectedRole.id && s.status === "passed") 
    : null;
    
  const isAssessmentPassed = !!activeRoleSession;

  // Active path verification eligibility
  const isRoadmapCompleted = progressPercent === 100 && roadmap.length > 0;
  const isEligibleToClaim = isRoadmapCompleted && isAssessmentPassed;

  // Check if certificate already exists for current selected role
  const isAlreadyClaimed = selectedRole 
    ? certificates.some(c => c.roleId === selectedRole.id) 
    : false;

  const handleClaimCertificate = async () => {
    if (!selectedRole || !isEligibleToClaim || claiming) return;

    try {
      setClaiming(true);
      toast.info("Verifying requirements and generating credential...");
      
      const response = await certificateService.verifyAndIssue(selectedRole.id);
      
      toast.success(`Congratulations! You have claimed your ${selectedRole.title} certificate.`);
      
      // Reload lists and show claimed cert
      await loadData();
      setSelectedCert(response);
    } catch (error: any) {
      console.error("Claim error:", error);
      toast.error(error.message || "Failed to claim certificate. Ensure all milestones are marked complete.");
    } finally {
      setClaiming(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-8 max-w-6xl mx-auto">
        {/* Header Block */}
        <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card/40 backdrop-blur-md p-8 md:p-10">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-semibold">
                <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                Skill Verification Center
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                Credentials & Certifications
              </h1>
              <p className="text-muted-foreground text-sm md:text-base max-w-2xl">
                Unlock professional validation for your customized roadmaps. Complete study items, pass proctored exams, and showcase verified credentials.
              </p>
            </div>
            <Award className="hidden md:block h-24 w-24 text-primary/30 shrink-0" />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-card/40 backdrop-blur-sm border-border/40 hover:border-border transition-colors duration-300">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs font-bold uppercase tracking-wider">Credentials Issued</CardDescription>
              <CardTitle className="text-3xl font-extrabold flex items-center gap-2">
                <Award className="h-6 w-6 text-primary" />
                {certificates.length}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Professional certificates earned</p>
            </CardContent>
          </Card>

          <Card className="bg-card/40 backdrop-blur-sm border-border/40 hover:border-border transition-colors duration-300">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs font-bold uppercase tracking-wider">Active Roadmaps</CardDescription>
              <CardTitle className="text-3xl font-extrabold flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-info" />
                {selectedRole ? 1 : 0}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Paths currently in progress</p>
            </CardContent>
          </Card>

          <Card className="bg-card/40 backdrop-blur-sm border-border/40 hover:border-border transition-colors duration-300">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs font-bold uppercase tracking-wider">Exams Passed</CardDescription>
              <CardTitle className="text-3xl font-extrabold flex items-center gap-2">
                <ShieldCheck className="h-6 w-6 text-green-500" />
                {sessions.filter(s => s.status === "passed").length}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Proctored validations successfully cleared</p>
            </CardContent>
          </Card>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground font-semibold">Synchronizing certifications profile...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Requirements Tracker */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-card/50 backdrop-blur-sm border border-border/50 shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    Target Credential Status
                  </CardTitle>
                  <CardDescription>
                    Track your eligibility and progress toward your targeted certificate
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {selectedRole ? (
                    <div className="space-y-6">
                      <div className="p-4 rounded-xl border bg-muted/20">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <h3 className="font-bold text-base text-foreground">{selectedRole.title}</h3>
                            <p className="text-xs text-muted-foreground mt-0.5">{selectedRole.description}</p>
                          </div>
                          <Badge variant="outline" className="text-primary border-primary">
                            In Progress
                          </Badge>
                        </div>
                      </div>

                      <Separator />

                      {/* Requirement Checklist */}
                      <div className="space-y-4">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Claim Requirements</h4>
                        
                        {/* Requirement 1: Roadmap 100% */}
                        <div className="flex items-start gap-3 p-4 rounded-xl border bg-card/30">
                          {isRoadmapCompleted ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                          ) : (
                            <div className="p-1.5 rounded-full bg-amber-500/10 text-amber-500 shrink-0 mt-0.5">
                              <Lock className="h-3.5 w-3.5" />
                            </div>
                          )}
                          <div className="space-y-2 w-full">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-semibold text-foreground">1. Complete Learning Roadmap</span>
                              <span className="text-xs font-bold text-muted-foreground">{progressPercent}% complete</span>
                            </div>
                            <Progress value={progressPercent} className="h-1.5" />
                            <p className="text-xs text-muted-foreground">
                              All modules and verification quizzes in your custom roadmap must be completed.
                            </p>
                          </div>
                        </div>

                        {/* Requirement 2: Proctored Assessment Passed */}
                        <div className="flex items-start gap-3 p-4 rounded-xl border bg-card/30">
                          {isAssessmentPassed ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                          ) : (
                            <div className="p-1.5 rounded-full bg-amber-500/10 text-amber-500 shrink-0 mt-0.5">
                              <Lock className="h-3.5 w-3.5" />
                            </div>
                          )}
                          <div className="space-y-1 w-full">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-semibold text-foreground">2. Pass Proctored Assessment</span>
                              {isAssessmentPassed ? (
                                <Badge className="bg-green-500/20 text-green-600 hover:bg-green-500/20 text-[10px] font-bold">
                                  PASSED ({activeRoleSession?.score}%)
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="text-[10px] font-bold">
                                  PENDING
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Clear the high-integrity proctored technical evaluation with a score of 70% or higher.
                            </p>
                            {!isAssessmentPassed && (
                              <Link to={`/assessment/${selectedRole.id}`} className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline pt-2">
                                Take Proctored Evaluation Now
                                <ChevronRight className="h-3 w-3" />
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action Button */}
                      {isAlreadyClaimed ? (
                        <div className="p-4 border border-green-500/20 bg-green-500/5 text-green-600 rounded-xl text-center flex items-center justify-center gap-2">
                          <CheckCircle2 className="h-5 w-5" />
                          <span className="text-sm font-semibold">Certificate already claimed and available in your gallery</span>
                        </div>
                      ) : isEligibleToClaim ? (
                        <Button 
                          onClick={handleClaimCertificate} 
                          disabled={claiming}
                          className="w-full h-12 text-sm font-bold gap-2 shadow-lg shadow-primary/20 hover:scale-[1.01] transition-all duration-300"
                        >
                          {claiming ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Generating Credential...
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4" />
                              Verify & Claim Professional Certificate
                            </>
                          )}
                        </Button>
                      ) : (
                        <div className="p-4 border border-amber-500/20 bg-amber-500/5 text-amber-600 rounded-xl flex items-start gap-3">
                          <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                          <div className="text-xs">
                            <p className="font-bold">Claim Locked</p>
                            <p className="text-muted-foreground mt-0.5">
                              Please finish the remaining items in your target curriculum and pass the proctored evaluation to unlock your certificate.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-muted/10 rounded-xl border border-dashed p-6">
                      <Lock className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                      <h3 className="font-bold text-sm text-foreground">No Target Role Selected</h3>
                      <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                        Please visit the Career Hub to select a target role, generate a custom learning roadmap, and start tracking your path.
                      </p>
                      <Link to="/career-hub" className="mt-4 inline-block">
                        <Button size="sm">Go to Career Hub</Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Claimed Certificates Gallery */}
            <div className="space-y-6">
              <Card className="bg-card/50 backdrop-blur-sm border border-border/50 shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    Verified Credentials
                  </CardTitle>
                  <CardDescription>
                    Your gallery of earned professional certificates
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {certificates.length > 0 ? (
                    <div className="space-y-3">
                      {certificates.map((cert) => (
                        <div 
                          key={cert.certificateId} 
                          className="p-4 border border-border rounded-xl bg-card hover:border-primary/50 transition-all duration-300 flex justify-between items-center gap-4 group cursor-pointer"
                          onClick={() => setSelectedCert(cert)}
                        >
                          <div className="space-y-1">
                            <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                              {cert.roleName}
                            </h4>
                            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              <span>{new Date(cert.issuedAt || cert.completionDate).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <Badge variant="secondary" className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors shrink-0 text-[10px]">
                            View
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 border border-dashed rounded-xl p-4 bg-muted/10">
                      <Award className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
                      <h4 className="font-semibold text-xs text-muted-foreground">No Credentials Earned Yet</h4>
                      <p className="text-[10px] text-muted-foreground/70 mt-1 max-w-[200px] mx-auto">
                        Complete your active learning modules and pass the evaluations to populate your gallery.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* Certificate Viewer Modal */}
      {selectedCert && (
        <Dialog open={!!selectedCert} onOpenChange={(open) => !open && setSelectedCert(null)}>
          <DialogContent className="max-w-4xl bg-background border border-border shadow-2xl p-6 overflow-hidden">
            <DialogHeader className="pb-4 border-b">
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Professional Certificate Verified
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Certificate ID: <span className="font-mono bg-muted px-2 py-0.5 rounded border">{selectedCert.certificateId}</span>
              </DialogDescription>
            </DialogHeader>
            <div className="py-6 flex justify-center bg-muted/20 rounded-lg border my-4 overflow-x-auto">
              <div className="min-w-[800px] p-2 flex justify-center">
                <Certificate
                  userName={selectedCert.userName}
                  roleName={selectedCert.roleName}
                  completionDate={selectedCert.issuedAt || selectedCert.completionDate}
                  certificateId={selectedCert.certificateId}
                  hideVerifyLink={false}
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Layout>
  );
};
