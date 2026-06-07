import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface StreakBadgeProps {
  currentStreak: number;
  bestStreak: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const StreakBadge = ({ currentStreak, bestStreak, size = "md", className }: StreakBadgeProps) => {
  const sizeMap = {
    sm: { icon: "h-4 w-4", text: "text-sm", padding: "px-2 py-1" },
    md: { icon: "h-5 w-5", text: "text-base", padding: "px-3 py-1.5" },
    lg: { icon: "h-6 w-6", text: "text-lg", padding: "px-4 py-2" },
  };

  const s = sizeMap[size];
  const isActive = currentStreak > 0;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full font-semibold transition-all",
            s.padding, s.text,
            isActive
              ? "bg-orange-500/10 text-orange-500 border border-orange-500/20 shadow-sm shadow-orange-500/5"
              : "bg-muted text-muted-foreground border border-border/50",
            className
          )}
        >
          <Flame className={cn(s.icon, isActive && "animate-pulse")} />
          <span>{currentStreak}</span>
        </div>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <div className="text-center">
          <p className="font-medium">🔥 {currentStreak} Day Streak</p>
          <p className="text-xs text-muted-foreground">Best: {bestStreak} days</p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
};

export default StreakBadge;
