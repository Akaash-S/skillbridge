import { useState, useEffect, useMemo } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Chrome, Loader2, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { MFAVerification } from "@/components/auth/MFAVerification";
import { AuthErrorHandler } from "@/components/AuthErrorHandler";
// import { AuthDebug } from "@/components/AuthDebug"; // Temporarily disabled

const features = [
  "Personalized skill gap analysis",
  "AI-powered learning roadmap",
  "Track your career progress",
  "100+ curated resources"
];

export const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [hasRedirected, setHasRedirected] = useState(false);
  const [showAuthError, setShowAuthError] = useState(false);
  const [authError, setAuthError] = useState<string>('');
  const { 
    signInWithPopup, 
    signInWithRedirect, 
    user, 
    isLoading, 
    error, 
    clearError, 
    isAuthenticated, 
    mfaRequired, 
    mfaToken 
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Memoize the redirect destination to prevent infinite re-renders
  const from = useMemo(() => {
    return location.state?.from?.pathname || "/dashboard";
  }, [location.state?.from?.pathname]);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setShowAuthError(false);
    setAuthError('');
    
    try {
      await signInWithPopup();
    } catch (error: any) {
      console.error('Login failed:', error);
      
      // Don't show error for redirect in progress
      if (error.message !== 'REDIRECT_IN_PROGRESS') {
        setAuthError(error.message || 'Authentication failed');
        setShowAuthError(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseRedirect = async () => {
    setIsLoading(true);
    setShowAuthError(false);
    
    try {
      // Force redirect method
      await signInWithRedirect();
    } catch (error: any) {
      console.error('Redirect login failed:', error);
      if (error.message !== 'REDIRECT_IN_PROGRESS') {
        setAuthError(error.message || 'Redirect authentication failed');
        setShowAuthError(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetryAuth = () => {
    setShowAuthError(false);
    setAuthError('');
    handleGoogleLogin();
  };

  // Redirect authenticated users immediately
  useEffect(() => {
    console.log('🔍 Login page - Auth state check:', { 
      isAuthenticated, 
      user: !!user, 
      userName: user?.name,
      userEmail: user?.email,
      loading, 
      mfaRequired,
      hasRedirected
    });
    
    // If user is fully authenticated and not in MFA flow, redirect immediately
    if (isAuthenticated && user && !mfaRequired && !hasRedirected) {
      console.log('✅ User already authenticated, redirecting...');
      setHasRedirected(true);
      
      // Immediate redirect without delay
      const redirectPath = (!user.name || user.name === '') ? "/onboarding" : from;
      console.log('🔄 Redirecting to:', redirectPath);
      
      // Try multiple redirect methods to ensure it works
      navigate(redirectPath, { replace: true });
      
      // Fallback redirect after short delay
      setTimeout(() => {
        if (window.location.pathname === '/login') {
          console.log('🔄 Fallback redirect triggered');
          window.location.href = redirectPath;
        }
      }, 500);
      
    } else {
      console.log('❌ Not redirecting because:', {
        isAuthenticated: isAuthenticated ? '✅' : '❌',
        hasUser: user ? '✅' : '❌',
        notLoading: !loading ? '✅' : '❌',
        noMFA: !mfaRequired ? '✅' : '❌',
        notRedirected: !hasRedirected ? '✅' : '❌'
      });
    }
  }, [isAuthenticated, user, loading, mfaRequired, navigate, from, hasRedirected]);

  // Show loading while checking authentication status
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-foreground"></div>
          </div>
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated but we're still here, show loading while redirecting
  if (isAuthenticated && user && !mfaRequired) {
    console.log('🔄 Authenticated user on login page, showing redirect loading...');
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-foreground"></div>
          </div>
          <p className="text-muted-foreground">Redirecting to dashboard...</p>
          <p className="text-xs text-muted-foreground/60 mt-2">
            User: {user.email} | Auth: {isAuthenticated ? 'Yes' : 'No'}
          </p>
        </div>
        {/* <AuthDebug /> */}
      </div>
    );
  }

  // If MFA is required, show MFA verification
  if (mfaRequired && mfaToken) {
    return <MFAVerification />;
  }

  // If there's an authentication error, show error handler
  if (showAuthError && authError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <AuthErrorHandler
          error={authError}
          onRetry={handleRetryAuth}
          onUseRedirect={handleUseRedirect}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-accent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.15),transparent)]" />
        
        {/* Floating Elements */}
        <motion.div 
          className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-2xl"
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-32 right-20 w-48 h-48 bg-white/10 rounded-full blur-3xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        
        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          {/* Logo */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3"
          >
            <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-2xl">SkillBridge</span>
          </motion.div>
          
          {/* Main Content */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="space-y-8"
          >
            <div>
              <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
                Bridge the gap<br />to your dream career
              </h1>
              <p className="text-lg text-white/80 max-w-md">
                Join thousands of professionals who've accelerated their career growth with personalized skill roadmaps.
              </p>
            </div>
            
            <div className="space-y-3">
              {features.map((feature, index) => (
                <motion.div 
                  key={feature}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1, duration: 0.4 }}
                  className="flex items-center gap-3"
                >
                  <CheckCircle2 className="h-5 w-5 text-white/80" />
                  <span className="text-white/90">{feature}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
          
          {/* Bottom Quote */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="space-y-4"
          >
            <p className="text-white/70 text-sm italic">
              "SkillBridge helped me land my dream job as a Senior Developer in just 6 months."
            </p>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center font-semibold text-sm">
                MR
              </div>
              <div>
                <p className="font-medium text-sm">Michael R.</p>
                <p className="text-white/60 text-xs">Software Engineer at Google</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col">
        {/* Mobile Header */}
        <header className="lg:hidden border-b border-border p-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg">SkillBridge</span>
          </Link>
        </header>
        
        <main className="flex-1 flex items-center justify-center p-6 md:p-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            <Card className="border-border/50 shadow-2xl shadow-primary/5">
              <CardHeader className="text-center space-y-4 pb-2">
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                  className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto shadow-lg shadow-primary/25"
                >
                  <Sparkles className="h-8 w-8 text-primary-foreground" />
                </motion.div>
                <div className="space-y-2">
                  <CardTitle className="text-2xl md:text-3xl font-bold">Welcome back</CardTitle>
                  <CardDescription className="text-base">
                    Sign in to continue your learning journey
                  </CardDescription>
                  {error && (
                    <div className="bg-destructive/10 text-destructive px-3 py-2 rounded-lg text-sm">
                      {error}
                      <Button variant="ghost" size="sm" onClick={clearError} className="ml-2 h-auto p-0 text-xs">
                        Dismiss
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6 pt-4">
                <Button
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="w-full h-14 text-base font-medium group"
                  variant="outline"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <Chrome className="mr-3 h-5 w-5" />
                      Continue with Google
                      <ArrowRight className="ml-auto h-4 w-4 opacity-50 group-hover:translate-x-1 group-hover:opacity-100 transition-all" />
                    </>
                  )}
                </Button>
                
                {/* <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">or</span>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  className="w-full h-12 text-muted-foreground"
                  disabled
                >
                  More sign-in options coming soon
                </Button> */}
                
                <p className="text-center text-sm text-muted-foreground leading-relaxed">
                  By continuing, you agree to our{" "}
                  <Link to="#" className="text-primary hover:underline font-medium">Terms of Service</Link>
                  {" "}and{" "}
                  <Link to="#" className="text-primary hover:underline font-medium">Privacy Policy</Link>
                </p>
              </CardContent>
            </Card>
            
            <p className="text-center text-sm text-muted-foreground mt-6">
              Don't have an account?{" "}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Create one by signing in
              </Link>
            </p>
          </motion.div>
        </main>
      </div>
      {/* <AuthDebug /> */}
    </div>
  );
};
