import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/context/AppContext";
import { BarChart3, TrendingUp, Target, Clock, Zap, Award, Calendar } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar } from "recharts";
import { useEffect } from "react";

export const Insights = () => {
  const { userSkills, roadmap, roadmapProgress, loadRoadmapProgress } = useApp();

  // Load roadmap progress data on component mount
  useEffect(() => {
    loadRoadmapProgress();
  }, [loadRoadmapProgress]);

  // Mock data for charts
  const skillGrowthData = [
    { month: "Jan", skills: 2, hours: 10 },
    { month: "Feb", skills: 4, hours: 25 },
    { month: "Mar", skills: 5, hours: 35 },
    { month: "Apr", skills: 7, hours: 50 },
    { month: "May", skills: 9, hours: 65 },
    { month: "Jun", skills: userSkills.length || 12, hours: 80 },
  ];

  const categoryStrengths = [
    { category: "Frontend", score: 85 },
    { category: "Backend", score: 60 },
    { category: "Database", score: 45 },
    { category: "DevOps", score: 30 },
    { category: "Soft Skills", score: 70 },
    { category: "Data Science", score: 25 },
  ];

  const weeklyProgress = [
    { day: "Mon", hours: 2 },
    { day: "Tue", hours: 1.5 },
    { day: "Wed", hours: 3 },
    { day: "Thu", hours: 2.5 },
    { day: "Fri", hours: 1 },
    { day: "Sat", hours: 4 },
    { day: "Sun", hours: 3 },
  ];

  const insights = [
    { 
      icon: TrendingUp, 
      title: roadmapProgress?.hasRoadmap ? "Roadmap Progress" : "Strong Growth", 
      description: roadmapProgress?.hasRoadmap 
        ? `${roadmapProgress.progress.overall.skillProgress}% of roadmap completed`
        : "You've added 5 new skills this month", 
      color: "text-accent" 
    },
    { 
      icon: Target, 
      title: "Skills Mastered", 
      description: roadmapProgress?.hasRoadmap 
        ? `${roadmapProgress.progress.overall.completedSkills} out of ${roadmapProgress.progress.overall.totalSkills} skills completed`
        : "Your strongest area is Frontend development", 
      color: "text-primary" 
    },
    { 
      icon: Clock, 
      title: "Time Investment", 
      description: roadmapProgress?.hasRoadmap 
        ? `${roadmapProgress.progress.timeEstimate.estimatedWeeksRemaining} weeks remaining`
        : "Average of 2.3 hours per skill mastered", 
      color: "text-warning" 
    },
    { 
      icon: Award, 
      title: "Milestones", 
      description: roadmapProgress?.hasRoadmap 
        ? `${roadmapProgress.progress.overall.completedMilestones} of ${roadmapProgress.progress.overall.totalMilestones} milestones reached`
        : "You've maintained a 7-day learning streak", 
      color: "text-info" 
    },
  ];

  const completedRoadmapItems = roadmapProgress?.hasRoadmap 
    ? roadmapProgress.progress.overall.completedSkills 
    : roadmap.filter(r => r.completed).length;
  
  const totalLearningHours = roadmapProgress?.hasRoadmap 
    ? (roadmapProgress.progress.overall.completedSkills * 15) // Estimate 15 hours per skill
    : skillGrowthData.reduce((acc, d) => acc + d.hours, 0);

  // Create difficulty distribution chart from real data
  const difficultyData = roadmapProgress?.hasRoadmap 
    ? Object.entries(roadmapProgress.progress.byDifficulty).map(([difficulty, stats]: [string, any]) => ({
        difficulty: difficulty.charAt(0).toUpperCase() + difficulty.slice(1),
        completed: stats.completed,
        total: stats.total,
        percentage: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0
      }))
    : [
        { difficulty: "Beginner", completed: 3, total: 5, percentage: 60 },
        { difficulty: "Intermediate", completed: 2, total: 4, percentage: 50 },
        { difficulty: "Advanced", completed: 1, total: 3, percentage: 33 }
      ];

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
                <div className="text-3xl font-bold text-primary">{userSkills.length}</div>
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
                <p className="text-sm text-muted-foreground">Roadmap Items Done</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-info">7</div>
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
                {roadmapProgress?.hasRoadmap && roadmapProgress.progress.recentActivity?.length > 0 ? (
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
                {roadmapProgress?.hasRoadmap ? (
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
