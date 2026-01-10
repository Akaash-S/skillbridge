import { AlertCircle, RefreshCw, Shield, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState, useEffect } from "react";
import { runBrowserDiagnostics, type BrowserDiagnostics } from "@/utils/browserDiagnostics";

interface AuthErrorHandlerProps {
  error: string;
  onRetry: () => void;
  onUseRedirect: () => void;
}

export const AuthErrorHandler = ({ error, onRetry, onUseRedirect }: AuthErrorHandlerProps) => {
  const [diagnostics, setDiagnostics] = useState<BrowserDiagnostics | null>(null);
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  useEffect(() => {
    // Run diagnostics when component mounts
    const browserDiagnostics = runBrowserDiagnostics();
    setDiagnostics(browserDiagnostics);
  }, []);

  const isCOOPError = error.includes('Cross-Origin-Opener-Policy') || error.includes('window.close');
  const isCOEPError = error.includes('Cross-Origin-Embedder-Policy') || error.includes('COEP');
  const isCORPError = error.includes('Cross-Origin-Resource-Policy') || error.includes('CORP');
  const isPopupError = error.includes('popup') || error.includes('blocked');
  const isExtensionError = error.includes('extension') || error.includes('Extension');
  const isSecurityPolicyError = isCOOPError || isCOEPError || isCORPError;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertCircle className="h-6 w-6 text-destructive" />
        </div>
        <CardTitle>Authentication Issue</CardTitle>
        <CardDescription>
          We encountered a problem during sign-in
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isCOOPError && (
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Your browser's Cross-Origin-Opener-Policy is blocking the authentication popup. 
              This is often caused by browser extensions or strict security settings.
            </AlertDescription>
          </Alert>
        )}

        {(isCOEPError || isCORPError) && (
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Browser security policies (COEP/CORP) are blocking Firebase authentication resources. 
              The redirect method should work around this issue.
            </AlertDescription>
          </Alert>
        )}
        
        {isPopupError && !isSecurityPolicyError && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              The authentication popup was blocked or closed. 
              Please allow popups for this site or try the redirect method.
            </AlertDescription>
          </Alert>
        )}
        
        {isExtensionError && (
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              A browser extension may be interfering with authentication. 
              Try disabling extensions or using incognito mode.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-2">
          <Button onClick={onRetry} className="w-full" variant="default">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
          
          <Button onClick={onUseRedirect} className="w-full" variant="outline">
            Use Redirect Method
          </Button>
        </div>
        
        <div className="text-xs text-muted-foreground text-center space-y-2">
          <Collapsible open={showDiagnostics} onOpenChange={setShowDiagnostics}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="text-xs">
                <Info className="h-3 w-3 mr-1" />
                {showDiagnostics ? 'Hide' : 'Show'} Browser Diagnostics
              </Button>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="space-y-2 mt-2">
              {diagnostics && (
                <div className="text-left space-y-1 p-2 bg-muted/50 rounded text-xs">
                  <div className="font-medium">Browser Status:</div>
                  <div>Extensions: {diagnostics.hasExtensions ? '⚠️ Detected' : '✅ None'}</div>
                  <div>Popups: {diagnostics.popupsBlocked ? '❌ Blocked' : '✅ Allowed'}</div>
                  <div>Cookies: {diagnostics.cookiesEnabled ? '✅ Enabled' : '❌ Disabled'}</div>
                  <div>Storage: {diagnostics.localStorageEnabled ? '✅ Enabled' : '❌ Disabled'}</div>
                  <div>Security Policies: {diagnostics.hasSecurityPolicies ? '⚠️ Strict' : '✅ Normal'}</div>
                  
                  {diagnostics.recommendations.length > 0 && (
                    <div className="mt-2">
                      <div className="font-medium">Recommendations:</div>
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        {diagnostics.recommendations.slice(0, 3).map((rec, index) => (
                          <li key={index}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
          
          <div className="space-y-1">
            <p>If problems persist:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Try using incognito/private mode</li>
              <li>Clear browser cache and cookies</li>
              <li>Contact support if issue continues</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};