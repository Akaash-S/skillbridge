import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useAppData } from "@/context/AppDataContext";
import { Bell, CheckCircle, Target, TrendingUp, Award, Clock, Filter, CheckCheck, Star, Briefcase, Loader2, User, Settings, BookOpen } from "lucide-react";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiClient } from "@/services/apiClient";
import { toast } from "@/hooks/use-toast";

interface Activity {
  id: string;
  type: string;
  title: string;
  description: string;
  createdAt: string;
  metadata?: any;
  read?: boolean;
}

interface ActivitySummary {
  totalActivities: number;
  activityCounts: Record<string, number>;
  dailyCounts: Record<string, number>;
  latestActivities: Activity[];
  dateRange: {
    days: number;
    from: string;
    to: string;
  };
}

export const Activity = () => {
  const { userSkills } = useAppData();
  const { isAuthenticated } = useAuth();
  
  // State for real activity data
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activitySummary, setActivitySummary] = useState<ActivitySummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<string>("all");

  // Load user activity data
  const loadUserActivity = async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    try {
      console.log('📊 Loading user activity...');
      
      // Load activity data and summary
      const [activityResponse, summaryResponse] = await Promise.all([
        apiClient.get('/activity?limit=100'), // Get last 100 activities
        apiClient.get('/activity?limit=30')   // Get last 30 days for summary
      ]);
      
      const allActivities = activityResponse.activities || [];
      const recentActivities = summaryResponse.activities || [];
      
      // Process activities to add user-friendly titles and descriptions
      const processedActivities = allActivities.map((activity: any) => ({
        id: activity.id || `${activity.type}-${Date.now()}`,
        type: activity.type,
        title: getActivityTitle(activity.type),
        description: getActivityDescription(activity.type, activity.metadata),
        createdAt: activity.createdAt,
        metadata: activity.metadata,
        read: activity.read || false
      }));
      
      setActivities(processedActivities);
      
      // Create activity summary
      const activityCounts: Record<string, number> = {};
      const dailyCounts: Record<string, number> = {};
      
      recentActivities.forEach((activity: any) => {
        const type = activity.type || 'UNKNOWN';
        activityCounts[type] = (activityCounts[type] || 0) + 1;
        
        if (activity.createdAt) {
          const date = new Date(activity.createdAt).toISOString().split('T')[0];
          dailyCounts[date] = (dailyCounts[date] || 0) + 1;
        }
      });
      
      setActivitySummary({
        totalActivities: recentActivities.length,
        activityCounts,
        dailyCounts,
        latestActivities: processedActivities.slice(0, 10),
        dateRange: {
          days: 30,
          from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          to: new Date().toISOString()
        }
      });
      
      console.log('✅ User activity loaded successfully');
      
    } catch (error) {
      console.error('❌ Failed to load user activity:', error);
      toast({
        title: "Error",
        description: "Failed to load activity data. Please try again.",
        variant: "destructive",
      });
      
      // Fallback to mock data for demo
      setActivities(getMockActivities());
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount and when authentication changes
  useEffect(() => {
    loadUserActivity();
  }, [isAuthenticated]);

  // Helper function to get user-friendly activity titles
  const getActivityTitle = (type: string): string => {
    const titles: Record<string, string> = {
      'LOGIN': 'Logged In',
      'REGISTRATION': 'Account Created',
      'PROFILE_UPDATED': 'Profile Updated',
      'ONBOARDING_COMPLETED': 'Onboarding Completed',
      'SKILL_ADDED': 'Skill Added',
      'SKILL_UPDATED': 'Skill Updated',
      'SKILL_REMOVED': 'Skill Removed',
      'ROADMAP_GENERATED': 'Roadmap Generated',
      'ROADMAP_PROGRESS': 'Roadmap Progress',
      'ROADMAP_RESET': 'Roadmap Reset',
      'LEARNING_COMPLETED': 'Learning Completed',
      'SETTINGS_UPDATED': 'Settings Updated'
    };
    
    return titles[type] || 'Activity';
  };

  // Helper function to get user-friendly activity descriptions
  const getActivityDescription = (type: string, metadata?: any): string => {
    const skillName = metadata?.skillName || metadata?.skillId || 'a skill';
    const roleName = metadata?.roleName || metadata?.roleId || 'a role';
    
    const descriptions: Record<string, string> = {
      'LOGIN': 'You signed in to your account',
      'REGISTRATION': 'Welcome to SkillBridge! Your account has been created',
      'PROFILE_UPDATED': 'Your profile information has been updated',
      'ONBOARDING_COMPLETED': 'You completed the initial setup process',
      'SKILL_ADDED': `You added ${skillName} to your skill set`,
      'SKILL_UPDATED': `You updated your proficiency in ${skillName}`,
      'SKILL_REMOVED': `You removed ${skillName} from your skills`,
      'ROADMAP_GENERATED': `Learning roadmap generated for ${roleName}`,
      'ROADMAP_PROGRESS': `You made progress on your learning roadmap`,
      'ROADMAP_RESET': 'You reset your learning roadmap',
      'LEARNING_COMPLETED': 'You completed a learning resource',
      'SETTINGS_UPDATED': 'Your account settings have been updated'
    };
    
    return descriptions[type] || 'Activity occurred';
  };

  // Mock activities for fallback
  const getMockActivities = (): Activity[] => [
    {
      id: "1",
      type: "SKILL_ADDED",
      title: "Skill Added",
      description: "You've added React to your skill set",
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      read: false,
    },
    {
      id: "2",
      type: "ROADMAP_PROGRESS",
      title: "Roadmap Progress",
      description: "You completed a milestone in your learning roadmap",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      read: false,
    },
    {
      id: "3",
      type: "PROFILE_UPDATED",
      title: "Profile Updated",
      description: "Your profile information has been updated",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      read: true,
    },
    {
      id: "4",
      type: "LOGIN",
      title: "Logged In",
      description: "You signed in to your account",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      read: true,
    },
  ];

  const markAsRead = (id: string) => {
    setActivities(activities.map(a => a.id === id ? { ...a, read: true } : a));
  };

  const markAllAsRead = () => {
    setActivities(activities.map(a => ({ ...a, read: true })));
  };

  const getActivityIcon = (type: string) => {
    const icons: Record<string, JSX.Element> = {
      'SKILL_ADDED': <CheckCircle className="h-5 w-5 text-accent" />,
      'SKILL_UPDATED': <TrendingUp className="h-5 w-5 text-primary" />,
      'SKILL_REMOVED': <Target className="h-5 w-5 text-muted-foreground" />,
      'ROADMAP_GENERATED': <BookOpen className="h-5 w-5 text-info" />,
      'ROADMAP_PROGRESS': <Award className="h-5 w-5 text-warning" />,
      'ROADMAP_RESET': <Clock className="h-5 w-5 text-muted-foreground" />,
      'PROFILE_UPDATED': <User className="h-5 w-5 text-primary" />,
      'SETTINGS_UPDATED': <Settings className="h-5 w-5 text-muted-foreground" />,
      'LOGIN': <CheckCircle className="h-5 w-5 text-accent" />,
      'REGISTRATION': <Star className="h-5 w-5 text-warning" />,
      'ONBOARDING_COMPLETED': <Award className="h-5 w-5 text-warning" />,
      'LEARNING_COMPLETED': <BookOpen className="h-5 w-5 text-info" />
    };
    
    return icons[type] || <Bell className="h-5 w-5 text-muted-foreground" />;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const unreadCount = activities.filter(a => !a.read).length;

  const filterActivities = (type: string) => {
    if (type === "all") return activities;
    if (type === "unread") return activities.filter(a => !a.read);
    if (type === "skills") return activities.filter(a => a.type.includes('SKILL'));
    if (type === "roadmap") return activities.filter(a => a.type.includes('ROADMAP'));
    if (type === "profile") return activities.filter(a => ['PROFILE_UPDATED', 'SETTINGS_UPDATED', 'ONBOARDING_COMPLETED'].includes(a.type));
    return activities.filter(a => a.type === type);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <h3 className="text-lg font-semibold mb-2">Loading Activity</h3>
            <p className="text-muted-foreground">Fetching your recent activities...</p>
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Bell className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Activity Center</h1>
                <p className="text-muted-foreground">Stay updated on your progress</p>
              </div>
            </div>
            {unreadCount > 0 && (
              <Button variant="outline" onClick={markAllAsRead}>
                <CheckCheck className="h-4 w-4 mr-2" />
                Mark all as read
              </Button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bell className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{unreadCount}</p>
                  <p className="text-sm text-muted-foreground">Unread</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{activitySummary?.activityCounts['SKILL_ADDED'] || activities.filter(a => a.type.includes('SKILL')).length}</p>
                  <p className="text-sm text-muted-foreground">Skills</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-warning/10 flex items-center justify-center">
                  <Award className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{activitySummary?.activityCounts['ROADMAP_PROGRESS'] || activities.filter(a => a.type.includes('ROADMAP')).length}</p>
                  <p className="text-sm text-muted-foreground">Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-info/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-info" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{activitySummary?.totalActivities || activities.length}</p>
                  <p className="text-sm text-muted-foreground">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity Feed */}
        <Card>
          <CardHeader>
            <CardTitle>Activity Feed</CardTitle>
            <CardDescription>All your recent activity and notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="space-y-4">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="unread">
                  Unread {unreadCount > 0 && <Badge className="ml-1 h-5 w-5 p-0 text-xs">{unreadCount}</Badge>}
                </TabsTrigger>
                <TabsTrigger value="skills">Skills</TabsTrigger>
                <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
                <TabsTrigger value="profile">Profile</TabsTrigger>
              </TabsList>

              {["all", "unread", "skills", "roadmap", "profile"].map(tab => (
                <TabsContent key={tab} value={tab} className="space-y-2">
                  {filterActivities(tab).length > 0 ? (
                    filterActivities(tab).map(activity => (
                      <div
                        key={activity.id}
                        className={`flex items-start gap-4 p-4 rounded-lg border transition-colors cursor-pointer ${
                          activity.read ? "bg-card" : "bg-primary/5 border-primary/20"
                        }`}
                        onClick={() => markAsRead(activity.id)}
                      >
                        <div className="mt-1">{getActivityIcon(activity.type)}</div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{activity.title}</h4>
                            <span className="text-xs text-muted-foreground">
                              {formatTimestamp(activity.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{activity.description}</p>
                        </div>
                        {!activity.read && (
                          <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No activities in this category</p>
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};
