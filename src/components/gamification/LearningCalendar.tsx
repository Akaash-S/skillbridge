import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { CalendarData } from "@/services/gamificationService";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface LearningCalendarProps {
  data: CalendarData;
  className?: string;
}

const INTENSITY_COLORS = [
  "bg-muted/40",           // 0 — no activity
  "bg-emerald-500/30",     // 1 — low
  "bg-emerald-500/50",     // 2 — medium
  "bg-emerald-500/70",     // 3 — high
  "bg-emerald-500",        // 4+ — very high
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS = ["", "Mon", "", "Wed", "", "Fri", ""];

function getIntensityLevel(activities: number): number {
  if (activities === 0) return 0;
  if (activities <= 1) return 1;
  if (activities <= 3) return 2;
  if (activities <= 5) return 3;
  return 4;
}

export const LearningCalendar = ({ data = {}, className }: LearningCalendarProps) => {
  // Generate the last ~26 weeks of dates (6 months)
  const { weeks, monthLabels, totalActivities, activeDays } = useMemo(() => {
    const today = new Date();
    const weeksArr: string[][] = [];
    const monthLabelMap: Map<number, string> = new Map();

    // Go back ~26 weeks
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - (26 * 7) - startDate.getDay());

    let totalAct = 0;
    let activeCount = 0;

    const currentDate = new Date(startDate);
    let currentWeek: string[] = [];

    while (currentDate <= today) {
      const dateStr = currentDate.toISOString().split('T')[0];
      currentWeek.push(dateStr);

      const dayData = data?.[dateStr];
      if (dayData && dayData.activities > 0) {
        totalAct += dayData.activities;
        activeCount++;
      }

      // Track month boundaries for labels
      if (currentDate.getDate() <= 7 && currentWeek.length === 1) {
        monthLabelMap.set(weeksArr.length, MONTHS[currentDate.getMonth()]);
      }

      if (currentDate.getDay() === 6) {
        // End of week (Saturday)
        weeksArr.push(currentWeek);
        currentWeek = [];
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Push remaining partial week
    if (currentWeek.length > 0) {
      weeksArr.push(currentWeek);
    }

    return {
      weeks: weeksArr,
      monthLabels: monthLabelMap,
      totalActivities: totalAct,
      activeDays: activeCount,
    };
  }, [data]);

  return (
    <Card className={cn("border-border/50 bg-card/50 backdrop-blur-sm", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            📅 Learning Calendar
          </CardTitle>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>{activeDays} active days</span>
            <span>{totalActivities} total activities</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          {/* Month labels */}
          <div className="flex mb-1 ml-8">
            {weeks.map((_, weekIdx) => (
              <div key={weekIdx} className="w-[14px] mx-[1px] text-[10px] text-muted-foreground">
                {monthLabels.get(weekIdx) || ""}
              </div>
            ))}
          </div>

          <div className="flex gap-0">
            {/* Day labels */}
            <div className="flex flex-col mr-1.5 gap-[2px]">
              {DAYS.map((d, i) => (
                <div key={i} className="h-[14px] text-[10px] text-muted-foreground flex items-center justify-end pr-1 w-6">
                  {d}
                </div>
              ))}
            </div>

            {/* Heatmap grid */}
            <div className="flex gap-[2px]">
              {weeks.map((week, weekIdx) => (
                <div key={weekIdx} className="flex flex-col gap-[2px]">
                  {week.map((dateStr) => {
                    const dayData = data?.[dateStr];
                    const activities = dayData?.activities || 0;
                    const level = getIntensityLevel(activities);
                    const types = dayData?.types || [];
                    const dateObj = new Date(dateStr + 'T00:00:00');
                    const isToday = dateStr === new Date().toISOString().split('T')[0];

                    return (
                      <Tooltip key={dateStr}>
                        <TooltipTrigger asChild>
                          <div
                            className={cn(
                              "w-[14px] h-[14px] rounded-[3px] transition-colors cursor-default",
                              INTENSITY_COLORS[level],
                              isToday && "ring-1 ring-primary ring-offset-1 ring-offset-background"
                            )}
                          />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs">
                          <p className="font-medium">
                            {dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                          </p>
                          {activities > 0 ? (
                            <>
                              <p>{activities} {activities === 1 ? 'activity' : 'activities'}</p>
                              {types.length > 0 && (
                                <p className="text-muted-foreground capitalize">{types.join(', ')}</p>
                              )}
                            </>
                          ) : (
                            <p className="text-muted-foreground">No activity</p>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-2 mt-4 justify-end">
            <span className="text-[10px] text-muted-foreground">Less</span>
            {INTENSITY_COLORS.map((color, i) => (
              <div key={i} className={cn("w-[12px] h-[12px] rounded-[2px]", color)} />
            ))}
            <span className="text-[10px] text-muted-foreground">More</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LearningCalendar;
