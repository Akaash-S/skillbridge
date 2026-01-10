import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAppData } from "@/context/AppDataContext";
import { History, Calendar, Clock, Award, RefreshCw, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

export const LearningHistory = () => {
  const { userSkills, roadmap } = useAppData();
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterDate, setFilterDate] = useState<string>("all");

  // Mock learning history data
  const learningHistory = [
    ...userSkills.map((skill, index) => ({
      id: skill.id,
      skillName: skill.name,
      category: skill.category,
      completedAt: new Date(Date.now() - (index * 7 * 24 * 60 * 60 * 1000)).toISOString(),
      timeSpent: `${Math.floor(Math.random() * 40) + 10} hours`,
      proficiency: skill.proficiency,
      badge: index < 3 ? "Early Adopter" : null,
    })),
    ...roadmap.filter(r => r.completed).map((item, index) => ({
      id: item.skillId,
      skillName: item.skillName,
      category: "Roadmap",
      completedAt: new Date(Date.now() - (index * 3 * 24 * 60 * 60 * 1000)).toISOString(),
      timeSpent: item.estimatedTime,
      proficiency: item.difficulty,
      badge: "Roadmap Complete",
    })),
  ];

  // Badges earned
  const badges = [
    { id: "first-skill", name: "First Steps", description: "Added your first skill", earned: userSkills.length > 0, icon: "🎯" },
    { id: "five-skills", name: "Skill Collector", description: "Added 5 skills", earned: userSkills.length >= 5, icon: "⭐" },
    { id: "ten-skills", name: "Knowledge Seeker", description: "Added 10 skills", earned: userSkills.length >= 10, icon: "🏆" },
    { id: "roadmap-start", name: "Path Finder", description: "Started a learning roadmap", earned: roadmap.length > 0, icon: "🗺️" },
    { id: "advanced", name: "Expert", description: "Reached advanced in any skill", earned: userSkills.some(s => s.proficiency === "advanced"), icon: "💎" },
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const filteredHistory = learningHistory.filter(item => {
    if (filterRole !== "all" && item.category !== filterRole) return false;
    if (filterDate !== "all") {
      const itemDate = new Date(item.completedAt);
      const now = new Date();
      if (filterDate === "week" && (now.getTime() - itemDate.getTime()) > 7 * 24 * 60 * 60 * 1000) return false;
      if (filterDate === "month" && (now.getTime() - itemDate.getTime()) > 30 * 24 * 60 * 60 * 1000) return false;
    }
    return true;
  });

  const categories = [...new Set(learningHistory.map(h => h.category))];

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <History className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Learning History</h1>
              <p className="text-muted-foreground">Track your learning journey over time</p>
            </div>
          </div>
        </div>

        {/* Badges Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-warning" />
              Skill Badges Earned
            </CardTitle>
            <CardDescription>Achievements unlocked on your learning journey</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {badges.map(badge => (
                <div
                  key={badge.id}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border ${
                    badge.earned 
                      ? "bg-primary/10 border-primary/30" 
                      : "bg-muted/50 border-muted opacity-50"
                  }`}
                >
                  <span className="text-xl">{badge.icon}</span>
                  <div>
                    <p className="text-sm font-medium">{badge.name}</p>
                    <p className="text-xs text-muted-foreground">{badge.description}</p>
                  </div>
                  {badge.earned && (
                    <Badge className="bg-accent text-xs">Earned</Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Filter by:</span>
          </div>
          <Select value={filterRole} onValueChange={setFilterRole}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterDate} onValueChange={setFilterDate}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Time period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Timeline View */}
        <Card>
          <CardHeader>
            <CardTitle>Learning Timeline</CardTitle>
            <CardDescription>Your skill acquisition journey</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredHistory.length > 0 ? (
              <div className="relative space-y-0">
                <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
                {filteredHistory.map((item, index) => (
                  <div key={`${item.id}-${index}`} className="relative pl-10 pb-8 last:pb-0">
                    <div className="absolute left-2 w-4 h-4 rounded-full bg-primary border-4 border-background" />
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{item.skillName}</h4>
                          <Badge variant="outline" className="text-xs">{item.proficiency}</Badge>
                          {item.badge && (
                            <Badge className="bg-warning text-xs">{item.badge}</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{item.category}</p>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(item.completedAt)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {item.timeSpent}
                        </div>
                        <Button variant="ghost" size="sm" className="h-8">
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Revise
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No learning history yet. Start adding skills!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};
