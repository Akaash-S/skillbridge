import { CheckCircle2, Lock, PlayCircle, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface TimelineModule {
  title: string;
  skills: string[];
  completed: boolean;
  quizPassed: boolean;
  unlocked: boolean;
  description?: string;
}

interface MilestoneTimelineProps {
  modules: TimelineModule[];
  className?: string;
}

export const MilestoneTimeline = ({ modules, className }: MilestoneTimelineProps) => {
  if (!modules || modules.length === 0) {
    return null;
  }

  return (
    <Card className={cn("border-border/50 bg-card/50 backdrop-blur-sm", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          🗺️ Milestone Timeline
        </CardTitle>
      </CardHeader>
      <CardContent className="relative pl-6 sm:pl-8">
        {/* Vertical Line */}
        <div className="absolute left-[29px] sm:left-[37px] top-6 bottom-6 w-0.5 bg-border/60" />

        <div className="space-y-8">
          {modules.map((module, idx) => {
            const isCompleted = module.completed && module.quizPassed;
            const isCurrent = module.unlocked && !isCompleted;
            const isUpcoming = !module.unlocked;

            return (
              <div key={idx} className="relative flex gap-4 sm:gap-6 items-start group">
                {/* Milestone Node */}
                <div className="relative z-10 flex items-center justify-center">
                  {isCompleted ? (
                    <div className="h-7 w-7 sm:h-9 sm:w-9 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md border-2 border-background">
                      <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                  ) : isCurrent ? (
                    <div className="h-7 w-7 sm:h-9 sm:w-9 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/20 border-2 border-background animate-pulse">
                      <PlayCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                  ) : (
                    <div className="h-7 w-7 sm:h-9 sm:w-9 rounded-full bg-muted border border-border text-muted-foreground flex items-center justify-center">
                      <Lock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </div>
                  )}
                </div>

                {/* Milestone Details */}
                <div className={cn(
                  "flex-1 p-4 rounded-xl border transition-all duration-300",
                  isCompleted && "bg-emerald-500/5 border-emerald-500/10 hover:border-emerald-500/20",
                  isCurrent && "bg-blue-500/5 border-blue-500/20 hover:border-blue-500/30 shadow-sm shadow-blue-500/5",
                  isUpcoming && "bg-muted/10 border-border/30 opacity-60"
                )}>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Module {idx + 1}
                    </span>
                    {isCompleted && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600">
                        <CheckCircle2 className="h-3 w-3" /> Completed
                      </span>
                    )}
                    {isCurrent && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 animate-pulse">
                        <PlayCircle className="h-3 w-3" /> In Progress
                      </span>
                    )}
                    {isUpcoming && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted border text-muted-foreground">
                        Locked
                      </span>
                    )}
                  </div>

                  <h4 className={cn(
                    "text-sm font-semibold tracking-tight transition-colors",
                    isCompleted && "text-foreground/90",
                    isCurrent && "text-primary",
                    isUpcoming && "text-muted-foreground"
                  )}>
                    {module.title}
                  </h4>

                  {/* Skills tags */}
                  {module.skills && module.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {module.skills.map((skill, sIdx) => (
                        <span
                          key={sIdx}
                          className={cn(
                            "text-[10px] px-2 py-0.5 rounded-md font-medium",
                            isCompleted && "bg-emerald-500/10 text-emerald-700/80 border border-emerald-500/10",
                            isCurrent && "bg-primary/5 text-primary border border-primary/10",
                            isUpcoming && "bg-muted/40 text-muted-foreground/80 border border-border/20"
                          )}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default MilestoneTimeline;
