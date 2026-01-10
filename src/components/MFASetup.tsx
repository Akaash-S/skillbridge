import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { apiClient } from "@/services/apiClient";
import {
  Shield,
  Smartphone,
  Copy,
  CheckCircle,
  AlertTriangle,
  Download,
  QrCode,
  Key,
  Loader2
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface MFASetupProps {
  onSetupComplete: () => void;
  onCancel: () => void;
}

export const MFASetup = ({ onSetupComplete, onCancel }: MFASetupProps) => {
  const { toast } = useToast();
  
  const [step, setStep] = useState<'setup' | 'verify'>('setup');
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string>('');
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [setupToken, setSetupToken] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState('');
  const [copiedCodes, setCopiedCodes] = useState(false);

  const startSetup = async () => {
    setLoading(true);
    try {
      const response = await apiClient.post('/mfa/setup');
      
      setQrCode(response.qr_code);
      setRecoveryCodes(response.recovery_codes);
      setSetupToken(response.setup_token);
      setStep('verify');
      
      toast({
        title: "MFA Setup Started",
        description: "Scan the QR code with your authenticator app and enter the verification code.",
      });
    } catch (error) {
      console.error('MFA setup error:', error);
      toast({
        title: "Setup Failed",
        description: "Failed to start MFA setup. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const verifySetup = async () => {
    if (!verificationCode.trim()) {
      toast({
        title: "Verification Code Required",
        description: "Please enter the 6-digit code from your authenticator app.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await apiClient.post('/mfa/verify-setup', {
        setup_token: setupToken,
        code: verificationCode
      });
      
      toast({
        title: "MFA Enabled Successfully",
        description: "Two-factor authentication has been enabled for your account.",
      });
      
      onSetupComplete();
    } catch (error) {
      console.error('MFA verification error:', error);
      toast({
        title: "Verification Failed",
        description: "Invalid verification code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyRecoveryCodes = () => {
    const codesText = recoveryCodes.join('\n');
    navigator.clipboard.writeText(codesText);
    setCopiedCodes(true);
    
    toast({
      title: "Recovery Codes Copied",
      description: "Recovery codes have been copied to your clipboard.",
    });
  };

  const downloadRecoveryCodes = () => {
    const codesText = `SkillBridge Account Recovery Codes\n\nGenerated: ${new Date().toLocaleString()}\n\n${recoveryCodes.join('\n')}\n\nKeep these codes safe and secure. Each code can only be used once.`;
    
    const blob = new Blob([codesText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `skillbridge-recovery-codes-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Recovery Codes Downloaded",
      description: "Recovery codes have been saved to your device.",
    });
  };

  if (step === 'setup') {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Enable Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            Add an extra layer of security to your account with two-factor authentication (2FA)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Benefits */}
          <div className="space-y-4">
            <h3 className="font-semibold">Why enable 2FA?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-3 border rounded-lg">
                <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium">Enhanced Security</h4>
                  <p className="text-sm text-muted-foreground">Protect your account even if your password is compromised</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 border rounded-lg">
                <Key className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium">Recovery Options</h4>
                  <p className="text-sm text-muted-foreground">Get backup codes to access your account if you lose your device</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Requirements */}
          <div className="space-y-4">
            <h3 className="font-semibold">What you'll need:</h3>
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Smartphone className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Authenticator App</p>
                <p className="text-sm text-muted-foreground">
                  Google Authenticator, Authy, or any TOTP-compatible app
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button onClick={startSetup} disabled={loading} className="flex-1">
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Shield className="h-4 w-4 mr-2" />
              )}
              Enable 2FA
            </Button>
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          Setup Your Authenticator App
        </CardTitle>
        <CardDescription>
          Scan the QR code and enter the verification code to complete setup
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* QR Code */}
        <div className="text-center space-y-4">
          <div className="inline-block p-4 bg-white rounded-lg border">
            <img src={qrCode} alt="MFA QR Code" className="w-48 h-48 mx-auto" />
          </div>
          <p className="text-sm text-muted-foreground">
            Scan this QR code with your authenticator app
          </p>
        </div>

        <Separator />

        {/* Verification */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="verification-code">Enter Verification Code</Label>
            <Input
              id="verification-code"
              placeholder="000000"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              className="text-center text-lg tracking-widest"
            />
            <p className="text-xs text-muted-foreground">
              Enter the 6-digit code from your authenticator app
            </p>
          </div>
        </div>

        <Separator />

        {/* Recovery Codes */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            <h3 className="font-semibold">Recovery Codes</h3>
            <Badge variant="outline">Important</Badge>
          </div>
          
          <div className="p-4 bg-muted/50 rounded-lg space-y-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium">Save these recovery codes safely!</p>
                <p className="text-muted-foreground">
                  Use these codes to access your account if you lose your authenticator device. Each code can only be used once.
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 font-mono text-sm">
              {recoveryCodes.map((code, index) => (
                <div key={index} className="p-2 bg-background border rounded text-center">
                  {code}
                </div>
              ))}
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={copyRecoveryCodes}>
                <Copy className="h-3 w-3 mr-1" />
                {copiedCodes ? 'Copied!' : 'Copy Codes'}
              </Button>
              <Button variant="outline" size="sm" onClick={downloadRecoveryCodes}>
                <Download className="h-3 w-3 mr-1" />
                Download
              </Button>
            </div>
          </div>
        </div>

        <Separator />

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button 
            onClick={verifySetup} 
            disabled={loading || verificationCode.length !== 6}
            className="flex-1"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4 mr-2" />
            )}
            Complete Setup
          </Button>
          <Button variant="outline" onClick={() => setStep('setup')}>
            Back
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};