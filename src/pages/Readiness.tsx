import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAppData } from "@/context/AppDataContext";
import { jobRolesDatabase } from "@/data/mockData";
import { CheckCircle2, Circle, AlertCircle, FileText, Users, Briefcase, Rocket, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";

interface ReadinessItem {
  id: string;
  label: string;
  completed: boolean;
  category: "skills" | "resume" | "portfolio" | "interview";
}

export const Readiness = () => {
  const { userSkills, selectedRole, analysis } = useAppData();
  
  const [checklist, setChecklist] = useState<ReadinessItem[]>([
    { id: "skills-added", label: "Added all current skills", completed: userSkills.length > 0, category: "skills" },
    { id: "target-role", label: "Selected target role", completed: !!selectedRole, category: "skills" },
    { id: "gap-analysis", label: "Completed skill gap analysis", completed: !!analysis, category: "skills" },
    { id: "roadmap-started", label: "Started learning roadmap", completed: false, category: "skills" },
    { id: "resume-uploaded", label: "Resume uploaded", completed: false, category: "resume" },
    { id: "resume-keywords", label: "Resume has relevant keywords", completed: false, category: "resume" },
    { id: "resume-format", label: "Resume properly formatted", completed: false, category: "resume" },
    { id: "portfolio-created", label: "Portfolio website created", completed: false, category: "portfolio" },
    { id: "portfolio-projects", label: "3+ projects showcased", completed: false, category: "portfolio" },
    { id: "github-active", label: "Active GitHub profile", completed: false, category: "portfolio" },
    { id: "interview-prep", label: "Completed interview prep course", completed: false, category: "interview" },
    { id: "mock-interview", label: "Did mock interview", completed: false, category: "interview" },
    { id: "behavioral-prep", label: "Prepared behavioral answers", completed: false, category: "interview" },
  ]);

  const toggleItem = (id: string) => {
    setChecklist(prev => 
      prev.map(item => item.id === id ? { ...item, completed: !item.completed } : item)
    );
  };

  const completedCount = checklist.filter(c => c.completed).length;
  const totalCount = checklist.length;
  const overallReadiness = Math.round((completedCount / totalCount) * 100);

  const categoryReadiness = (category: ReadinessItem["category"]) => {
    const items = checklist.filter(c => c.category === category);
    const completed = items.filter(c => c.completed).length;
    return Math.round((completed / items.length) * 100);
  };

  const getReadinessTag = (percentage: number) => {
    if (percentage >= 80) return { label: "Ready", color: "bg-accent text-accent-foreground", icon: CheckCircle2 };
    if (percentage >= 50) return { label: "Almost Ready", color: "bg-warning text-warning-foreground", icon: AlertCircle };
    return { label: "Not Ready", color: "bg-destructive text-destructive-foreground", icon: Circle };
  };

  const overallTag = getReadinessTag(overallReadiness);

  // Role-wise readiness
  const roleReadiness = jobRolesDatabase.slice(0, 4).map(role => {
    const requiredSkillIds = role.requiredSkills.map(s => s.skillId);
    const userSkillIds = userSkills.map(s => s.id);
    const matchedSkills = requiredSkillIds.filter(id => userSkillIds.includes(id));
    const readiness = Math.round((matchedSkills.length / requiredSkillIds.length) * 100);
    return { ...role, readiness };
  });

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Rocket className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Application Readiness</h1>
              <p className="text-muted-foreground">Are you ready to apply? Let's find out.</p>
            </div>
          </div>
        </div>

        {/* Overall Readiness */}
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative">
                <div className="h-32 w-32 rounded-full border-8 border-primary/20 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl font-bold">{overallReadiness}%</div>
                    <p className="text-sm text-muted-foreground">Ready</p>
                  </div>
                </div>
              </div>
              <div className="flex-1 space-y-4 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <Badge className={overallTag.color}>
                    <overallTag.icon className="h-4 w-4 mr-1" />
                    {overallTag.label}
                  </Badge>
                </div>
                <p className="text-muted-foreground">
                  You've completed {completedCount} of {totalCount} readiness items. 
                  {overallReadiness < 80 
                    ? " Complete more items to improve your application readiness."
                    : " You're well prepared to start applying!"}
                </p>
                <Progress value={overallReadiness} className="h-3" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <div className="grid md:grid-cols-4 gap-4">
          {[
            { category: "skills" as const, label: "Skills", icon: Target },
            { category: "resume" as const, label: "Resume", icon: FileText },
            { category: "portfolio" as const, label: "Portfolio", icon: Briefcase },
            { category: "interview" as const, label: "Interview", icon: Users },
          ].map(({ category, label, icon: Icon }) => {
            const readiness = categoryReadiness(category);
            const tag = getReadinessTag(readiness);
            return (
              <Card key={category}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Icon className="h-5 w-5 text-primary" />
                    {label}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">{readiness}%</span>
                    <Badge className={tag.color}>{tag.label}</Badge>
                  </div>
                  <Progress value={readiness} className="h-2" />
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Role-wise Readiness */}
        <Card>
          <CardHeader>
            <CardTitle>Role-Specific Readiness</CardTitle>
            <CardDescription>Your readiness level for different job roles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {roleReadiness.sort((a, b) => b.readiness - a.readiness).map(role => {
                const tag = getReadinessTag(role.readiness);
                return (
                  <div key={role.id} className="flex items-center gap-4 p-4 rounded-lg border">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{role.title}</h4>
                        <Badge className={tag.color}>{tag.label}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{role.category}</p>
                    </div>
                    <div className="w-32">
                      <Progress value={role.readiness} className="h-2" />
                    </div>
                    <div className="w-16 text-right font-bold">{role.readiness}%</div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Readiness Checklist */}
        <Card>
          <CardHeader>
            <CardTitle>Readiness Checklist</CardTitle>
            <CardDescription>Complete these items to improve your application readiness</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {(["skills", "resume", "portfolio", "interview"] as const).map(category => (
                <div key={category} className="space-y-3">
                  <h4 className="font-medium capitalize flex items-center gap-2">
                    {category === "skills" && <Target className="h-4 w-4" />}
                    {category === "resume" && <FileText className="h-4 w-4" />}
                    {category === "portfolio" && <Briefcase className="h-4 w-4" />}
                    {category === "interview" && <Users className="h-4 w-4" />}
                    {category} Readiness
                  </h4>
                  <div className="space-y-2">
                    {checklist.filter(c => c.category === category).map(item => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                      >
                        <Checkbox
                          id={item.id}
                          checked={item.completed}
                          onCheckedChange={() => toggleItem(item.id)}
                        />
                        <label
                          htmlFor={item.id}
                          className={`flex-1 text-sm cursor-pointer ${item.completed ? "line-through text-muted-foreground" : ""}`}
                        >
                          {item.label}
                        </label>
                        {item.completed && <CheckCircle2 className="h-4 w-4 text-accent" />}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};
