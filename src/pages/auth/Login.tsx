import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Chrome, Loader2, Sparkles, CheckCircle2, AlertCircle, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/context/AuthContext';
import { MFAVerification } from '@/components/auth/MFAVerification';

const features = [
  "Personalized skill gap analysis",
  "AI-powered learning roadmap", 
  "Track your career progress",
  "100+ curated resources"
];

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    isAuthenticated, 
    user, 
    isLoading, 
    error, 
    mfaRequired, 
    mfaToken,
    signInWithPopup,
    signInWithRedirect,
    clearError
  } = useAuth();

  const [authLoading, setAuthLoading] = useState(false);
  const [authMethod, setAuthMethod] = useState<'popup' | 'redirect' | null>(null);

  // Get redirect destination
  const from = location.state?.from?.pathname || '/dashboard';

  // Handle successful authentication
  useEffect(() => {
    if (isAuthenticated && user && !mfaRequired) {
      console.log('✅ User authenticated, redirecting to:', from);
      
      // Redirect to onboarding if user hasn't completed setup
      if (!user.name || user.name.trim() === '') {
        navigate('/onboarding', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    }
  }, [isAuthenticated, user, mfaRequired, navigate, from]);

  // Handle popup authentication
  const handlePopupAuth = async (): Promise<void> => {
    if (authLoading) return;
    
    setAuthLoading(true);
    setAuthMethod('popup');
    clearError();

    try {
      await signInWithPopup();
    } catch (error: any) {
      console.error('❌ Popup authentication failed:', error);
      // Error is handled by auth service and will be shown in UI
    } finally {
      setAuthLoading(false);
      setAuthMethod(null);
    }
  };

  // Handle redirect authentication
  const handleRedirectAuth = async (): Promise<void> => {
    if (authLoading) return;
    
    setAuthLoading(true);
    setAuthMethod('redirect');
    clearError();

    try {
      await signInWithRedirect();
      // This will cause a page redirect, so we won't reach the finally block
    } catch (error: any) {
      console.error('❌ Redirect authentication failed:', error);
      setAuthLoading(false);
      setAuthMethod(null);
    }
  };

  // Show loading during auth check
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary-foreground" />
          </div>
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Show MFA verification if required
  if (mfaRequired && mfaToken) {
    return <MFAVerification mfaToken={mfaToken} />;
  }

  // Show redirect loading
  if (isAuthenticated && user && !mfaRequired) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary-foreground" />
          </div>
          <p className="text-muted-foreground">Redirecting to dashboard...</p>
          <p className="text-xs text-muted-foreground/60 mt-2">
            Welcome back, {user.name || user.email}!
          </p>
        </div>
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
            transition={{ delay: 1, duration: 0.5 }}
            className="text-white/70 text-sm"
          >
            "The best investment you can make is in yourself." - Warren Buffett
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <Card className="border-0 shadow-2xl">
            <CardHeader className="text-center pb-8">
              <div className="lg:hidden flex items-center justify-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <span className="font-bold text-xl">SkillBridge</span>
              </div>
              
              <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
              <CardDescription className="text-base">
                Sign in to continue your learning journey
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Error Alert */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Primary Login Button */}
              <Button
                onClick={handlePopupAuth}
                disabled={authLoading}
                className="w-full h-12 text-base font-medium"
                size="lg"
              >
                {authLoading && authMethod === 'popup' ? (
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

              {/* Alternative Method */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Having trouble?
                  </span>
                </div>
              </div>

              <Button
                onClick={handleRedirectAuth}
                disabled={authLoading}
                variant="outline"
                className="w-full h-12 text-base"
                size="lg"
              >
                {authLoading && authMethod === 'redirect' ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Redirecting...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-5 w-5" />
                    Use redirect method
                  </>
                )}
              </Button>

              {/* Help Text */}
              <div className="text-center text-sm text-muted-foreground space-y-2">
                <p>
                  By signing in, you agree to our{' '}
                  <a href="/terms" className="underline hover:text-primary">Terms of Service</a>
                  {' '}and{' '}
                  <a href="/privacy" className="underline hover:text-primary">Privacy Policy</a>
                </p>
                
                <div className="pt-2 text-xs">
                  <p>If you're having trouble signing in:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1 text-left">
                    <li>Try disabling browser extensions</li>
                    <li>Allow popups for this site</li>
                    <li>Use the redirect method above</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;