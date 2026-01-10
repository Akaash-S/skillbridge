import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAppData } from "@/context/AppDataContext";
import { skillsDatabase, jobRolesDatabase } from "@/data/mockData";
import { Brain, TrendingUp, TrendingDown, Minus, Briefcase, AlertTriangle, CheckCircle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const SkillIntelligence = () => {
  const { userSkills } = useAppData();

  // Mock skill intelligence data
  const skillIntelligence = skillsDatabase.map(skill => {
    const rolesUsingSkill = jobRolesDatabase.filter(role => 
      role.requiredSkills.some(rs => rs.skillId === skill.id)
    );
    const demandPercentage = Math.round((rolesUsingSkill.length / jobRolesDatabase.length) * 100);
    
    // Mock trend data
    const trends = ["up", "down", "stable"] as const;
    const trend = trends[Math.floor(Math.random() * 3)];
    
    // Mock aging indicator
    const isOutdated = ["angular", "java", "csharp"].includes(skill.id);
    const isHot = ["react", "ts", "python", "kubernetes", "ml", "aws"].includes(skill.id);
    
    return {
      ...skill,
      demand: demandPercentage > 50 ? "high" : demandPercentage > 25 ? "medium" : "low",
      demandPercentage,
      trend,
      isOutdated,
      isHot,
      rolesCount: rolesUsingSkill.length,
      roles: rolesUsingSkill.map(r => r.title),
    };
  });

  const userSkillIds = userSkills.map(s => s.id);
  const mySkillsIntelligence = skillIntelligence.filter(s => userSkillIds.includes(s.id));
  const hotSkills = skillIntelligence.filter(s => s.isHot);
  const outdatedSkills = skillIntelligence.filter(s => s.isOutdated);

  const getTrendIcon = (trend: "up" | "down" | "stable") => {
    switch (trend) {
      case "up": return <TrendingUp className="h-4 w-4 text-accent" />;
      case "down": return <TrendingDown className="h-4 w-4 text-destructive" />;
      case "stable": return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getDemandBadge = (demand: string) => {
    switch (demand) {
      case "high": return <Badge className="bg-accent text-accent-foreground">High Demand</Badge>;
      case "medium": return <Badge className="bg-warning text-warning-foreground">Medium</Badge>;
      case "low": return <Badge variant="secondary">Low</Badge>;
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Brain className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Skill Intelligence</h1>
              <p className="text-muted-foreground">Deep insights into skill value and market demand</p>
            </div>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-accent" />
                Your Skills
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{userSkills.length}</div>
              <p className="text-sm text-muted-foreground">
                {mySkillsIntelligence.filter(s => s.demand === "high").length} high-demand skills
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Hot Skills
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{hotSkills.length}</div>
              <p className="text-sm text-muted-foreground">
                Skills with rising demand
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                Watch Out
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{outdatedSkills.length}</div>
              <p className="text-sm text-muted-foreground">
                Skills showing decline
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Your Skills Analysis */}
        {mySkillsIntelligence.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Your Skills Analysis</CardTitle>
              <CardDescription>How valuable are your current skills in the market</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mySkillsIntelligence.map(skill => (
                  <div key={skill.id} className="p-4 rounded-lg border bg-card space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold">{skill.name}</h4>
                        <p className="text-xs text-muted-foreground">{skill.category}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {getTrendIcon(skill.trend)}
                        {skill.isHot && <Badge className="bg-primary text-xs">HOT</Badge>}
                        {skill.isOutdated && <Badge variant="destructive" className="text-xs">AGING</Badge>}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Market Demand</span>
                        <span>{skill.demandPercentage}%</span>
                      </div>
                      <Progress value={skill.demandPercentage} className="h-1.5" />
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Briefcase className="h-3 w-3" />
                      Used in {skill.rolesCount} roles
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Skill Comparison Table */}
        <Card>
          <CardHeader>
            <CardTitle>Market Skill Comparison</CardTitle>
            <CardDescription>Compare skill demand across all tracked skills</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Skill</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Demand</TableHead>
                    <TableHead>Trend</TableHead>
                    <TableHead>Used In</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {skillIntelligence
                    .sort((a, b) => b.demandPercentage - a.demandPercentage)
                    .slice(0, 15)
                    .map(skill => (
                      <TableRow key={skill.id} className={userSkillIds.includes(skill.id) ? "bg-primary/5" : ""}>
                        <TableCell className="font-medium">
                          {skill.name}
                          {userSkillIds.includes(skill.id) && (
                            <Badge variant="outline" className="ml-2 text-xs">You have this</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{skill.category}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={skill.demandPercentage} className="h-1.5 w-16" />
                            <span className="text-sm">{skill.demandPercentage}%</span>
                          </div>
                        </TableCell>
                        <TableCell>{getTrendIcon(skill.trend)}</TableCell>
                        <TableCell>
                          <span className="text-sm">{skill.rolesCount} roles</span>
                        </TableCell>
                        <TableCell>
                          {skill.isHot && <Badge className="bg-accent text-xs">Rising</Badge>}
                          {skill.isOutdated && <Badge variant="secondary" className="text-xs">Declining</Badge>}
                          {!skill.isHot && !skill.isOutdated && <Badge variant="outline" className="text-xs">Stable</Badge>}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};
