import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Certificate } from "@/components/Certificate";
import { LearningResources } from "@/components/LearningResources";
import { AdvancedAnalytics } from "@/components/AdvancedAnalytics";
import { NotificationCenter } from "@/components/NotificationCenter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Sparkles, 
  Trophy, 
  BookOpen, 
  BarChart3, 
  Bell,
  Download,
  Share2,
  TrendingUp,
  Target,
  Zap,
  CheckCircle2,
  Star,
  Award,
  Flame,
  Brain
} from "lucide-react";
import { toast } from "sonner";

export const FeatureShowcase = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const mockUser = {
    name: "Sarah Johnson",
    email: "sarah.johnson@example.com"
  };

  const mockRole = {
    title: "Senior Full Stack Developer"
  };

  const mockAnalyticsData = {
    currentStreak: 12,
    longestStreak: 21,
    totalTimeSpent: 89,
    learningVelocity: 2.1,
    completionLikelihood: 92,
    estimatedWeeksRemaining: 6,
    skillsPerWeek: 2.1,
    consistencyScore: 88,
    focusAreas: [
      'Advanced React Patterns',
      'System Design',
      'Cloud Architecture',
      'Performance Optimization'
    ],
    weeklyProgress: [
      { week: 'Week 1', skillsCompleted: 3, timeSpent: 15, consistency: 95 },
      { week: 'Week 2', skillsCompleted: 2, timeSpent: 12, consistency: 85 },
      { week: 'Week 3', skillsCompleted: 4, timeSpent: 18, consistency: 98 },
      { week: 'Week 4', skillsCompleted: 3, timeSpent: 14, consistency: 90 },
      { week: 'Week 5', skillsCompleted: 2, timeSpent: 11, consistency: 82 },
      { week: 'Week 6', skillsCompleted: 3, timeSpent: 16, consistency: 93 }
    ],
    skillDistribution: [
      { category: 'Frontend', completed: 12, remaining: 3 },
      { category: 'Backend', completed: 8, remaining: 4 },
      { category: 'Database', completed: 6, remaining: 2 },
      { category: 'DevOps', completed: 4, remaining: 3 },
      { category: 'System Design', completed: 2, remaining: 5 }
    ],
    learningPattern: [
      { day: 'Mon', morning: 60, afternoon: 45, evening: 30 },
      { day: 'Tue', morning: 45, afternoon: 60, evening: 40 },
      { day: 'Wed', morning: 75, afternoon: 30, evening: 45 },
      { day: 'Thu', morning: 50, afternoon: 55, evening: 35 },
      { day: 'Fri', morning: 40, afternoon: 45, evening: 25 },
      { day: 'Sat', morning: 30, afternoon: 90, evening: 60 },
      { day: 'Sun', morning: 20, afternoon: 45, evening: 75 }
    ]
  };

  const features = [
    {
      id: 'certificate',
      title: 'Professional Certificates',
      description: 'Generate beautiful, downloadable certificates with multiple formats',
      icon: Trophy,
      color: 'text-yellow-600 bg-yellow-100',
      stats: ['PDF Download', 'HTML Export', 'Image Format', 'Social Sharing']
    },
    {
      id: 'resources',
      title: 'Learning Resources',
      description: 'Curated learning materials with advanced filtering and search',
      icon: BookOpen,
      color: 'text-blue-600 bg-blue-100',
      stats: ['Smart Filtering', 'Search Engine', 'Bookmarks', 'Multiple Types']
    },
    {
      id: 'analytics',
      title: 'Advanced Analytics',
      description: 'Deep insights into learning patterns and progress predictions',
      icon: BarChart3,
      color: 'text-green-600 bg-green-100',
      stats: ['Learning Velocity', 'Pattern Analysis', 'Predictions', 'AI Insights']
    },
    {
      id: 'notifications',
      title: 'Smart Notifications',
      description: 'Intelligent reminders and achievement alerts',
      icon: Bell,
      color: 'text-purple-600 bg-purple-100',
      stats: ['Daily Reminders', 'Achievement Alerts', 'Streak Tracking', 'Custom Schedule']
    }
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-6 py-12 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/10 rounded-2xl">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              SkillBridge Pro Features
            </h1>
            <Sparkles className="h-8 w-8 text-accent" />
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Experience the next generation of learning management with AI-powered insights, 
            professional certificates, curated resources, and intelligent notifications.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Badge variant="secondary" className="gap-2 px-4 py-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              PDF Certificates
            </Badge>
            <Badge variant="secondary" className="gap-2 px-4 py-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              AI Analytics
            </Badge>
            <Badge variant="secondary" className="gap-2 px-4 py-2">
              <Bell className="h-4 w-4 text-purple-600" />
              Smart Notifications
            </Badge>
            <Badge variant="secondary" className="gap-2 px-4 py-2">
              <BookOpen className="h-4 w-4 text-orange-600" />
              Curated Resources
            </Badge>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.id} className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
                <CardHeader className="text-center">
                  <div className={`h-16 w-16 rounded-2xl ${feature.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="h-8 w-8" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {feature.stats.map((stat, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-3 w-3 text-green-600" />
                        <span>{stat}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Interactive Demo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-6 w-6 text-primary" />
              Interactive Feature Demo
            </CardTitle>
            <CardDescription>
              Explore each feature with live, interactive examples
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview" className="gap-2">
                  <Star className="h-4 w-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="certificate" className="gap-2">
                  <Trophy className="h-4 w-4" />
                  Certificate
                </TabsTrigger>
                <TabsTrigger value="analytics" className="gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Analytics
                </TabsTrigger>
                <TabsTrigger value="notifications" className="gap-2">
                  <Bell className="h-4 w-4" />
                  Notifications
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6 mt-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <Card className="text-center">
                    <CardContent className="p-6">
                      <Award className="h-12 w-12 mx-auto mb-4 text-yellow-600" />
                      <h3 className="font-semibold mb-2">Professional Quality</h3>
                      <p className="text-sm text-muted-foreground">
                        Enterprise-grade features designed for serious learners and professionals
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="text-center">
                    <CardContent className="p-6">
                      <Brain className="h-12 w-12 mx-auto mb-4 text-purple-600" />
                      <h3 className="font-semibold mb-2">AI-Powered Insights</h3>
                      <p className="text-sm text-muted-foreground">
                        Machine learning algorithms analyze your patterns and optimize your learning
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="text-center">
                    <CardContent className="p-6">
                      <Target className="h-12 w-12 mx-auto mb-4 text-green-600" />
                      <h3 className="font-semibold mb-2">Goal Achievement</h3>
                      <p className="text-sm text-muted-foreground">
                        Track progress, celebrate milestones, and achieve your career goals faster
                      </p>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="text-center space-y-4">
                  <h3 className="text-2xl font-bold">Ready to Experience the Future of Learning?</h3>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    Join thousands of professionals who have accelerated their careers with SkillBridge Pro features.
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Button onClick={() => setActiveTab("certificate")} className="gap-2">
                      <Trophy className="h-4 w-4" />
                      Try Certificate Generator
                    </Button>
                    <Button variant="outline" onClick={() => setActiveTab("analytics")} className="gap-2">
                      <BarChart3 className="h-4 w-4" />
                      View Analytics Demo
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="certificate" className="space-y-6 mt-6">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2">Professional Certificate Generator</h3>
                  <p className="text-muted-foreground">
                    Generate beautiful, professional certificates with multiple download formats
                  </p>
                </div>
                
                <Certificate
                  userName={mockUser.name}
                  userEmail={mockUser.email}
                  roleName={mockRole.title}
                  completionDate={new Date()}
                  skillsCompleted={18}
                  totalHours={89}
                  readinessScore={92}
                  onDownload={() => toast.success('Certificate downloaded successfully!')}
                  onShare={() => toast.success('Achievement shared successfully!')}
                />
                
                <div className="grid md:grid-cols-3 gap-4 mt-6">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Download className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                      <h4 className="font-medium">Multiple Formats</h4>
                      <p className="text-xs text-muted-foreground">PDF, HTML, and PNG downloads</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Share2 className="h-8 w-8 mx-auto mb-2 text-green-600" />
                      <h4 className="font-medium">Social Sharing</h4>
                      <p className="text-xs text-muted-foreground">Share achievements instantly</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Trophy className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                      <h4 className="font-medium">Professional Design</h4>
                      <p className="text-xs text-muted-foreground">Beautiful, employer-ready certificates</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6 mt-6">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2">Advanced Learning Analytics</h3>
                  <p className="text-muted-foreground">
                    AI-powered insights into your learning patterns and progress predictions
                  </p>
                </div>
                
                <AdvancedAnalytics data={mockAnalyticsData} />
                
                <div className="grid md:grid-cols-2 gap-6 mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Flame className="h-5 w-5 text-orange-600" />
                        Learning Streaks
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-orange-600 mb-2">
                        {mockAnalyticsData.currentStreak} Days
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Current streak • Best: {mockAnalyticsData.longestStreak} days
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                        Completion Prediction
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        {mockAnalyticsData.completionLikelihood}%
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Likelihood to complete roadmap
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="notifications" className="space-y-6 mt-6">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2">Smart Notification System</h3>
                  <p className="text-muted-foreground">
                    Intelligent reminders and achievement alerts to keep you motivated
                  </p>
                </div>
                
                <NotificationCenter />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <CardContent className="text-center py-12">
            <h2 className="text-3xl font-bold mb-4">Ready to Supercharge Your Learning?</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Experience all these features and more in your personalized learning dashboard. 
              Start your journey to career success today.
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" onClick={() => window.location.href = '/dashboard'} className="gap-2">
                <Sparkles className="h-5 w-5" />
                Go to Dashboard
              </Button>
              <Button size="lg" variant="outline" onClick={() => window.location.href = '/roadmap'} className="gap-2">
                <Target className="h-5 w-5" />
                Start Learning
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};