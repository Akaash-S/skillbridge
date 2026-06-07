import { Flame, Trophy, Zap, Award, Sparkles } from "lucide-react";
import type { MotivationDashboard as DashboardDataType } from "@/services/gamificationService";
import { StreakBadge } from "./StreakBadge";
import { XPCard } from "./XPCard";
import { AchievementCard } from "./AchievementCard";
import { LearningCalendar } from "./LearningCalendar";
import { MilestoneTimeline, TimelineModule } from "./MilestoneTimeline";
import { cn } from "@/lib/utils";

interface MotivationDashboardProps {
  data: DashboardDataType;
  roadmapModules?: TimelineModule[];
  className?: string;
}

export const MotivationDashboard = ({ data, roadmapModules = [], className }: MotivationDashboardProps) => {
  const streak = data?.streak || { currentStreak: 0, bestStreak: 0, lastActivityDate: null };
  const xp = data?.xp || { 
    totalXP: 0, weeklyXP: 0, monthlyXP: 0, 
    levelInfo: { level: 1, title: 'Beginner', currentLevelXP: 0, progressToNext: 0, nextLevel: null, nextTitle: null, nextLevelXP: null },
    modulesCompleted: 0, quizzesCompleted: 0, roadmapsCompleted: 0 
  };
  const achievements = data?.achievements || [];
  const achievementsSummary = data?.achievementsSummary || { unlocked: 0, total: 0 };
  const calendarData = data?.calendar || {};

  return (
    <div className={cn("space-y-6 max-w-7xl mx-auto p-4 md:p-6", className)}>
      {/* Top Banner / Welcome Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 rounded-2xl border border-primary/10 backdrop-blur-sm">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Motivation Engine <Sparkles className="h-6 w-6 text-yellow-500 animate-pulse" />
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Keep up the consistency! Complete modules, pass quizzes, and level up your skills.
          </p>
        </div>
        <div className="flex items-center gap-3 self-start md:self-center">
          <StreakBadge currentStreak={streak.currentStreak} bestStreak={streak.bestStreak} size="lg" />
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 text-yellow-600 border border-yellow-500/20 font-semibold text-sm">
            <Trophy className="h-4 w-4" />
            <span>{achievementsSummary.unlocked} / {achievementsSummary.total} Unlocked</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Side Stats, Right Side Milestone */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: XP and Heatmap Calendar, Achievements */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* XP Card */}
            <XPCard data={xp} className="h-full" />
            
            {/* Quick Stats Summary */}
            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 flex flex-col justify-between space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Award className="h-4 w-4 text-primary" /> Learning Stats
              </h3>
              <div className="grid grid-cols-2 gap-4 my-auto">
                <div className="p-3 bg-muted/30 rounded-lg text-center">
                  <p className="text-2xl font-bold text-foreground">{xp.modulesCompleted || 0}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Modules Completed</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg text-center">
                  <p className="text-2xl font-bold text-foreground">{xp.quizzesCompleted || 0}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Quizzes Passed</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg text-center col-span-2">
                  <p className="text-2xl font-bold text-foreground flex items-center justify-center gap-1">
                    <span>{streak.currentStreak}</span>
                    <span className="text-sm font-normal text-muted-foreground">/ {streak.bestStreak} best</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">Day Streak</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center italic">
                {streak.currentStreak > 0 
                  ? "🔥 Keep your streak alive! Learn something today."
                  : "🚀 Complete a module or pass a quiz today to start a streak!"
                }
              </p>
            </div>
          </div>

          {/* Calendar Heatmap */}
          <LearningCalendar data={calendarData} />

          {/* Achievements Grid */}
          <AchievementCard achievements={achievements} />
        </div>

        {/* Right Column: Milestone Timeline */}
        <div className="space-y-6">
          {roadmapModules && roadmapModules.length > 0 ? (
            <MilestoneTimeline modules={roadmapModules} className="h-full" />
          ) : (
            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 text-center text-muted-foreground py-12">
              <Trophy className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
              <p className="text-sm font-medium">No active roadmap modules found.</p>
              <p className="text-xs mt-1">Select a role in the Roles tab to build your learning path.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MotivationDashboard;
