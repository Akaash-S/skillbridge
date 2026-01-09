import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { apiService } from "@/services/api";
import { MFASetup } from "./MFASetup";
import {
  Shield,
  ShieldCheck,
  ShieldX,
  Key,
  RefreshCw,
  Trash2,
  Loader2,
  AlertTriangle,
  CheckCircle,
  Copy,
  Download
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface MFAStatus {
  enabled: boolean;
  setup_required: boolean;
  recovery_codes_count: number;
  setup_date?: string;
  last_used?: string;
}

export const MFAManagement = () => {
  const { toast } = useToast();
  
  const [mfaStatus, setMfaStatus] = useState<MFAStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSetup, setShowSetup] = useState(false);
  const [showRegenerateDialog, setShowRegenerateDialog] = useState(false);
  const [showDisableDialog, setShowDisableDialog] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [isRecoveryCode, setIsRecoveryCode] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [newRecoveryCodes, setNewRecoveryCodes] = useState<string[]>([]);

  // Load MFA status
  const loadMFAStatus = async () => {
    setLoading(true);
    try {
      const status = await apiService.getMFAStatus();
      setMfaStatus(status);
    } catch (error) {
      console.error('Failed to load MFA status:', error);
      toast({
        title: "Error",
        description: "Failed to load MFA status.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Regenerate recovery codes
  const regenerateRecoveryCodes = async () => {
    if (!verificationCode.trim()) {
      toast({
        title: "Verification Required",
        description: "Please enter your authenticator code to regenerate recovery codes.",
        variant: "destructive",
      });
      return;
    }

    setActionLoading(true);
    try {
      const response = await apiService.regenerateRecoveryCodes(verificationCode);
      setNewRecoveryCodes(response.recovery_codes);
      setVerificationCode('');
      setShowRegenerateDialog(false);
      
      // Refresh status
      await loadMFAStatus();
      
      toast({
        title: "Recovery Codes Regenerated",
        description: "New recovery codes have been generated. Save them securely.",
      });
    } catch (error) {
      console.error('Failed to regenerate recovery codes:', error);
      toast({
        title: "Regeneration Failed",
        description: "Failed to regenerate recovery codes. Please check your verification code.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Disable MFA
  const disableMFA = async () => {
    if (!verificationCode.trim()) {
      toast({
        title: "Verification Required",
        description: "Please enter your verification code to disable MFA.",
        variant: "destructive",
      });
      return;
    }

    setActionLoading(true);
    try {
      await apiService.disableMFA(verificationCode, isRecoveryCode);
      setVerificationCode('');
      setIsRecoveryCode(false);
      setShowDisableDialog(false);
      
      // Refresh status
      await loadMFAStatus();
      
      toast({
        title: "MFA Disabled",
        description: "Two-factor authentication has been disabled for your account.",
      });
    } catch (error) {
      console.error('Failed to disable MFA:', error);
      toast({
        title: "Disable Failed",
        description: "Failed to disable MFA. Please check your verification code.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Copy recovery codes
  const copyRecoveryCodes = () => {
    const codesText = newRecoveryCodes.join('\n');
    navigator.clipboard.writeText(codesText);
    
    toast({
      title: "Recovery Codes Copied",
      description: "Recovery codes have been copied to your clipboard.",
    });
  };

  // Download recovery codes
  const downloadRecoveryCodes = () => {
    const codesText = `SkillBridge Account Recovery Codes\n\nGenerated: ${new Date().toLocaleString()}\n\n${newRecoveryCodes.join('\n')}\n\nKeep these codes safe and secure. Each code can only be used once.`;
    
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

  useEffect(() => {
    loadMFAStatus();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (showSetup) {
    return (
      <MFASetup
        onSetupComplete={() => {
          setShowSetup(false);
          loadMFAStatus();
        }}
        onCancel={() => setShowSetup(false)}
      />
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {mfaStatus?.enabled ? (
              <ShieldCheck className="h-5 w-5 text-green-600" />
            ) : (
              <ShieldX className="h-5 w-5 text-red-600" />
            )}
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            Add an extra layer of security to your account with 2FA
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <div>
                <p className="font-medium">
                  Status: {mfaStatus?.enabled ? (
                    <Badge className="ml-2 bg-green-100 text-green-800 border-green-200">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Enabled
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="ml-2">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Disabled
                    </Badge>
                  )}
                </p>
                {mfaStatus?.enabled && mfaStatus.setup_date && (
                  <p className="text-sm text-muted-foreground">
                    Enabled on {new Date(mfaStatus.setup_date).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
            
            {!mfaStatus?.enabled ? (
              <Button onClick={() => setShowSetup(true)}>
                <Shield className="h-4 w-4 mr-2" />
                Enable 2FA
              </Button>
            ) : (
              <AlertDialog open={showDisableDialog} onOpenChange={setShowDisableDialog}>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <ShieldX className="h-4 w-4 mr-2" />
                    Disable 2FA
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Disable Two-Factor Authentication</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will remove the extra security layer from your account. You'll need to verify your identity to proceed.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="disable-code">Verification Code</Label>
                      <Input
                        id="disable-code"
                        placeholder={isRecoveryCode ? "XXXX-XXXX" : "000000"}
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        className={isRecoveryCode ? "font-mono" : "text-center tracking-widest"}
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="use-recovery"
                        checked={isRecoveryCode}
                        onChange={(e) => {
                          setIsRecoveryCode(e.target.checked);
                          setVerificationCode('');
                        }}
                      />
                      <Label htmlFor="use-recovery" className="text-sm">
                        Use recovery code instead
                      </Label>
                    </div>
                  </div>
                  
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => {
                      setVerificationCode('');
                      setIsRecoveryCode(false);
                    }}>
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={disableMFA}
                      disabled={actionLoading || !verificationCode.trim()}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {actionLoading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <ShieldX className="h-4 w-4 mr-2" />
                      )}
                      Disable 2FA
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>

          {/* Recovery Codes Section */}
          {mfaStatus?.enabled && (
            <>
              <Separator />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold flex items-center gap-2">
                      <Key className="h-4 w-4" />
                      Recovery Codes
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Use these codes to access your account if you lose your authenticator device
                    </p>
                  </div>
                  
                  <Badge variant="outline">
                    {mfaStatus.recovery_codes_count} remaining
                  </Badge>
                </div>
                
                <div className="flex gap-2">
                  <AlertDialog open={showRegenerateDialog} onOpenChange={setShowRegenerateDialog}>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Regenerate Codes
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Regenerate Recovery Codes</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will invalidate all existing recovery codes and generate new ones. Make sure to save the new codes securely.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      
                      <div className="space-y-2">
                        <Label htmlFor="regen-code">Authenticator Code</Label>
                        <Input
                          id="regen-code"
                          placeholder="000000"
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          maxLength={6}
                          className="text-center tracking-widest"
                        />
                        <p className="text-xs text-muted-foreground">
                          Enter the 6-digit code from your authenticator app
                        </p>
                      </div>
                      
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setVerificationCode('')}>
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={regenerateRecoveryCodes}
                          disabled={actionLoading || verificationCode.length !== 6}
                        >
                          {actionLoading ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <RefreshCw className="h-4 w-4 mr-2" />
                          )}
                          Regenerate
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  
                  {mfaStatus.recovery_codes_count <= 2 && (
                    <div className="flex items-center gap-2 text-amber-600">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm">Low recovery codes remaining</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* New Recovery Codes Dialog */}
      <Dialog open={newRecoveryCodes.length > 0} onOpenChange={() => setNewRecoveryCodes([])}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              New Recovery Codes
            </DialogTitle>
            <DialogDescription>
              Save these new recovery codes in a secure location. Each code can only be used once.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-2 font-mono text-sm">
              {newRecoveryCodes.map((code, index) => (
                <div key={index} className="p-2 bg-muted border rounded text-center">
                  {code}
                </div>
              ))}
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={copyRecoveryCodes} className="flex-1">
                <Copy className="h-3 w-3 mr-1" />
                Copy Codes
              </Button>
              <Button variant="outline" size="sm" onClick={downloadRecoveryCodes} className="flex-1">
                <Download className="h-3 w-3 mr-1" />
                Download
              </Button>
            </div>
            
            <Button onClick={() => setNewRecoveryCodes([])} className="w-full">
              I've Saved These Codes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};