import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Clock, 
  Brain, 
  Zap,
  Calendar,
  Award,
  BarChart3,
  PieChart,
  Activity,
  Flame
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

interface AnalyticsData {
  currentStreak: number;
  longestStreak: number;
  totalTimeSpent: number;
  learningVelocity: number;
  completionLikelihood: number;
  estimatedWeeksRemaining: number;
  skillsPerWeek: number;
  consistencyScore: number;
  focusAreas: string[];
  weeklyProgress: Array<{
    week: string;
    skillsCompleted: number;
    timeSpent: number;
    consistency: number;
  }>;
  skillDistribution: Array<{
    category: string;
    completed: number;
    remaining: number;
  }>;
  learningPattern: Array<{
    day: string;
    morning: number;
    afternoon: number;
    evening: number;
  }>;
}

interface AdvancedAnalyticsProps {
  data: AnalyticsData;
  className?: string;
}

export const AdvancedAnalytics: React.FC<AdvancedAnalyticsProps> = ({ data, className = "" }) => {
  const {
    currentStreak,
    longestStreak,
    totalTimeSpent,
    learningVelocity,
    completionLikelihood,
    estimatedWeeksRemaining,
    skillsPerWeek,
    consistencyScore,
    focusAreas,
    weeklyProgress,
    skillDistribution,
    learningPattern
  } = data;

  const getStreakColor = (streak: number) => {
    if (streak >= 30) return "text-purple-600 bg-purple-100";
    if (streak >= 14) return "text-green-600 bg-green-100";
    if (streak >= 7) return "text-blue-600 bg-blue-100";
    if (streak >= 3) return "text-yellow-600 bg-yellow-100";
    return "text-gray-600 bg-gray-100";
  };

  const getVelocityStatus = (velocity: number) => {
    if (velocity >= 2) return { status: "Excellent", color: "text-green-600", icon: TrendingUp };
    if (velocity >= 1) return { status: "Good", color: "text-blue-600", icon: TrendingUp };
    if (velocity >= 0.5) return { status: "Moderate", color: "text-yellow-600", icon: Activity };
    return { status: "Slow", color: "text-red-600", icon: TrendingDown };
  };

  const velocityStatus = getVelocityStatus(learningVelocity);
  const VelocityIcon = velocityStatus.icon;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current Streak</p>
                <p className="text-2xl font-bold">{currentStreak}</p>
                <p className="text-xs text-muted-foreground">days</p>
              </div>
              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${getStreakColor(currentStreak)}`}>
                <Flame className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-2">
              <Progress value={(currentStreak / Math.max(longestStreak, 30)) * 100} className="h-1" />
              <p className="text-xs text-muted-foreground mt-1">Best: {longestStreak} days</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Learning Velocity</p>
                <p className="text-2xl font-bold">{learningVelocity.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">skills/week</p>
              </div>
              <div className={`h-10 w-10 rounded-full flex items-center justify-center bg-blue-100`}>
                <VelocityIcon className={`h-5 w-5 ${velocityStatus.color}`} />
              </div>
            </div>
            <div className="mt-2">
              <Badge variant="secondary" className={`text-xs ${velocityStatus.color}`}>
                {velocityStatus.status}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Time Invested</p>
                <p className="text-2xl font-bold">{Math.round(totalTimeSpent)}</p>
                <p className="text-xs text-muted-foreground">hours</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="mt-2">
              <p className="text-xs text-muted-foreground">
                ~{Math.round(totalTimeSpent / Math.max(currentStreak, 1))}h per active day
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-bold">{Math.round(completionLikelihood)}%</p>
                <p className="text-xs text-muted-foreground">likelihood</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                <Target className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <div className="mt-2">
              <Progress value={completionLikelihood} className="h-1" />
              <p className="text-xs text-muted-foreground mt-1">
                {estimatedWeeksRemaining}w remaining
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Learning Progress Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Weekly Learning Progress
          </CardTitle>
          <CardDescription>
            Track your learning consistency and skill acquisition over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyProgress}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'skillsCompleted' ? `${value} skills` : 
                    name === 'timeSpent' ? `${value} hours` : 
                    `${value}% consistency`,
                    name === 'skillsCompleted' ? 'Skills Completed' :
                    name === 'timeSpent' ? 'Time Spent' :
                    'Consistency'
                  ]}
                />
                <Area 
                  type="monotone" 
                  dataKey="skillsCompleted" 
                  stackId="1"
                  stroke="#3b82f6" 
                  fill="#3b82f6" 
                  fillOpacity={0.6}
                />
                <Area 
                  type="monotone" 
                  dataKey="timeSpent" 
                  stackId="2"
                  stroke="#10b981" 
                  fill="#10b981" 
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Learning Pattern */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Daily Learning Pattern
            </CardTitle>
            <CardDescription>
              When you're most productive during the day
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={learningPattern}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} min`, 'Learning Time']} />
                  <Line 
                    type="monotone" 
                    dataKey="morning" 
                    stroke="#f59e0b" 
                    strokeWidth={2}
                    name="Morning"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="afternoon" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="Afternoon"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="evening" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    name="Evening"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Skill Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Skill Category Progress
            </CardTitle>
            <CardDescription>
              Progress across different skill categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {skillDistribution.map((category, index) => {
                const total = category.completed + category.remaining;
                const percentage = total > 0 ? (category.completed / total) * 100 : 0;
                
                return (
                  <div key={category.category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{category.category}</span>
                      <span className="text-sm text-muted-foreground">
                        {category.completed}/{total}
                      </span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{Math.round(percentage)}% complete</span>
                      <span>{category.remaining} remaining</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights and Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI-Powered Insights
          </CardTitle>
          <CardDescription>
            Personalized recommendations based on your learning patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium">Performance Insights</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <Zap className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">Consistency Score</p>
                    <p className="text-xs text-muted-foreground">
                      {consistencyScore}% - {consistencyScore >= 80 ? 'Excellent' : consistencyScore >= 60 ? 'Good' : 'Needs Improvement'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <Calendar className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium">Optimal Learning Time</p>
                    <p className="text-xs text-muted-foreground">
                      {learningPattern.reduce((best, day) => {
                        const maxTime = Math.max(day.morning, day.afternoon, day.evening);
                        if (maxTime === day.morning) return 'Morning';
                        if (maxTime === day.afternoon) return 'Afternoon';
                        return 'Evening';
                      }, 'Morning')} sessions work best for you
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Focus Areas</h4>
              <div className="space-y-2">
                {focusAreas.map((area, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm">{area}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  💡 Recommendation
                </p>
                <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                  {learningVelocity < 1 
                    ? "Consider increasing your daily learning time to 30-45 minutes for better progress."
                    : currentStreak < 7
                    ? "Focus on building consistency. Try learning at the same time each day."
                    : "Great momentum! Consider tackling more challenging topics to accelerate growth."
                  }
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedAnalytics;