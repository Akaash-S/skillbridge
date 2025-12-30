import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useApp } from "@/context/AppContext";
import { Bell, CheckCircle, Target, TrendingUp, Award, Clock, Filter, CheckCheck, Star, Briefcase } from "lucide-react";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Activity {
  id: string;
  type: "skill" | "readiness" | "role" | "reminder" | "achievement";
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
}

export const Activity = () => {
  const { userSkills } = useApp();

  const [activities, setActivities] = useState<Activity[]>([
    {
      id: "1",
      type: "skill",
      title: "Skill Completed",
      description: "You've marked React as advanced proficiency",
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      read: false,
    },
    {
      id: "2",
      type: "readiness",
      title: "Readiness Updated",
      description: "Your Frontend Developer readiness is now 85%",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      read: false,
    },
    {
      id: "3",
      type: "role",
      title: "New Role Match",
      description: "You now qualify for Full Stack Developer positions",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      read: true,
    },
    {
      id: "4",
      type: "reminder",
      title: "Learning Reminder",
      description: "Don't forget to complete your TypeScript roadmap item",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      read: true,
    },
    {
      id: "5",
      type: "achievement",
      title: "Achievement Unlocked",
      description: "You've earned the 'Quick Learner' badge",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      read: true,
    },
    {
      id: "6",
      type: "skill",
      title: "New Skill Added",
      description: "You've added Node.js to your skill set",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
      read: true,
    },
    {
      id: "7",
      type: "readiness",
      title: "Portfolio Milestone",
      description: "Added 3 projects to your portfolio",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
      read: true,
    },
    {
      id: "8",
      type: "achievement",
      title: "Streak Achieved",
      description: "7-day learning streak! Keep it up!",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
      read: true,
    },
  ]);

  const markAsRead = (id: string) => {
    setActivities(activities.map(a => a.id === id ? { ...a, read: true } : a));
  };

  const markAllAsRead = () => {
    setActivities(activities.map(a => ({ ...a, read: true })));
  };

  const getActivityIcon = (type: Activity["type"]) => {
    switch (type) {
      case "skill": return <CheckCircle className="h-5 w-5 text-accent" />;
      case "readiness": return <TrendingUp className="h-5 w-5 text-primary" />;
      case "role": return <Briefcase className="h-5 w-5 text-info" />;
      case "reminder": return <Clock className="h-5 w-5 text-warning" />;
      case "achievement": return <Award className="h-5 w-5 text-warning" />;
    }
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
    return activities.filter(a => a.type === type);
  };

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
                  <p className="text-2xl font-bold">{activities.filter(a => a.type === "skill").length}</p>
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
                  <p className="text-2xl font-bold">{activities.filter(a => a.type === "achievement").length}</p>
                  <p className="text-sm text-muted-foreground">Achievements</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-info/10 flex items-center justify-center">
                  <Briefcase className="h-5 w-5 text-info" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{activities.filter(a => a.type === "role").length}</p>
                  <p className="text-sm text-muted-foreground">Role Matches</p>
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
                <TabsTrigger value="skill">Skills</TabsTrigger>
                <TabsTrigger value="achievement">Achievements</TabsTrigger>
                <TabsTrigger value="reminder">Reminders</TabsTrigger>
              </TabsList>

              {["all", "unread", "skill", "achievement", "reminder"].map(tab => (
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
                              {formatTimestamp(activity.timestamp)}
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
