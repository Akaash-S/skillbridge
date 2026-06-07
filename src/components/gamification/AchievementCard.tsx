import { Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Achievement } from "@/services/gamificationService";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AchievementCardProps {
  achievements: Achievement[];
  className?: string;
}

export const AchievementCard = ({ achievements, className }: AchievementCardProps) => {
  const unlocked = achievements.filter(a => a.unlocked);
  const locked = achievements.filter(a => !a.unlocked);

  return (
    <Card className={cn("border-border/50 bg-card/50 backdrop-blur-sm", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <span className="flex items-center gap-2">
            🏆 Achievements
          </span>
          <span className="text-sm font-normal text-muted-foreground">
            {unlocked.length} / {achievements.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
          {/* Unlocked achievements first */}
          {unlocked.map((a) => (
            <Tooltip key={a.id}>
              <TooltipTrigger asChild>
                <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-primary/5 border border-primary/10 hover:border-primary/30 hover:shadow-md transition-all cursor-default group">
                  <span className="text-2xl group-hover:scale-110 transition-transform">{a.icon}</span>
                  <span className="text-[10px] font-medium text-center leading-tight truncate w-full">{a.title}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-[200px]">
                <p className="font-medium">{a.title}</p>
                <p className="text-xs text-muted-foreground">{a.description}</p>
                {a.unlockedAt && (
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Unlocked {new Date(a.unlockedAt).toLocaleDateString()}
                  </p>
                )}
              </TooltipContent>
            </Tooltip>
          ))}

          {/* Locked achievements */}
          {locked.map((a) => (
            <Tooltip key={a.id}>
              <TooltipTrigger asChild>
                <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-muted/30 border border-border/30 opacity-40 cursor-default">
                  <div className="relative">
                    <span className="text-2xl grayscale">{a.icon}</span>
                    <Lock className="h-3 w-3 absolute -bottom-0.5 -right-0.5 text-muted-foreground" />
                  </div>
                  <span className="text-[10px] font-medium text-center leading-tight text-muted-foreground truncate w-full">{a.title}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-[200px]">
                <p className="font-medium text-muted-foreground">{a.title}</p>
                <p className="text-xs text-muted-foreground">{a.description}</p>
                <p className="text-[10px] text-muted-foreground mt-1">🔒 Locked</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AchievementCard;
