import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Chrome, Loader2 } from "lucide-react";

export const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { login, user } = useApp();
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    // Simulate OAuth flow
    await new Promise((resolve) => setTimeout(resolve, 1500));
    login();
    setIsLoading(false);
    
    // Navigate to onboarding if no user profile, otherwise to dashboard
    if (!user) {
      navigate("/onboarding");
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">S</span>
            </div>
            <span className="font-semibold text-lg">SkillBridge</span>
          </Link>
        </div>
      </header>

      {/* Login Card */}
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md animate-scale-in">
          <CardHeader className="text-center space-y-2">
            <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center mx-auto mb-2">
              <span className="text-primary-foreground font-bold text-2xl">S</span>
            </div>
            <CardTitle className="text-2xl">Welcome to SkillBridge</CardTitle>
            <CardDescription>
              Sign in to analyze your skills and build your personalized learning roadmap.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full h-12 text-base"
              variant="outline"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <Chrome className="mr-2 h-5 w-5" />
                  Continue with Google
                </>
              )}
            </Button>
            
            <p className="text-center text-sm text-muted-foreground">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};
