import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { Layout } from "@/components/Layout";
import { ProgressCircle } from "@/components/ProgressCircle";
import { SkillChip } from "@/components/SkillChip";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle, AlertCircle, ArrowRight, BarChart3, RefreshCw } from "lucide-react";

export const Analysis = () => {
  const { selectedRole, analysis, userSkills, analyzeSkillGap, generateRoadmap } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    if (!selectedRole) {
      navigate("/roles");
      return;
    }
    if (!analysis) {
      analyzeSkillGap();
    }
  }, [selectedRole, analysis, analyzeSkillGap, navigate]);

  const handleViewRoadmap = () => {
    generateRoadmap();
    navigate("/roadmap");
  };

  const handleReAnalyze = () => {
    analyzeSkillGap();
  };

  if (!selectedRole || !analysis) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-pulse text-muted-foreground">Analyzing skills...</div>
        </div>
      </Layout>
    );
  }

  const getScoreMessage = () => {
    if (analysis.readinessScore >= 80) return "You're almost there!";
    if (analysis.readinessScore >= 60) return "Good progress, keep learning!";
    if (analysis.readinessScore >= 40) return "You're on your way!";
    return "Time to start building skills!";
  };

  const getScoreColor = () => {
    if (analysis.readinessScore >= 70) return "text-progress-high";
    if (analysis.readinessScore >= 40) return "text-progress-medium";
    return "text-progress-low";
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <BarChart3 className="h-4 w-4" />
            Step 3 of 3
          </div>
          <h1 className="text-3xl font-bold">Skill Gap Analysis</h1>
          <p className="text-muted-foreground">
            Here's how your skills match up against <span className="font-medium text-foreground">{selectedRole.title}</span>
          </p>
        </div>

        {/* Readiness Score */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-br from-primary/5 to-accent/5 p-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <ProgressCircle value={analysis.readinessScore} size="xl" />
              <div className="text-center md:text-left">
                <h2 className="text-2xl font-bold mb-2">Role Readiness Score</h2>
                <p className={`text-xl font-semibold ${getScoreColor()}`}>
                  {getScoreMessage()}
                </p>
                <p className="text-muted-foreground mt-2">
                  You have {analysis.matchedSkills.length} of {selectedRole.requiredSkills.length} required skills at the needed level.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Skills Breakdown */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Matched Skills */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-progress-high" />
                <CardTitle className="text-lg">Matched Skills</CardTitle>
              </div>
              <CardDescription>
                Skills you have at the required level
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analysis.matchedSkills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {analysis.matchedSkills.map(({ skill }) => (
                    <SkillChip
                      key={skill.id}
                      name={skill.name}
                      proficiency={skill.proficiency}
                      size="sm"
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No fully matched skills yet.</p>
              )}
            </CardContent>
          </Card>

          {/* Partial Skills */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-progress-medium" />
                <CardTitle className="text-lg">Need Improvement</CardTitle>
              </div>
              <CardDescription>
                Skills that need higher proficiency
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analysis.partialSkills.length > 0 ? (
                <div className="space-y-2">
                  {analysis.partialSkills.map(({ skill, required }) => (
                    <div key={skill.id} className="flex items-center justify-between text-sm">
                      <span>{skill.name}</span>
                      <span className="text-muted-foreground">
                        {skill.proficiency} → {required}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No partial matches.</p>
              )}
            </CardContent>
          </Card>

          {/* Missing Skills */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-progress-low" />
                <CardTitle className="text-lg">Missing Skills</CardTitle>
              </div>
              <CardDescription>
                Skills you need to learn
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analysis.missingSkills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {analysis.missingSkills.map((skill) => (
                    <SkillChip
                      key={skill.skillId}
                      name={skill.skillName}
                      proficiency={skill.required}
                      size="sm"
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No missing skills!</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="outline" onClick={handleReAnalyze}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Re-analyze
          </Button>
          <Link to="/skills">
            <Button variant="outline">Update My Skills</Button>
          </Link>
          <Button onClick={handleViewRoadmap} size="lg" className="group">
            View Learning Roadmap
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </Layout>
  );
};
