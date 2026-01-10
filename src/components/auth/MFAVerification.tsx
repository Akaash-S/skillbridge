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

interface MFAVerificationProps {
  mfaToken: string;
}

export const MFAVerification: React.FC<MFAVerificationProps> = ({ mfaToken }) => {
  const { completeMFALogin, signOut, error, clearError } = useAuth();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [totpCode, setTotpCode] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [activeTab, setActiveTab] = useState('totp');

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
        className="w-full max-w-md"
      >
        <Card className="border-0 shadow-2xl">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Two-Factor Authentication</CardTitle>
            <CardDescription className="text-base">
              Please verify your identity to continue
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

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="totp" className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  Authenticator
                </TabsTrigger>
                <TabsTrigger value="recovery" className="flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  Recovery Code
                </TabsTrigger>
              </TabsList>
              
              {/* TOTP Tab */}
              <TabsContent value="totp" className="space-y-4 mt-6">
                <div className="text-center text-sm text-muted-foreground mb-4">
                  Enter the 6-digit code from your authenticator app
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="totp-code">Verification Code</Label>
                  <Input
                    id="totp-code"
                    type="text"
                    placeholder="000000"
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    onKeyPress={(e) => handleKeyPress(e, handleTOTPVerification)}
                    className="text-center text-lg tracking-widest font-mono"
                    maxLength={6}
                    autoComplete="one-time-code"
                    disabled={isLoading}
                  />
                </div>
                
                <Button
                  onClick={handleTOTPVerification}
                  disabled={isLoading || totpCode.length !== 6}
                  className="w-full h-12"
                  size="lg"
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
              <TabsContent value="recovery" className="space-y-4 mt-6">
                <div className="text-center text-sm text-muted-foreground mb-4">
                  Enter one of your recovery codes
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="recovery-code">Recovery Code</Label>
                  <Input
                    id="recovery-code"
                    type="text"
                    placeholder="XXXX-XXXX"
                    value={recoveryCode}
                    onChange={(e) => setRecoveryCode(e.target.value.toUpperCase())}
                    onKeyPress={(e) => handleKeyPress(e, handleRecoveryVerification)}
                    className="text-center text-lg tracking-wider font-mono"
                    autoComplete="one-time-code"
                    disabled={isLoading}
                  />
                </div>
                
                <Button
                  onClick={handleRecoveryVerification}
                  disabled={isLoading || !recoveryCode.trim()}
                  className="w-full h-12"
                  size="lg"
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
                
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    Recovery codes can only be used once. Make sure to generate new ones after using this code.
                  </AlertDescription>
                </Alert>
              </TabsContent>
            </Tabs>

            {/* Cancel Button */}
            <div className="pt-4 border-t">
              <Button
                onClick={handleCancel}
                variant="ghost"
                className="w-full"
                disabled={isLoading}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
              </Button>
            </div>

            {/* Help Text */}
            <div className="text-center text-xs text-muted-foreground space-y-2">
              <p>Having trouble with two-factor authentication?</p>
              <div className="space-y-1">
                <p>• Make sure your device's time is correct</p>
                <p>• Try using a recovery code if your authenticator isn't working</p>
                <p>• Contact support if you've lost access to both methods</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default MFAVerification;