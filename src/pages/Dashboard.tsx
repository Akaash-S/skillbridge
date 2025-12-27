import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { Layout } from "@/components/Layout";
import { ProgressCircle } from "@/components/ProgressCircle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Target, 
  BookOpen, 
  Briefcase, 
  TrendingUp, 
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  Clock
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts";

export const Dashboard = () => {
  const { 
    isAuthenticated, 
    user, 
    userSkills, 
    selectedRole, 
    analysis, 
    roadmap,
    resetProgress 
  } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  const completedItems = roadmap.filter((item) => item.completed).length;
  const roadmapProgress = roadmap.length > 0 ? Math.round((completedItems / roadmap.length) * 100) : 0;

  const skillsByCategory = userSkills.reduce((acc, skill) => {
    acc[skill.category] = (acc[skill.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(skillsByCategory).map(([name, count]) => ({
    name: name.split(" ")[0], // Shorten for display
    count,
  }));

  const barColors = ["hsl(220, 90%, 56%)", "hsl(160, 84%, 39%)", "hsl(38, 92%, 50%)", "hsl(200, 98%, 48%)"];

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Welcome Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Welcome back, {user?.name || "User"}!</h1>
          <p className="text-muted-foreground">
            Here's an overview of your skill development journey.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Skills</p>
                  <p className="text-2xl font-bold">{userSkills.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Readiness Score</p>
                  <p className="text-2xl font-bold">{analysis?.readinessScore || 0}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-warning/10 flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Roadmap Progress</p>
                  <p className="text-2xl font-bold">{roadmapProgress}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-info/10 flex items-center justify-center">
                  <Briefcase className="h-6 w-6 text-info" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Target Role</p>
                  <p className="text-lg font-bold truncate">{selectedRole?.title || "Not set"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Readiness Overview */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Role Readiness</CardTitle>
              <CardDescription>
                {selectedRole ? `Progress towards ${selectedRole.title}` : "Select a target role"}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              {analysis ? (
                <>
                  <ProgressCircle value={analysis.readinessScore} size="lg" />
                  <div className="mt-6 text-center space-y-2">
                    <div className="flex items-center justify-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-progress-high" />
                      <span>{analysis.matchedSkills.length} skills matched</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-progress-medium" />
                      <span>{analysis.partialSkills.length} need improvement</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <span>{analysis.missingSkills.length} skills to learn</span>
                    </div>
                  </div>
                  <Link to="/analysis" className="mt-6 w-full">
                    <Button variant="outline" className="w-full">
                      View Full Analysis
                    </Button>
                  </Link>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    Complete your skill analysis to see your readiness score.
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
              <CardTitle>Skills by Category</CardTitle>
              <CardDescription>Distribution of your skills across categories</CardDescription>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <div className="h-[250px]">
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
              ) : (
                <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No skills added yet.</p>
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
                <CardDescription>Track your progress on the learning path</CardDescription>
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
                  <span className="font-medium">{roadmapProgress}%</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent transition-all duration-500 ease-out rounded-full"
                    style={{ width: `${roadmapProgress}%` }}
                  />
                </div>
                <div className="grid sm:grid-cols-3 gap-4 pt-4">
                  {roadmap.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      className={`p-4 rounded-lg border ${
                        item.completed ? "bg-accent/5 border-accent/20" : "bg-muted/50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`h-6 w-6 rounded-full flex items-center justify-center ${
                          item.completed ? "bg-accent text-accent-foreground" : "bg-muted-foreground/20"
                        }`}>
                          {item.completed ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            <span className="text-xs font-medium">
                              {roadmap.indexOf(item) + 1}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className={`font-medium text-sm ${item.completed && "line-through opacity-75"}`}>
                            {item.skillName}
                          </p>
                          <p className="text-xs text-muted-foreground">{item.estimatedTime}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Link to="/skills">
                <Button variant="outline">
                  <Target className="mr-2 h-4 w-4" />
                  Update Skills
                </Button>
              </Link>
              <Link to="/roles">
                <Button variant="outline">
                  <Briefcase className="mr-2 h-4 w-4" />
                  Change Target Role
                </Button>
              </Link>
              {analysis && (
                <Link to="/analysis">
                  <Button variant="outline">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Re-analyze Skills
                  </Button>
                </Link>
              )}
              <Button variant="outline" onClick={resetProgress}>
                Start Fresh
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};
