import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Smartphone, Key, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';

export const MFAVerification: React.FC = () => {
  const { completeMFALogin, signOut, error, clearError, mfaToken } = useAuth();

  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [totpCode, setTotpCode] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [activeTab, setActiveTab] = useState('totp');

  if (!mfaToken) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">MFA session expired. Please log in again.</p>
      </div>
    );
  }

  // Handle TOTP verification
  const handleTOTPVerification = async (): Promise<void> => {
    if (!totpCode.trim() || totpCode.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter a valid 6-digit code from your authenticator app.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    clearError();

    try {
      await completeMFALogin(mfaToken, totpCode, false);
      
      toast({
        title: "Login Successful",
        description: "Welcome back! You have been successfully authenticated.",
      });
    } catch (error: any) {
      console.error('❌ TOTP verification failed:', error);
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid verification code. Please check your authenticator app and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle recovery code verification
  const handleRecoveryVerification = async (): Promise<void> => {
    if (!recoveryCode.trim()) {
      toast({
        title: "Recovery Code Required",
        description: "Please enter a valid recovery code.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    clearError();

    try {
      await completeMFALogin(mfaToken, recoveryCode, true);
      
      toast({
        title: "Login Successful",
        description: "Welcome back! You have been successfully authenticated using a recovery code.",
      });
    } catch (error: any) {
      console.error('❌ Recovery code verification failed:', error);
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid recovery code. Please check your code and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle cancel/back to login
  const handleCancel = async (): Promise<void> => {
    try {
      await signOut();
    } catch (error) {
      console.error('❌ Error during cancel:', error);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (event: React.KeyboardEvent, action: () => void): void => {
    if (event.key === 'Enter' && !isLoading) {
      action();
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl"
      >
        <Card className="border border-border/50 shadow-2xl overflow-hidden bg-card/50 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row min-h-[500px]">
            {/* Left Column: Details & Help */}
            <div className="md:w-5/12 bg-muted/20 p-8 md:p-10 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-border/50">
              <div className="mb-8 h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center ring-4 ring-primary/5">
                <Shield className="h-12 w-12 text-primary" />
              </div>
              <h2 className="text-3xl font-bold text-center mb-4 leading-tight">Two-Factor<br />Authentication</h2>
              <p className="text-center text-muted-foreground text-lg mb-8 max-w-[250px]">
                Please verify your identity to continue securely.
              </p>
              
              <div className="mt-auto w-full pt-8 text-sm text-muted-foreground space-y-3 bg-background/50 p-4 rounded-lg border border-border/50">
                <p className="font-medium text-foreground flex items-center justify-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Having trouble?
                </p>
                <ul className="space-y-2 text-xs">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Check your device's time synchronization</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Use a recovery code if authenticator fails</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Contact support if all methods are lost</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Right Column: Inputs & Actions */}
            <div className="md:w-7/12 p-8 md:p-12 flex flex-col justify-center">
              <div className="w-full max-w-md mx-auto space-y-8">
                {/* Error Alert */}
                {error && (
                  <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 p-1 bg-muted/50">
                    <TabsTrigger value="totp" className="flex items-center gap-2 rounded-md">
                      <Smartphone className="h-4 w-4" />
                      Authenticator
                    </TabsTrigger>
                    <TabsTrigger value="recovery" className="flex items-center gap-2 rounded-md">
                      <Key className="h-4 w-4" />
                      Recovery Code
                    </TabsTrigger>
                  </TabsList>
                  
                  {/* TOTP Tab */}
                  <TabsContent value="totp" className="space-y-6 mt-8 animate-in fade-in zoom-in-95 duration-200">
                    <div className="text-center text-sm text-muted-foreground">
                      Enter the 6-digit code from your authenticator app
                    </div>
                    
                    <div className="space-y-3">
                      <Label htmlFor="totp-code" className="sr-only">Verification Code</Label>
                      <Input
                        id="totp-code"
                        type="text"
                        placeholder="000000"
                        value={totpCode}
                        onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        onKeyPress={(e) => handleKeyPress(e, handleTOTPVerification)}
                        className="text-center text-3xl tracking-[0.5em] font-mono h-16 bg-background/50 focus:bg-background transition-colors"
                        maxLength={6}
                        autoComplete="one-time-code"
                        disabled={isLoading}
                      />
                    </div>
                    
                    <Button
                      onClick={handleTOTPVerification}
                      disabled={isLoading || totpCode.length !== 6}
                      className="w-full h-12 text-lg font-medium transition-all"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        'Verify Code'
                      )}
                    </Button>
                  </TabsContent>
                  
                  {/* Recovery Code Tab */}
                  <TabsContent value="recovery" className="space-y-6 mt-8 animate-in fade-in zoom-in-95 duration-200">
                    <div className="text-center text-sm text-muted-foreground">
                      Enter one of your emergency recovery codes
                    </div>
                    
                    <div className="space-y-3">
                      <Label htmlFor="recovery-code" className="sr-only">Recovery Code</Label>
                      <Input
                        id="recovery-code"
                        type="text"
                        placeholder="XXXX-XXXX"
                        value={recoveryCode}
                        onChange={(e) => setRecoveryCode(e.target.value.toUpperCase())}
                        onKeyPress={(e) => handleKeyPress(e, handleRecoveryVerification)}
                        className="text-center text-xl tracking-widest font-mono h-14 bg-background/50 focus:bg-background transition-colors"
                        autoComplete="one-time-code"
                        disabled={isLoading}
                      />
                    </div>
                    
                    <Button
                      onClick={handleRecoveryVerification}
                      disabled={isLoading || !recoveryCode.trim()}
                      className="w-full h-12 text-lg font-medium transition-all"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        'Use Recovery Code'
                      )}
                    </Button>
                    
                    <Alert className="bg-muted/30 border-none text-muted-foreground">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        Recovery codes are single-use. Generate new ones if you run low.
                      </AlertDescription>
                    </Alert>
                  </TabsContent>
                </Tabs>

                {/* Cancel Button */}
                <div className="pt-6 mt-6 border-t border-border/30">
                  <Button
                    onClick={handleCancel}
                    variant="ghost"
                    className="w-full hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
                    disabled={isLoading}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Login
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default MFAVerification;