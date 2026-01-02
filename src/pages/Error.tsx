import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, RefreshCw, AlertCircle, Shield } from "lucide-react";

interface ErrorPageProps {
  error?: Error;
  resetError?: () => void;
}

const Error = ({ error, resetError }: ErrorPageProps) => {
  const handleRetry = () => {
    if (resetError) {
      resetError();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="w-12 h-12 text-destructive" />
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight">
            Something went wrong
          </h1>
          <p className="text-muted-foreground text-lg">
            This is on us, not you. Your data is safe and nothing has been lost.
          </p>
        </div>

        {/* Data Safety Assurance */}
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg py-3 px-4">
          <Shield className="w-4 h-4 text-primary" />
          <span>Your progress and data are secure</span>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={handleRetry} size="lg" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
          <Button asChild variant="outline" size="lg" className="gap-2">
            <Link to="/dashboard">
              <Home className="w-4 h-4" />
              Go to Dashboard
            </Link>
          </Button>
        </div>

        {/* Subtle footer */}
        <p className="text-sm text-muted-foreground/60 pt-4">
          If this keeps happening, try refreshing the page or come back later.
        </p>
      </div>
    </div>
  );
};

export default Error;
