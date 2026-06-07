import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ShieldCheck, XCircle, Loader2, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { certificateService, Certificate as CertData } from "@/services/certificateService";
import { Certificate } from "@/components/Certificate";

export const VerifyCertificate = () => {
  const { id } = useParams<{ id: string }>();
  const [certData, setCertData] = useState<CertData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCert = async () => {
      if (!id) return;
      try {
        const data = await certificateService.verifyCertificate(id);
        setCertData(data);
      } catch (err: any) {
        setError(err.message || "Certificate not found or invalid.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCert();
  }, [id]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="container mx-auto px-4 py-8 flex-1 flex flex-col">
        <header className="flex justify-between items-center mb-8">
          <div className="font-bold text-2xl tracking-tighter">
            Skill<span className="text-primary">Bridge</span>
          </div>
          <Link to="/">
            <Button variant="outline" size="sm" className="gap-2">
              <Home className="h-4 w-4" />
              Go Home
            </Button>
          </Link>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center max-w-5xl mx-auto w-full">
          {isLoading ? (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
              <p className="text-lg text-muted-foreground">Verifying certificate...</p>
            </div>
          ) : error || !certData ? (
            <div className="text-center space-y-6 bg-muted/20 p-12 rounded-2xl border border-border/50 w-full max-w-lg">
              <div className="mx-auto h-24 w-24 rounded-full bg-destructive/10 flex items-center justify-center">
                <XCircle className="h-12 w-12 text-destructive" />
              </div>
              <h1 className="text-3xl font-bold">Invalid Certificate</h1>
              <p className="text-muted-foreground text-lg">
                We couldn't find a valid certificate matching this ID: <br/>
                <span className="font-mono bg-background px-3 py-1 rounded mt-3 inline-block shadow-sm border border-border/50">{id}</span>
              </p>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center gap-8">
              <div className="flex items-center gap-3 text-green-500 bg-green-500/10 px-6 py-3 rounded-full border border-green-500/20 shadow-sm">
                <ShieldCheck className="h-6 w-6" />
                <span className="font-medium text-lg">Verified Authentic Certificate</span>
              </div>
              
              <div className="w-full max-w-[850px] flex justify-center bg-muted/20 p-4 sm:p-8 rounded-xl border border-border/50">
                <Certificate
                  userName={certData.userName}
                  roleName={certData.roleName}
                  completionDate={certData.issuedAt || certData.completionDate}
                  certificateId={certData.certificateId}
                />
              </div>

              <div className="text-center text-muted-foreground max-w-2xl bg-card p-6 rounded-lg border border-border/30">
                This certificate verifies that <strong className="text-foreground">{certData.userName}</strong> has successfully completed all requirements for the <strong className="text-foreground">{certData.roleName}</strong> learning path on SkillBridge.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyCertificate;
