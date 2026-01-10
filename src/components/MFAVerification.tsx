import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import {
  Shield,
  Smartphone,
  Key,
  Loader2,
  AlertCircle,
  ArrowLeft
} from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

interface MFAVerificationProps {
  mfaToken: string;
  onVerificationComplete: () => void;
  onCancel: () => void;
}

export const MFAVerification = ({ 
  mfaToken, 
  onVerificationComplete, 
  onCancel 
}: MFAVerificationProps) => {
  const { toast } = useToast();
  const { completeMFALogin } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [totpCode, setTotpCode] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [activeTab, setActiveTab] = useState('totp');

  const verifyTOTP = async () => {
    if (!totpCode.trim() || totpCode.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter a valid 6-digit code from your authenticator app.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await completeMFALogin(mfaToken, totpCode, false);
      
      toast({
        title: "Login Successful",
        description: "Welcome back! You have been successfully authenticated.",
      });
      
      onVerificationComplete();
    } catch (error) {
      console.error('TOTP verification error:', error);
      toast({
        title: "Verification Failed",
        description: "Invalid verification code. Please check your authenticator app and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyRecoveryCode = async () => {
    if (!recoveryCode.trim()) {
      toast({
        title: "Recovery Code Required",
        description: "Please enter a valid recovery code.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await completeMFALogin(mfaToken, recoveryCode, true);
      
      toast({
        title: "Login Successful",
        description: "Welcome back! Recovery code used successfully.",
      });
      
      onVerificationComplete();
    } catch (error) {
      console.error('Recovery code verification error:', error);
      toast({
        title: "Verification Failed",
        description: "Invalid recovery code. Please check the code and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTotpKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && totpCode.length === 6) {
      verifyTOTP();
    }
  };

  const handleRecoveryKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && recoveryCode.trim()) {
      verifyRecoveryCode();
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Shield className="h-5 w-5" />
          Two-Factor Authentication
        </CardTitle>
        <CardDescription>
          Enter your verification code to complete login
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="totp" className="flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              Authenticator
            </TabsTrigger>
            <TabsTrigger 
              value="recovery" 
              className="flex items-center gap-2"
            >
              <Key className="h-4 w-4" />
              Recovery Code
            </TabsTrigger>
          </TabsList>

          {/* TOTP Verification */}
          <TabsContent value="totp" className="space-y-4 mt-6">
            <div className="text-center space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <Smartphone className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="text-sm text-muted-foreground">
                  Open your authenticator app and enter the 6-digit code
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="totp-code">Verification Code</Label>
                <Input
                  id="totp-code"
                  placeholder="000000"
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  onKeyPress={handleTotpKeyPress}
                  maxLength={6}
                  className="text-center text-lg tracking-widest"
                  autoComplete="one-time-code"
                />
              </div>
              
              <Button 
                onClick={verifyTOTP} 
                disabled={loading || totpCode.length !== 6}
                className="w-full"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Shield className="h-4 w-4 mr-2" />
                )}
                Verify Code
              </Button>
            </div>
          </TabsContent>

          {/* Recovery Code Verification */}
          <TabsContent value="recovery" className="space-y-4 mt-6">
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-amber-800 dark:text-amber-200">
                      Using Recovery Code
                    </p>
                    <p className="text-amber-700 dark:text-amber-300">
                      Each recovery code can only be used once. Make sure to generate new codes after using this one.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="recovery-code">Recovery Code</Label>
                <Input
                  id="recovery-code"
                  placeholder="XXXX-XXXX"
                  value={recoveryCode}
                  onChange={(e) => setRecoveryCode(e.target.value.toUpperCase())}
                  onKeyPress={handleRecoveryKeyPress}
                  className="text-center font-mono"
                  autoComplete="one-time-code"
                />
                <p className="text-xs text-muted-foreground text-center">
                  Enter one of your 8-character recovery codes
                </p>
              </div>
              
              <Button 
                onClick={verifyRecoveryCode} 
                disabled={loading || !recoveryCode.trim()}
                className="w-full"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Key className="h-4 w-4 mr-2" />
                )}
                Use Recovery Code
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <Separator className="my-6" />

        {/* Cancel Button */}
        <Button variant="outline" onClick={onCancel} className="w-full">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Login
        </Button>
      </CardContent>
    </Card>
  );
};