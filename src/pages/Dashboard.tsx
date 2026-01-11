import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useAppData } from "@/context/AppDataContext";
import { Layout } from "@/components/Layout";
import { ProgressCircle } from "@/components/ProgressCircle";
import { StepIndicator } from "@/components/StepIndicator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Target, 
  BookOpen, 
  Briefcase, 
  TrendingUp, 
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronRight,
  Flame,
  Trophy,
  Calendar,
  Brain,
  Zap,
  TrendingDown,
  AlertTriangle,
  Info
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";
import { getLearningInsights } from "@/data/fixedRoadmaps";
import AnalyticsService from "@/services/analyticsService";

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

export const Dashboard = () => {
  const { 
    userSkills, 
    selectedRole, 
    analysis, 
    roadmap,
    roadmapProgress 
  } = useAppData();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [learningInsights, setLearningInsights] = useState<any>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  // Calculate enhanced analytics
  const analytics = useMemo(() => {
    if (roadmap.length === 0) return null;
    
    return AnalyticsService.calculateLearningAnalytics(
      roadmap,
      roadmapProgress,
      [] // Learning sessions would come from backend
    );
  }, [roadmap, roadmapProgress]);

  // Get learning insights for the selected role
  useEffect(() => {
    if (selectedRole && roadmapProgress) {
      const insights = getLearningInsights(selectedRole.id, roadmapProgress);
      setLearningInsights(insights);
    }
  }, [selectedRole, roadmapProgress]);

  const completedItems = roadmap.filter((item) => item.completed).length;
  const roadmapProgressPercent = roadmap.length > 0 ? Math.round((completedItems / roadmap.length) * 100) : 0;

  const skillsByProficiency = userSkills.reduce((acc, skill) => {
    acc[skill.proficiency] = (acc[skill.proficiency] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = [
    { name: "Advanced", value: skillsByProficiency.advanced || 0, fill: "hsl(160, 84%, 39%)" },
    { name: "Intermediate", value: skillsByProficiency.intermediate || 0, fill: "hsl(200, 98%, 48%)" },
    { name: "Beginner", value: skillsByProficiency.beginner || 0, fill: "hsl(38, 92%, 50%)" },
  ].filter(d => d.value > 0);

  const skillsByCategory = userSkills.reduce((acc, skill) => {
    acc[skill.category] = (acc[skill.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(skillsByCategory)
    .map(([name, count]) => ({ name: name.split(" ")[0], count }))
    .slice(0, 5);

  const barColors = ["hsl(220, 90%, 56%)", "hsl(160, 84%, 39%)", "hsl(38, 92%, 50%)", "hsl(200, 98%, 48%)", "hsl(280, 70%, 50%)"];

  const getInitials = (name: string) => {
    return name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "U";
  };

  // Calculate current step
  const getCurrentStep = (): 1 | 2 | 3 | 4 => {
    if (roadmap.length > 0) return 4;
    if (analysis) return 3;
    if (selectedRole) return 2;
    return 1;
  };

  const journeySteps = [
    { 
      step: 1, 
      title: "Add Skills", 
      description: "Add your current skills", 
      icon: Target, 
      path: "/skills",
      completed: userSkills.length > 0,
      count: userSkills.length,
      label: "skills added"
    },
    { 
      step: 2, 
      title: "Choose Role", 
      description: "Select target job role", 
      icon: Briefcase, 
      path: "/roles",
      completed: !!selectedRole,
      count: selectedRole ? 1 : 0,
      label: selectedRole?.title || "role selected"
    },
    { 
      step: 3, 
      title: "Analyze Gaps", 
      description: "View skill gap analysis", 
      icon: TrendingUp, 
      path: "/analysis",
      completed: !!analysis,
      count: analysis?.readinessScore || 0,
      label: "% readiness"
    },
    { 
      step: 4, 
      title: "Learn & Grow", 
      description: "Follow your roadmap", 
      icon: BookOpen, 
      path: "/roadmap",
      completed: roadmapProgressPercent === 100,
      count: roadmapProgressPercent,
      label: "% complete"
    },
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link to="/profile">
              <Avatar className="h-16 w-16 border-4 border-primary/20 cursor-pointer hover:border-primary/40 transition-colors">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback className="text-xl bg-primary/10 text-primary">
                  {getInitials(user?.name || "User")}
                </AvatarFallback>
              </Avatar>
            </Link>
            <div>
              <p className="text-muted-foreground">{getGreeting()},</p>
              <h1 className="text-3xl font-bold">{user?.name || "User"}</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="gap-1 px-3 py-1.5">
              <Flame className="h-4 w-4 text-warning" />
              <span>3 day streak</span>
            </Badge>
            <Badge variant="secondary" className="gap-1 px-3 py-1.5">
              <Trophy className="h-4 w-4 text-warning" />
              <span>{completedItems} completed</span>
            </Badge>
          </div>
        </div>

        {/* Journey Progress */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Your Journey Progress
                </CardTitle>
                <CardDescription>
                  Complete each step to reach your career goals
                </CardDescription>
              </div>
              <div className="hidden sm:block">
                <StepIndicator currentStep={getCurrentStep()} />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-border">
              {journeySteps.map((step) => {
                const Icon = step.icon;
                return (
                  <Link
                    key={step.step}
                    to={step.path}
                    className="p-6 hover:bg-muted/50 transition-colors group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                        step.completed ? "bg-accent/10" : "bg-muted"
                      }`}>
                        {step.completed ? (
                          <CheckCircle2 className="h-5 w-5 text-accent" />
                        ) : (
                          <Icon className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                    <h3 className="font-semibold mb-1">{step.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{step.description}</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-primary">{step.count}</span>
                      <span className="text-sm text-muted-foreground">{step.label}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Analytics Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Skills</p>
                  <p className="text-3xl font-bold">{userSkills.length}</p>
                  {analytics && (
                    <p className="text-xs text-muted-foreground mt-1">
                      +{Math.round(analytics.learningVelocity * 4)} this month
                    </p>
                  )}
                </div>
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Target className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Readiness Score</p>
                  <p className="text-3xl font-bold">{analysis?.readinessScore || 0}%</p>
                  {learningInsights && (
                    <p className="text-xs text-green-600 mt-1">
                      {learningInsights.isOnTrack ? "On track" : "Behind schedule"}
                    </p>
                  )}
                </div>
                <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Roadmap Progress</p>
                  <p className="text-3xl font-bold">{roadmapProgressPercent}%</p>
                  {analytics && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {Math.round(analytics.estimatedWeeksRemaining)}w remaining
                    </p>
                  )}
                </div>
                <div className="h-12 w-12 rounded-xl bg-warning/10 flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-info/10 to-info/5 border-info/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Learning Streak</p>
                  <p className="text-3xl font-bold">{analytics?.currentStreak || 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Best: {analytics?.longestStreak || 0} days
                  </p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-info/10 flex items-center justify-center">
                  <Flame className="h-6 w-6 text-info" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Learning Insights */}
        {analytics && analytics.insights.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Learning Insights
            </h2>
            <div className="grid gap-4">
              {analytics.insights.slice(0, 3).map((insight, index) => (
                <Alert 
                  key={index} 
                  className={`${
                    insight.type === 'success' ? 'border-green-200 bg-green-50 dark:bg-green-950/20' :
                    insight.type === 'warning' ? 'border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20' :
                    insight.type === 'error' ? 'border-red-200 bg-red-50 dark:bg-red-950/20' :
                    'border-blue-200 bg-blue-50 dark:bg-blue-950/20'
                  }`}
                >
                  {insight.type === 'success' && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                  {insight.type === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-600" />}
                  {insight.type === 'error' && <AlertTriangle className="h-4 w-4 text-red-600" />}
                  {insight.type === 'info' && <Info className="h-4 w-4 text-blue-600" />}
                  <AlertDescription className={`${
                    insight.type === 'success' ? 'text-green-800 dark:text-green-200' :
                    insight.type === 'warning' ? 'text-yellow-800 dark:text-yellow-200' :
                    insight.type === 'error' ? 'text-red-800 dark:text-red-200' :
                    'text-blue-800 dark:text-blue-200'
                  }`}>
                    <strong>{insight.title}:</strong> {insight.message}
                    {insight.action && (
                      <div className="mt-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-xs"
                        >
                          {insight.action}
                        </Button>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </div>
        )}

        {/* Learning Analytics Chart */}
        {analytics && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Learning Analytics
              </CardTitle>
              <CardDescription>
                Your learning progress and predictions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Completion Likelihood</span>
                    <span className="text-2xl font-bold text-primary">
                      {Math.round(analytics.completionLikelihood)}%
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                      style={{ width: `${analytics.completionLikelihood}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Based on your current pace and consistency
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Learning Velocity</span>
                    <span className="text-2xl font-bold text-accent">
                      {analytics.learningVelocity.toFixed(1)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Skills per week • Target: {analytics.recommendedPace.toFixed(1)}
                  </p>
                  <div className="flex items-center gap-2">
                    {analytics.isOnTrack ? (
                      <Badge variant="secondary" className="text-green-600 bg-green-100">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        On Track
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-yellow-600 bg-yellow-100">
                        <TrendingDown className="h-3 w-3 mr-1" />
                        Behind
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Est. Completion</span>
                    <span className="text-sm font-bold">
                      {analytics.estimatedCompletionDate.toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {Math.round(analytics.estimatedWeeksRemaining)} weeks remaining
                  </p>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {analytics.weeksElapsed} weeks elapsed
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Readiness Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Role Readiness</CardTitle>
              <CardDescription>
                {selectedRole ? selectedRole.title : "Select a target role"}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              {analysis ? (
                <>
                  <ProgressCircle value={analysis.readinessScore} size="lg" />
                  <div className="mt-6 w-full space-y-3">
                    <div className="flex items-center justify-between text-sm p-3 rounded-lg bg-progress-high/10">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-progress-high" />
                        <span>Matched Skills</span>
                      </div>
                      <span className="font-semibold">{analysis.matchedSkills.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm p-3 rounded-lg bg-progress-medium/10">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-progress-medium" />
                        <span>Need Improvement</span>
                      </div>
                      <span className="font-semibold">{analysis.partialSkills.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm p-3 rounded-lg bg-progress-low/10">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-progress-low" />
                        <span>Missing Skills</span>
                      </div>
                      <span className="font-semibold">{analysis.missingSkills.length}</span>
                    </div>
                  </div>
                  
                  {/* Real-time Update Indicator */}
                  {completedItems > 0 && (
                    <div className="mt-4 w-full p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                        <TrendingUp className="h-4 w-4" />
                        <span className="text-sm font-medium">Live Updates Active</span>
                      </div>
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                        Score updates as you complete roadmap items
                      </p>
                    </div>
                  )}
                  
                  <Link to="/analysis" className="mt-6 w-full">
                    <Button variant="outline" className="w-full">
                      View Full Analysis
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground mb-4">
                    Complete your skill analysis to see your readiness score
                  </p>
                  <Link to="/roles">
                    <Button>
                      Select Target Role
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Skills Distribution */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Skills Overview</CardTitle>
                  <CardDescription>Your skills by category and proficiency</CardDescription>
                </div>
                <Link to="/skills">
                  <Button variant="outline" size="sm">
                    Manage Skills
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium mb-4">By Category</h4>
                    <div className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 20 }}>
                          <XAxis type="number" hide />
                          <YAxis 
                            type="category" 
                            dataKey="name" 
                            axisLine={false}
                            tickLine={false}
                            width={80}
                            tick={{ fontSize: 12 }}
                          />
                          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                            {chartData.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-4">By Proficiency</h4>
                    <div className="h-[200px] flex items-center justify-center">
                      {pieData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={pieData}
                              cx="50%"
                              cy="50%"
                              innerRadius={50}
                              outerRadius={80}
                              paddingAngle={2}
                              dataKey="value"
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <p className="text-muted-foreground">No data</p>
                      )}
                    </div>
                    <div className="flex justify-center gap-4 mt-2">
                      {pieData.map((entry) => (
                        <div key={entry.name} className="flex items-center gap-2 text-xs">
                          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.fill }} />
                          <span>{entry.name}: {entry.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No skills added yet</p>
                    <Link to="/skills" className="mt-2 inline-block">
                      <Button variant="link" className="p-0">Add your first skill</Button>
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Roadmap Progress */}
        {roadmap.length > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Learning Roadmap</CardTitle>
                <CardDescription>Your personalized path to {selectedRole?.title}</CardDescription>
              </div>
              <Link to="/roadmap">
                <Button variant="outline" size="sm">
                  View Full Roadmap
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span>{completedItems} of {roadmap.length} skills completed</span>
                  <span className="font-medium text-primary">{roadmapProgressPercent}%</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500 ease-out rounded-full"
                    style={{ width: `${roadmapProgressPercent}%` }}
                  />
                </div>
                <div className="grid sm:grid-cols-3 gap-4 pt-4">
                  {roadmap.slice(0, 3).map((item, index) => (
                    <div
                      key={item.id}
                      className={`p-4 rounded-xl border transition-all ${
                        item.completed 
                          ? "bg-accent/5 border-accent/20" 
                          : "bg-card hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                          item.completed ? "bg-accent text-accent-foreground" : "bg-primary/10 text-primary"
                        }`}>
                          {item.completed ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            <span className="text-sm font-bold">{index + 1}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium text-sm truncate ${item.completed && "line-through opacity-75"}`}>
                            {item.skillName}
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <Clock className="h-3 w-3" />
                            {item.estimatedTime}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};
