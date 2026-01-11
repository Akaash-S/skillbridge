import { CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

interface CompletionMessageProps {
  isCompleted: boolean;
  className?: string;
}

export const CompletionMessage = ({ isCompleted, className }: CompletionMessageProps) => {
  if (!isCompleted) return null;
  
  return (
    <Alert className={cn("border-green-200 bg-green-50 dark:bg-green-950", className)}>
      <CheckCircle2 className="h-4 w-4 text-green-600" />
      <AlertDescription className="text-green-800 dark:text-green-200">
        🎉 Roadmap completed successfully! Congratulations! You have completed all roadmap items.
      </AlertDescription>
    </Alert>
  );
};