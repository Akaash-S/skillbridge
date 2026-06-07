import { Zap, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { XPData } from "@/services/gamificationService";

interface XPCardProps {
  data: XPData;
  compact?: boolean;
  className?: string;
}

const LEVEL_COLORS: Record<number, string> = {
  1: "from-slate-400 to-slate-500",
  2: "from-emerald-400 to-emerald-600",
  3: "from-blue-400 to-blue-600",
  4: "from-purple-400 to-purple-600",
  5: "from-amber-400 to-amber-600",
  6: "from-rose-400 to-rose-600",
};

export const XPCard = ({ data, compact = false, className }: XPCardProps) => {
  const { totalXP, levelInfo, weeklyXP, monthlyXP } = data;
  const gradientClass = LEVEL_COLORS[levelInfo.level] || LEVEL_COLORS[1];

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className={cn("h-8 w-8 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-xs font-bold shadow-sm", gradientClass)}>
          {levelInfo.level}
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-medium text-muted-foreground">{levelInfo.title}</span>
          <span className="text-sm font-semibold">{totalXP.toLocaleString()} XP</span>
        </div>
      </div>
    );
  }

  return (
    <Card className={cn("border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-500" />
          Experience Points
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Level badge + total XP */}
        <div className="flex items-center gap-4">
          <div className={cn(
            "h-16 w-16 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white text-2xl font-bold shadow-lg",
            gradientClass
          )}>
            {levelInfo.level}
          </div>
          <div>
            <p className="text-2xl font-bold">{totalXP.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">XP</span></p>
            <p className="text-sm font-medium text-muted-foreground">{levelInfo.title}</p>
          </div>
        </div>

        {/* Progress to next level */}
        {levelInfo.nextLevel && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Level {levelInfo.level}</span>
              <span>Level {levelInfo.nextLevel} — {levelInfo.nextTitle}</span>
            </div>
            <div className="h-2.5 bg-muted rounded-full overflow-hidden">
              <div
                className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-700 ease-out", gradientClass)}
                style={{ width: `${levelInfo.progressToNext}%` }}
              />
            </div>
            <p className="text-xs text-center text-muted-foreground">
              {levelInfo.nextLevelXP! - totalXP} XP to next level
            </p>
          </div>
        )}

        {/* Weekly / Monthly stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 bg-muted/30 rounded-lg p-3">
            <TrendingUp className="h-4 w-4 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">This Week</p>
              <p className="text-sm font-semibold">{weeklyXP.toLocaleString()} XP</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-muted/30 rounded-lg p-3">
            <TrendingUp className="h-4 w-4 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">This Month</p>
              <p className="text-sm font-semibold">{monthlyXP.toLocaleString()} XP</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default XPCard;
