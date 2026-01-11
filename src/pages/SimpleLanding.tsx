import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const SimpleLanding = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6 p-8">
        <h1 className="text-4xl font-bold">SkillBridge</h1>
        <p className="text-xl text-muted-foreground">
          Bridge the gap to your dream career
        </p>
        <div className="space-y-4">
          <Link to="/login">
            <Button size="lg" className="w-full">
              Get Started
            </Button>
          </Link>
          <div className="text-sm text-muted-foreground">
            Simple landing page for testing
          </div>
        </div>
      </div>
    </div>
  );
};