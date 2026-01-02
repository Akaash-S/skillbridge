import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Compass } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
              <Compass className="w-12 h-12 text-muted-foreground" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-lg">?</span>
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight">
            This page doesn't exist
          </h1>
          <p className="text-muted-foreground text-lg">
            The page you're looking for may have moved or never existed. 
            Let's get you back on track.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild size="lg" className="gap-2">
            <Link to="/dashboard">
              <Home className="w-4 h-4" />
              Go to Dashboard
            </Link>
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="gap-2"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </Button>
        </div>

        {/* Subtle footer */}
        <p className="text-sm text-muted-foreground/60 pt-4">
          Need help? Visit our{" "}
          <Link to="/help" className="text-primary hover:underline">
            Help Center
          </Link>
        </p>
      </div>
    </div>
  );
};

export default NotFound;
