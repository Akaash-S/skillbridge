import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { useAppData } from "@/context/AppDataContext";
import { BarChart3, TrendingUp, Target, Clock, Zap, Award, Calendar, Loader2 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar } from "recharts";
import { useEffect, useState } from "react";
import { apiClient } from "@/services/apiClient";
import { toast } from "@/hooks/use-toast";

interface UserStats {
  skillsCount: number;
  skillsByLevel: {
    beginner: number;
    intermediate: number;
    advanced: number;
  };
  roadmapProgress: number;
  totalMilestones: number;
  completedMilestones: number;
  recentActivityCount: number;
}

interface ActivitySummary {
  totalActivities: number;
  activityCounts: Record<string, number>;
  dailyCounts: Record<string, number>;
  latestActivities: any[];
  dateRange: {
    days: number;
    from: string;
    to: string;
  };
}

export const Insights = () => {
  const { userSkills, selectedRole, roadmap, roadmapProgress, loadRoadmapProgress } = useAppData();
  const { isAuthenticated } = useAuth();
  
  // State for real user data
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [activitySummary, setActivitySummary] = useState<ActivitySummary | null>(null);
  const [loading, setLoading] = useState(false);

  // Load user statistics and activity data
  const loadUserInsights = async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    try {
      
      // Load user stats and activity summary in parallel
      const [statsResponse, activityResponse] = await Promise.all([
        apiClient.get('/users/stats'),
        apiClient.get('/activity?days=30') // Last 30 days
      ]);
      
      setUserStats(statsResponse.stats);
      
      // Process activity data for summary
      const activities = activityResponse.activities || [];
      const activityCounts: Record<string, number> = {};
      const dailyCounts: Record<string, number> = {};
      
      activities.forEach((activity: any) => {
        const type = activity.type || 'UNKNOWN';
        activityCounts[type] = (activityCounts[type] || 0) + 1;
        
        if (activity.createdAt) {
          const date = new Date(activity.createdAt).toISOString().split('T')[0];
          dailyCounts[date] = (dailyCounts[date] || 0) + 1;
        }
      });
      
      setActivitySummary({
        totalActivities: activities.length,
        activityCounts,
        dailyCounts,
        latestActivities: activities.slice(0, 10),
        dateRange: {
          days: 30,
          from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          to: new Date().toISOString()
        }
      });
      
      
    } catch (error) {
      console.error('❌ Failed to load user insights:', error);
      toast({
        title: "Error",
        description: "Failed to load insights data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount and when authentication changes
  useEffect(() => {
    loadUserInsights();
    loadRoadmapProgress();
  }, [isAuthenticated, loadRoadmapProgress]);

  // Generate skill growth data based on activity
  const generateSkillGrowthData = () => {
    if (!activitySummary || !userStats) {
      return [
        { month: "Jan", skills: 0, hours: 0 },
        { month: "Feb", skills: 1, hours: 10 },
        { month: "Mar", skills: 2, hours: 25 },
        { month: "Apr", skills: 4, hours: 40 },
        { month: "May", skills: 6, hours: 55 },
        { month: "Jun", skills: userStats?.skillsCount || userSkills.length, hours: 70 },
      ];
    }
    
    // Create growth data based on skill additions over time
    const skillAdditions = activitySummary.activityCounts['SKILL_ADDED'] || 0;
    const currentSkills = userStats.skillsCount;
    const estimatedHours = currentSkills * 12; // Estimate 12 hours per skill
    
    return [
      { month: "Jan", skills: Math.max(0, currentSkills - 5), hours: Math.max(0, estimatedHours - 60) },
      { month: "Feb", skills: Math.max(0, currentSkills - 4), hours: Math.max(0, estimatedHours - 48) },
      { month: "Mar", skills: Math.max(0, currentSkills - 3), hours: Math.max(0, estimatedHours - 36) },
      { month: "Apr", skills: Math.max(0, currentSkills - 2), hours: Math.max(0, estimatedHours - 24) },
      { month: "May", skills: Math.max(0, currentSkills - 1), hours: Math.max(0, estimatedHours - 12) },
      { month: "Jun", skills: currentSkills, hours: estimatedHours },
    ];
  };

  // Generate category strengths based on user skills
  const generateCategoryStrengths = () => {
    if (!userSkills.length) {
      return [
        { category: "Frontend", score: 20 },
        { category: "Backend", score: 15 },
        { category: "Database", score: 10 },
        { category: "DevOps", score: 5 },
        { category: "Soft Skills", score: 25 },
        { category: "Data Science", score: 8 },
      ];
    }
    
    // Categorize skills and calculate scores
    const categories: Record<string, number> = {
      "Frontend": 0,
      "Backend": 0,
      "Database": 0,
      "DevOps": 0,
      "Soft Skills": 0,
      "Data Science": 0
    };
    
    userSkills.forEach(skill => {
      const skillName = skill.name.toLowerCase();
      const proficiencyScore = skill.proficiency === 'advanced' ? 3 : skill.proficiency === 'intermediate' ? 2 : 1;
      
      if (skillName.includes('react') || skillName.includes('vue') || skillName.includes('angular') || skillName.includes('html') || skillName.includes('css')) {
        categories["Frontend"] += proficiencyScore;
      } else if (skillName.includes('node') || skillName.includes('python') || skillName.includes('java') || skillName.includes('api')) {
        categories["Backend"] += proficiencyScore;
      } else if (skillName.includes('sql') || skillName.includes('database') || skillName.includes('mongo')) {
        categories["Database"] += proficiencyScore;
      } else if (skillName.includes('docker') || skillName.includes('aws') || skillName.includes('devops')) {
        categories["DevOps"] += proficiencyScore;
      } else if (skillName.includes('communication') || skillName.includes('leadership') || skillName.includes('management')) {
        categories["Soft Skills"] += proficiencyScore;
      } else if (skillName.includes('data') || skillName.includes('analytics') || skillName.includes('machine learning')) {
        categories["Data Science"] += proficiencyScore;
      } else {
        categories["Frontend"] += proficiencyScore * 0.5; // Default to frontend
      }
    });
    
    // Convert to percentage scores
    const maxScore = Math.max(...Object.values(categories), 1);
    return Object.entries(categories).map(([category, score]) => ({
      category,
      score: Math.round((score / maxScore) * 100)
    }));
  };

  // Generate weekly progress from activity data
  const generateWeeklyProgress = () => {
    if (!activitySummary) {
      return [
        { day: "Mon", hours: 1.5 },
        { day: "Tue", hours: 2 },
        { day: "Wed", hours: 1 },
        { day: "Thu", hours: 2.5 },
        { day: "Fri", hours: 1.5 },
        { day: "Sat", hours: 3 },
        { day: "Sun", hours: 2 },
      ];
    }
    
    // Get last 7 days of activity
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weeklyData = days.map(day => ({ day, hours: 0 }));
    
    // Calculate hours based on activity (estimate 0.5 hours per activity)
    Object.entries(activitySummary.dailyCounts).forEach(([date, count]) => {
      const dayOfWeek = new Date(date).getDay();
      weeklyData[dayOfWeek].hours += count * 0.5;
    });
    
    return weeklyData;
  };

  const skillGrowthData = generateSkillGrowthData();
  const categoryStrengths = generateCategoryStrengths();
  const weeklyProgress = generateWeeklyProgress();

  const insights = [
    { 
      icon: TrendingUp, 
      title: roadmapProgress?.hasRoadmap ? "Roadmap Progress" : "Skill Growth", 
      description: roadmapProgress?.hasRoadmap 
        ? `${roadmapProgress.progress.overall.skillProgress}% of roadmap completed`
        : `You've added ${userStats?.skillsCount || userSkills.length} skills to your profile`, 
      color: "text-accent" 
    },
    { 
      icon: Target, 
      title: "Skills Mastered", 
      description: userStats 
        ? `${userStats.skillsByLevel.advanced} advanced, ${userStats.skillsByLevel.intermediate} intermediate skills`
        : `${userSkills.filter(s => s.proficiency === 'advanced').length} advanced skills mastered`, 
      color: "text-primary" 
    },
    { 
      icon: Clock, 
      title: "Learning Activity", 
      description: activitySummary 
        ? `${activitySummary.totalActivities} activities in the last 30 days`
        : "Stay consistent with your learning journey", 
      color: "text-warning" 
    },
    { 
      icon: Award, 
      title: "Milestones", 
      description: userStats 
        ? `${userStats.completedMilestones} of ${userStats.totalMilestones} milestones completed`
        : roadmap.filter(r => r.completed).length > 0 
          ? `${roadmap.filter(r => r.completed).length} roadmap items completed`
          : "Start your learning roadmap to track milestones", 
      color: "text-info" 
    },
  ];

  const completedRoadmapItems = userStats?.completedMilestones || roadmap.filter(r => r.completed).length;
  const totalLearningHours = userStats ? userStats.skillsCount * 15 : skillGrowthData.reduce((acc, d) => acc + d.hours, 0);
  const currentStreak = activitySummary ? Math.min(Object.keys(activitySummary.dailyCounts).length, 7) : 3;

  // Create difficulty distribution chart from real data
  const difficultyData = roadmapProgress?.hasRoadmap 
    ? Object.entries(roadmapProgress.progress.byDifficulty).map(([difficulty, stats]: [string, any]) => ({
        difficulty: difficulty.charAt(0).toUpperCase() + difficulty.slice(1),
        completed: stats.completed,
        total: stats.total,
        percentage: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0
      }))
    : userStats 
      ? [
          { difficulty: "Beginner", completed: userStats.skillsByLevel.beginner, total: userStats.skillsByLevel.beginner + 2, percentage: Math.round((userStats.skillsByLevel.beginner / (userStats.skillsByLevel.beginner + 2)) * 100) },
          { difficulty: "Intermediate", completed: userStats.skillsByLevel.intermediate, total: userStats.skillsByLevel.intermediate + 1, percentage: Math.round((userStats.skillsByLevel.intermediate / (userStats.skillsByLevel.intermediate + 1)) * 100) },
          { difficulty: "Advanced", completed: userStats.skillsByLevel.advanced, total: userStats.skillsByLevel.advanced + 3, percentage: Math.round((userStats.skillsByLevel.advanced / (userStats.skillsByLevel.advanced + 3)) * 100) }
        ]
      : [
          { difficulty: "Beginner", completed: 3, total: 5, percentage: 60 },
          { difficulty: "Intermediate", completed: 2, total: 4, percentage: 50 },
          { difficulty: "Advanced", completed: 1, total: 3, percentage: 33 }
        ];

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <h3 className="text-lg font-semibold mb-2">Loading Insights</h3>
            <p className="text-muted-foreground">Analyzing your learning data...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Career Insights</h1>
              <p className="text-muted-foreground">Analytics and progress tracking</p>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{userStats?.skillsCount || userSkills.length}</div>
                <p className="text-sm text-muted-foreground">Total Skills</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-accent">{totalLearningHours}</div>
                <p className="text-sm text-muted-foreground">Hours Invested</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-warning">{completedRoadmapItems}</div>
                <p className="text-sm text-muted-foreground">Items Completed</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-info">{currentStreak}</div>
                <p className="text-sm text-muted-foreground">Day Streak</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Insight Cards */}
        <div className="grid md:grid-cols-4 gap-4">
          {insights.map((insight, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <insight.icon className={`h-5 w-5 ${insight.color}`} />
                  <div>
                    <h4 className="font-medium">{insight.title}</h4>
                    <p className="text-sm text-muted-foreground">{insight.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Skill Growth Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Skill Growth Trend</CardTitle>
              <CardDescription>Your skill acquisition over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={skillGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="skills" 
                      stroke="hsl(var(--primary))" 
                      fill="hsl(var(--primary)/0.2)" 
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Roadmap Progress by Difficulty */}
          <Card>
            <CardHeader>
              <CardTitle>Progress by Difficulty</CardTitle>
              <CardDescription>
                {roadmapProgress?.hasRoadmap 
                  ? "Your roadmap progress breakdown" 
                  : "Your skill distribution by category"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {roadmapProgress?.hasRoadmap ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={difficultyData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis type="number" className="text-xs" />
                      <YAxis type="category" dataKey="difficulty" className="text-xs" width={80} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                        formatter={(value, name) => [
                          name === 'completed' ? `${value} completed` : `${value} total`,
                          name === 'completed' ? 'Completed' : 'Total'
                        ]}
                      />
                      <Bar dataKey="total" fill="hsl(var(--muted))" radius={[0, 4, 4, 0]} />
                      <Bar dataKey="completed" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={categoryStrengths}>
                      <PolarGrid className="stroke-muted" />
                      <PolarAngleAxis dataKey="category" className="text-xs" />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} className="text-xs" />
                      <Radar 
                        name="Strength" 
                        dataKey="score" 
                        stroke="hsl(var(--primary))" 
                        fill="hsl(var(--primary)/0.3)" 
                        fillOpacity={0.6} 
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Weekly Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Weekly Learning Progress
            </CardTitle>
            <CardDescription>Hours spent learning this week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyProgress}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="day" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                  <Bar 
                    dataKey="hours" 
                    fill="hsl(var(--accent))" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Report */}
        <Card>
          <CardHeader>
            <CardTitle>Learning Progress Report</CardTitle>
            <CardDescription>
              {roadmapProgress?.hasRoadmap 
                ? "Summary of your roadmap progress" 
                : "Summary of your learning journey this month"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h4 className="font-medium">Recent Achievements</h4>
                {userStats && activitySummary ? (
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-warning" />
                      Added {activitySummary.activityCounts['SKILL_ADDED'] || 0} new skills
                    </li>
                    <li className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-warning" />
                      Completed {activitySummary.activityCounts['ROADMAP_PROGRESS'] || 0} roadmap items
                    </li>
                    <li className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-warning" />
                      {activitySummary.totalActivities} total activities this month
                    </li>
                  </ul>
                ) : roadmapProgress?.hasRoadmap && roadmapProgress.progress.recentActivity?.length > 0 ? (
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {roadmapProgress.progress.recentActivity.slice(0, 3).map((activity: any, index: number) => (
                      <li key={index} className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-warning" />
                        Completed {activity.skillName}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-warning" />
                      Added {userSkills.length} skills to profile
                    </li>
                    <li className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-warning" />
                      Completed skill assessment
                    </li>
                    <li className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-warning" />
                      Started learning journey
                    </li>
                  </ul>
                )}
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Areas to Focus</h4>
                {userStats ? (
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {userStats.skillsByLevel.beginner > 0 && (
                      <li className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-primary" />
                        Improve {userStats.skillsByLevel.beginner} beginner skills
                      </li>
                    )}
                    {userStats.skillsByLevel.intermediate > 0 && (
                      <li className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-primary" />
                        Advance {userStats.skillsByLevel.intermediate} intermediate skills
                      </li>
                    )}
                    {selectedRole && (
                      <li className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-primary" />
                        Focus on {selectedRole.title} requirements
                      </li>
                    )}
                  </ul>
                ) : roadmapProgress?.hasRoadmap ? (
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {Object.entries(roadmapProgress.progress.byDifficulty)
                      .filter(([_, stats]: [string, any]) => stats.total > stats.completed)
                      .slice(0, 3)
                      .map(([difficulty, stats]: [string, any], index: number) => (
                        <li key={index} className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-primary" />
                          {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} skills ({stats.total - stats.completed} remaining)
                        </li>
                      ))}
                  </ul>
                ) : (
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-primary" />
                      Backend development
                    </li>
                    <li className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-primary" />
                      Database management
                    </li>
                    <li className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-primary" />
                      DevOps basics
                    </li>
                  </ul>
                )}
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Next Milestones</h4>
                {roadmapProgress?.hasRoadmap ? (
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-accent" />
                      Complete {roadmapProgress.progress.overall.remainingSkills} remaining skills
                    </li>
                    <li className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-accent" />
                      Finish in ~{roadmapProgress.progress.timeEstimate.estimatedWeeksRemaining} weeks
                    </li>
                    <li className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-accent" />
                      Reach {roadmapProgress.progress.overall.totalMilestones - roadmapProgress.progress.overall.completedMilestones} more milestones
                    </li>
                  </ul>
                ) : (
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-accent" />
                      Generate learning roadmap
                    </li>
                    <li className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-accent" />
                      Add 3 more skills
                    </li>
                    <li className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-accent" />
                      Complete skill analysis
                    </li>
                  </ul>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};
