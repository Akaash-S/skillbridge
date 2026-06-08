import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { 
  Flame, Trophy, Zap, Award, Sparkles, 
  ArrowRight, Loader2, AlertCircle, 
  CheckCircle2, Target, BookOpen, Star, Compass
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import apiClient from "@/services/apiClient";

interface PublicProfileData {
  profile: {
    name: string;
    avatar: string;
    targetRole: string;
    interests: string[];
    weeklyGoal: number;
  };
  stats: {
    skillsCount: number;
    skillsByLevel: {
      beginner: number;
      intermediate: number;
      advanced: number;
    };
    readinessScore: number;
    totalMilestones: number;
    completedMilestones: number;
    roadmapProgress: number;
  };
  gamification: {
    streak: {
      currentStreak: number;
      bestStreak: number;
      lastActivityDate: string | null;
    };
    xp: {
      totalXP: number;
      level: number;
      levelTitle: string;
      levelInfo: {
        level: number;
        title: string;
        nextLevel: number | null;
        nextTitle: string | null;
        nextLevelXP: number | null;
        currentLevelXP: number;
        progressToNext: number;
      };
      modulesCompleted: number;
      quizzesCompleted: number;
      roadmapsCompleted: number;
    };
    achievements: {
      unlocked: number;
      total: number;
    };
  };
}

export const PublicProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<PublicProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPublicProfile = async () => {
      if (!userId) return;
      try {
        setLoading(true);
        setError(null);
        // Using public request helper to bypass token checks
        const res = await apiClient.publicRequest<PublicProfileData>(`/users/public/${userId}`);
        setData(res);
      } catch (err: any) {
        console.error("❌ Failed to fetch public profile:", err);
        setError(err?.message || "Failed to load public profile. The link might be invalid or expired.");
      } finally {
        setLoading(false);
      }
    };

    fetchPublicProfile();
  }, [userId]);

  const getInitials = (name: string) => {
    return name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "U";
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground animate-pulse">
          Loading SkillBridge public profile...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-6">
        <div className="max-w-md w-full space-y-6 text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-2">
            <AlertCircle className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Profile Not Found</h1>
          <p className="text-sm text-muted-foreground">
            {error || "We couldn't retrieve this user's profile info."}
          </p>
          <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => navigate("/login")} className="w-full sm:w-auto">
              Go to Login
            </Button>
            <Button onClick={() => window.location.reload()} variant="outline" className="w-full sm:w-auto">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const { profile, stats, gamification } = data;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background/90 text-foreground py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Decorative background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[300px] bg-gradient-to-r from-primary/10 via-accent/5 to-transparent rounded-full blur-[100px] -z-10 pointer-events-none" />

        {/* Top Navbar Brand */}
        <div className="flex items-center justify-between border-b border-border/40 pb-5">
          <Link to="/" className="flex items-center gap-2">
            <img src="/skillbridge-logo-light.png" alt="SkillBridge Logo" className="h-8 w-8 rounded-full dark:hidden" />
            <img src="/skillbridge-logo-dark.png" alt="SkillBridge Logo" className="h-8 w-8 rounded-full hidden dark:block" />
            <span className="font-extrabold text-xl tracking-tight text-[#4169e1] dark:text-white">SkillBridge</span>
          </Link>
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-semibold py-1">
            Shared Achievement Profile
          </Badge>
        </div>

        {/* Hero Card */}
        <Card className="relative overflow-hidden bg-card/40 backdrop-blur-md border-primary/10 shadow-2xl p-6 md:p-8 rounded-3xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-8 -mt-8 pointer-events-none" />
          
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <Avatar className="h-24 w-24 md:h-28 md:w-28 border-4 border-primary/20 shadow-xl">
              <AvatarImage src={profile.avatar} alt={profile.name} />
              <AvatarFallback className="text-3xl bg-primary/10 text-primary font-bold">
                {getInitials(profile.name)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 text-center md:text-left space-y-3">
              <div>
                <h1 className="text-3xl font-black tracking-tight">{profile.name}</h1>
                <p className="text-base text-muted-foreground flex items-center justify-center md:justify-start gap-2 mt-1">
                  <Compass className="h-4 w-4 text-primary" /> Target Role: <span className="font-semibold text-foreground">{profile.targetRole}</span>
                </p>
              </div>

              <div className="flex flex-wrap gap-2 justify-center md:justify-start pt-1">
                {profile.interests.map((interest, idx) => (
                  <Badge key={idx} variant="secondary" className="bg-secondary/40 border border-border/50 text-xs px-2.5 py-0.5 rounded-md">
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 self-center md:self-start bg-primary/10 text-primary px-4 py-2 rounded-2xl border border-primary/20">
              <Star className="h-5 w-5 fill-primary text-primary" />
              <div>
                <p className="text-[10px] uppercase tracking-wider font-bold text-primary/80 leading-none">Overall Level</p>
                <p className="text-lg font-black leading-none mt-1">{gamification.xp.levelTitle} (Lvl {gamification.xp.level})</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Readiness Gauge */}
          <Card className="bg-card/30 backdrop-blur-sm border-border/50 rounded-2xl p-6 text-center flex flex-col justify-between items-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-4">
              <Award className="h-4 w-4 text-green-500" /> Job Readiness
            </h3>
            
            <div className="relative flex items-center justify-center w-36 h-36">
              {/* Circular Meter Background */}
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="stroke-muted"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="stroke-green-500 transition-all duration-1000 ease-out"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - stats.readinessScore / 100)}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-3xl font-black tracking-tight text-green-500">
                  {stats.readinessScore}%
                </span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">Ready</span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground mt-4 max-w-[200px]">
              Ready for {profile.targetRole} role requirements.
            </p>
          </Card>

          {/* Streak Flame */}
          <Card className="bg-card/30 backdrop-blur-sm border-border/50 rounded-2xl p-6 text-center flex flex-col justify-between items-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-4">
              <Flame className="h-4 w-4 text-orange-500 animate-bounce" /> Learning Streak
            </h3>

            <div className="my-auto py-2">
              <div className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 mb-3 relative">
                <Flame className="h-12 w-12 fill-orange-500/20" />
                <span className="absolute bottom-1 right-1 bg-orange-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                  ACTIVE
                </span>
              </div>
              <p className="text-3xl font-black text-orange-500">{gamification.streak.currentStreak} Days</p>
              <p className="text-xs text-muted-foreground mt-1">Best Streak: {gamification.streak.bestStreak} Days</p>
            </div>

            <p className="text-xs text-muted-foreground mt-4">
              Consistently learning new skills daily!
            </p>
          </Card>

          {/* XP & Level */}
          <Card className="bg-card/30 backdrop-blur-sm border-border/50 rounded-2xl p-6 text-center flex flex-col justify-between items-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-4">
              <Zap className="h-4 w-4 text-primary" /> Experience Points
            </h3>

            <div className="w-full space-y-4 my-auto">
              <div>
                <p className="text-4xl font-black text-primary">{gamification.xp.totalXP}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Total XP Earned</p>
              </div>

              {gamification.xp.levelInfo.nextLevel && (
                <div className="space-y-1.5 text-left px-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-muted-foreground">To Level {gamification.xp.levelInfo.nextLevel}</span>
                    <span className="text-foreground">{gamification.xp.levelInfo.progressToNext}%</span>
                  </div>
                  <Progress value={gamification.xp.levelInfo.progressToNext} className="h-2 bg-muted/50" />
                </div>
              )}
            </div>

            <p className="text-xs text-muted-foreground mt-4">
              Completed {gamification.xp.modulesCompleted} modules & {gamification.xp.quizzesCompleted} quizzes.
            </p>
          </Card>

        </div>

        {/* Milestone Timeline and Completed Skills Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          
          {/* Key Achievements List */}
          <Card className="md:col-span-3 bg-card/30 backdrop-blur-sm border border-border/50 rounded-2xl p-6">
            <CardHeader className="p-0 pb-5">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" /> Unlocked Badges ({gamification.achievements.unlocked})
              </CardTitle>
              <CardDescription>
                Milestones unlocked during their professional preparation journey.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="flex items-center gap-3 p-3 bg-muted/20 border border-border/30 rounded-xl">
                  <div className="h-10 w-10 bg-yellow-500/10 text-yellow-600 rounded-xl flex items-center justify-center border border-yellow-500/20">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">First Steps</h4>
                    <p className="text-[10px] text-muted-foreground">Complete first learning module</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-muted/20 border border-border/30 rounded-xl">
                  <div className="h-10 w-10 bg-yellow-500/10 text-yellow-600 rounded-xl flex items-center justify-center border border-yellow-500/20">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">Quiz Whiz</h4>
                    <p className="text-[10px] text-muted-foreground">Pass your first micro quiz</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-muted/20 border border-border/30 rounded-xl">
                  <div className="h-10 w-10 bg-yellow-500/10 text-yellow-600 rounded-xl flex items-center justify-center border border-yellow-500/20">
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">Perfect Score</h4>
                    <p className="text-[10px] text-muted-foreground">Score 100% on any quiz</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-muted/20 border border-border/30 rounded-xl">
                  <div className="h-10 w-10 bg-yellow-500/10 text-yellow-600 rounded-xl flex items-center justify-center border border-yellow-500/20">
                    <Zap className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">XP Hunter</h4>
                    <p className="text-[10px] text-muted-foreground">Earn 1,000 XP</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Learning Progress / Milestone Status */}
          <Card className="md:col-span-2 bg-card/30 backdrop-blur-sm border border-border/50 rounded-2xl p-6 flex flex-col justify-between">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Target className="h-4.5 w-4.5 text-primary" /> Roadmap Progress
              </CardTitle>
              <CardDescription>
                Progress through structured roadmap milestones.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 space-y-4">
              <div className="p-4 bg-muted/30 border border-border/30 rounded-xl text-center">
                <p className="text-4xl font-black text-primary">{stats.roadmapProgress}%</p>
                <p className="text-xs text-muted-foreground mt-1">Milestones Completed</p>
                <div className="mt-3 text-xs text-muted-foreground flex justify-between font-semibold px-2">
                  <span>{stats.completedMilestones} completed</span>
                  <span>{stats.totalMilestones} total milestones</span>
                </div>
              </div>
            </CardContent>
            
            <div className="border-t border-border/40 pt-4 mt-4 text-center">
              <Badge variant="outline" className="text-xs text-muted-foreground border-border/60">
                <BookOpen className="h-3.5 w-3.5 text-primary mr-1" />
                {stats.skillsCount} skills tracked on profile
              </Badge>
            </div>
          </Card>

        </div>

        {/* CTA Footer Banner */}
        <div className="p-6 md:p-8 bg-gradient-to-r from-primary/20 via-accent/10 to-transparent border border-primary/20 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-5 relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/20 rounded-full blur-2xl pointer-events-none" />
          <div className="space-y-1.5 text-center md:text-left z-10">
            <h3 className="text-xl font-bold flex items-center justify-center md:justify-start gap-2">
              Want to build your own learning path? <Sparkles className="h-5 w-5 text-yellow-500 animate-pulse" />
            </h3>
            <p className="text-sm text-muted-foreground">
              Map your existing skills, close gap deficits, and complete tailored roadmaps.
            </p>
          </div>
          <Button onClick={() => navigate("/login")} className="gap-2 z-10 w-full md:w-auto font-bold py-5 rounded-xl shadow-xl shadow-primary/10">
            Join SkillBridge <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

      </div>
    </div>
  );
};

export default PublicProfile;
