import { Link } from "react-router-dom";
import { Target, Briefcase, BarChart3, BookOpen, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  { id: 1, path: "/skills", label: "Skills", icon: Target },
  { id: 2, path: "/roles", label: "Roles", icon: Briefcase },
  { id: 3, path: "/analysis", label: "Analysis", icon: BarChart3 },
  { id: 4, path: "/roadmap", label: "Roadmap", icon: BookOpen },
];

interface StepIndicatorProps {
  currentStep: 1 | 2 | 3 | 4;
}

export const StepIndicator = ({ currentStep }: StepIndicatorProps) => {
  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = step.id === currentStep;
          const isCompleted = step.id < currentStep;
          const isClickable = step.id <= currentStep;

          return (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                {isClickable ? (
                  <Link
                    to={step.path}
                    className={cn(
                      "h-10 w-10 rounded-full flex items-center justify-center transition-all",
                      isActive && "bg-primary text-primary-foreground shadow-lg scale-110",
                      isCompleted && "bg-accent text-accent-foreground",
                      !isActive && !isCompleted && "bg-muted text-muted-foreground"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </Link>
                ) : (
                  <div
                    className={cn(
                      "h-10 w-10 rounded-full flex items-center justify-center",
                      "bg-muted text-muted-foreground"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                )}
                <span
                  className={cn(
                    "text-xs mt-2 font-medium hidden sm:block",
                    isActive && "text-primary",
                    isCompleted && "text-accent",
                    !isActive && !isCompleted && "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-2 sm:mx-4 transition-colors",
                    isCompleted ? "bg-accent" : "bg-muted"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
