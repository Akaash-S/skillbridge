import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useApp } from "@/context/AppContext";
import { jobRolesDatabase, skillsDatabase } from "@/data/mockData";
import { Target, TrendingUp, Clock, DollarSign, ArrowRight, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const CareerHub = () => {
  const { userSkills, selectedRole } = useApp();
  const navigate = useNavigate();

  // Calculate skill overlap for each role
  const calculateRoleMatch = (role: typeof jobRolesDatabase[0]) => {
    const requiredSkillIds = role.requiredSkills.map(s => s.skillId);
    const userSkillIds = userSkills.map(s => s.id);
    const overlap = requiredSkillIds.filter(id => userSkillIds.includes(id));
    return Math.round((overlap.length / requiredSkillIds.length) * 100);
  };

  // Get adjacent roles (similar skill requirements)
  const getAdjacentRoles = () => {
    if (!selectedRole) return jobRolesDatabase.slice(0, 4);
    
    const targetSkills = selectedRole.requiredSkills.map(s => s.skillId);
    return jobRolesDatabase
      .filter(role => role.id !== selectedRole.id)
      .map(role => {
        const roleSkills = role.requiredSkills.map(s => s.skillId);
        const overlap = targetSkills.filter(s => roleSkills.includes(s)).length;
        return { ...role, similarity: overlap / Math.max(targetSkills.length, roleSkills.length) };
      })
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 4);
  };

  const adjacentRoles = getAdjacentRoles();

  // Time to ready estimate based on missing skills
  const getTimeToReady = (matchPercentage: number) => {
    if (matchPercentage >= 80) return "1-2 months";
    if (matchPercentage >= 60) return "3-4 months";
    if (matchPercentage >= 40) return "5-6 months";
    return "6+ months";
  };

  // Difficulty indicator
  const getDifficulty = (matchPercentage: number) => {
    if (matchPercentage >= 70) return { label: "Easy Transition", color: "bg-accent text-accent-foreground" };
    if (matchPercentage >= 40) return { label: "Moderate", color: "bg-warning text-warning-foreground" };
    return { label: "Challenging", color: "bg-destructive text-destructive-foreground" };
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Target className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Career Hub</h1>
              <p className="text-muted-foreground">Your intelligent career planning center</p>
            </div>
          </div>
        </div>

        {/* Primary Target Role */}
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <CardTitle>Primary Career Goal</CardTitle>
              </div>
              {selectedRole && (
                <Badge variant="secondary">{selectedRole.category}</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {selectedRole ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-2xl font-bold">{selectedRole.title}</h3>
                    <p className="text-muted-foreground mt-1">{selectedRole.description}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <DollarSign className="h-4 w-4" />
                      Salary Range
                    </div>
                    <p className="font-semibold">{selectedRole.avgSalary}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <TrendingUp className="h-4 w-4" />
                      Market Demand
                    </div>
                    <Badge className={
                      selectedRole.demand === "high" ? "bg-accent" :
                      selectedRole.demand === "medium" ? "bg-warning" : "bg-muted"
                    }>
                      {selectedRole.demand.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Zap className="h-4 w-4" />
                      Your Match
                    </div>
                    <p className="font-semibold">{calculateRoleMatch(selectedRole)}%</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      Time to Ready
                    </div>
                    <p className="font-semibold">{getTimeToReady(calculateRoleMatch(selectedRole))}</p>
                  </div>
                </div>
                <Progress value={calculateRoleMatch(selectedRole)} className="h-2" />
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No target role selected yet</p>
                <Button onClick={() => navigate("/roles")}>
                  Choose Your Target Role
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Adjacent Roles */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">Adjacent Career Paths</h2>
            <Badge variant="outline">Based on your skills</Badge>
          </div>
          <p className="text-muted-foreground">
            {selectedRole 
              ? "If you like " + selectedRole.title + ", you might also consider these roles"
              : "Explore these career paths based on your current skills"}
          </p>
          
          <div className="grid md:grid-cols-2 gap-4">
            {adjacentRoles.map((role) => {
              const matchPercentage = calculateRoleMatch(role);
              const difficulty = getDifficulty(matchPercentage);
              
              return (
                <Card key={role.id} className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => navigate("/roles")}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{role.title}</CardTitle>
                        <CardDescription className="line-clamp-2">{role.description}</CardDescription>
                      </div>
                      <Badge className={difficulty.color}>{difficulty.label}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Skill Match</span>
                        <span className="font-medium">{matchPercentage}%</span>
                      </div>
                      <Progress value={matchPercentage} className="h-1.5" />
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <DollarSign className="h-3 w-3" />
                          {role.avgSalary}
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {getTimeToReady(matchPercentage)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Career Switch Suggestions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-accent" />
              Career Switch Insights
            </CardTitle>
            <CardDescription>Smart suggestions based on industry trends and your profile</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { from: "Frontend Developer", to: "Full Stack Developer", reason: "Only 2 backend skills away", growth: "+15% salary" },
                { from: "Backend Developer", to: "DevOps Engineer", reason: "High transferable skills", growth: "+20% demand" },
                { from: "Data Scientist", to: "ML Engineer", reason: "Production focus trending", growth: "+25% salary" },
              ].map((suggestion, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-sm">
                      <Badge variant="outline">{suggestion.from}</Badge>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      <Badge className="bg-primary">{suggestion.to}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{suggestion.reason}</p>
                  </div>
                  <Badge variant="secondary" className="bg-accent/10 text-accent">
                    {suggestion.growth}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};
