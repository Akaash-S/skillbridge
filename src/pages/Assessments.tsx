import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useApp } from "@/context/AppContext";
import { skillsDatabase } from "@/data/mockData";
import { ClipboardCheck, Clock, Trophy, Target, Play, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface Assessment {
  skillId: string;
  skillName: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  questions: number;
  duration: string;
  passed: boolean | null;
  score: number | null;
  takenAt: string | null;
}

export const Assessments = () => {
  const { userSkills } = useApp();
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);

  // Mock assessments based on skills
  const availableAssessments: Assessment[] = skillsDatabase.slice(0, 15).map((skill, index) => {
    const hasTaken = index < 5;
    const passed = hasTaken ? Math.random() > 0.3 : null;
    return {
      skillId: skill.id,
      skillName: skill.name,
      difficulty: index % 3 === 0 ? "beginner" : index % 3 === 1 ? "intermediate" : "advanced",
      questions: 10 + (index % 3) * 5,
      duration: `${10 + (index % 3) * 5} min`,
      passed: hasTaken ? passed : null,
      score: hasTaken ? Math.floor(Math.random() * 40) + 60 : null,
      takenAt: hasTaken ? new Date(Date.now() - index * 3 * 24 * 60 * 60 * 1000).toISOString() : null,
    };
  });

  const completedAssessments = availableAssessments.filter(a => a.passed !== null);
  const passedAssessments = availableAssessments.filter(a => a.passed === true);
  const averageScore = completedAssessments.length > 0
    ? Math.round(completedAssessments.reduce((acc, a) => acc + (a.score || 0), 0) / completedAssessments.length)
    : 0;

  // Confidence meter calculation
  const confidenceScore = userSkills.length > 0
    ? Math.round((passedAssessments.length / Math.max(userSkills.length, 1)) * 100)
    : 0;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "bg-accent text-accent-foreground";
      case "intermediate": return "bg-warning text-warning-foreground";
      case "advanced": return "bg-destructive text-destructive-foreground";
      default: return "bg-muted";
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <ClipboardCheck className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Skill Assessment Center</h1>
              <p className="text-muted-foreground">Validate your skills with assessments</p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5 text-primary" />
                Assessments Taken
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{completedAssessments.length}</div>
              <p className="text-sm text-muted-foreground">of {availableAssessments.length} available</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Trophy className="h-5 w-5 text-warning" />
                Passed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">{passedAssessments.length}</div>
              <p className="text-sm text-muted-foreground">assessments passed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5 text-info" />
                Average Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{averageScore}%</div>
              <Progress value={averageScore} className="h-2 mt-2" />
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary/10 to-accent/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Confidence Meter</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{confidenceScore}%</div>
              <p className="text-sm text-muted-foreground">skill confidence</p>
            </CardContent>
          </Card>
        </div>

        {/* Past Results */}
        {completedAssessments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Past Assessment Results</CardTitle>
              <CardDescription>Your assessment history and scores</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {completedAssessments.map((assessment) => (
                  <div
                    key={assessment.skillId}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card"
                  >
                    <div className="flex items-center gap-3">
                      {assessment.passed ? (
                        <CheckCircle className="h-5 w-5 text-accent" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive" />
                      )}
                      <div>
                        <h4 className="font-medium">{assessment.skillName}</h4>
                        <p className="text-sm text-muted-foreground">
                          {assessment.takenAt && new Date(assessment.takenAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge className={getDifficultyColor(assessment.difficulty)}>
                        {assessment.difficulty}
                      </Badge>
                      <div className="text-right">
                        <div className="font-bold">{assessment.score}%</div>
                        <Badge variant={assessment.passed ? "default" : "destructive"} className="text-xs">
                          {assessment.passed ? "PASSED" : "FAILED"}
                        </Badge>
                      </div>
                      <Button variant="outline" size="sm">
                        Retake
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Available Assessments */}
        <Card>
          <CardHeader>
            <CardTitle>Available Assessments</CardTitle>
            <CardDescription>Test your knowledge and validate your skills</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableAssessments.filter(a => a.passed === null).map((assessment) => (
                <Card key={assessment.skillId} className="border hover:border-primary/50 transition-colors">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{assessment.skillName}</CardTitle>
                      <Badge className={getDifficultyColor(assessment.difficulty)}>
                        {assessment.difficulty}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <ClipboardCheck className="h-4 w-4" />
                        {assessment.questions} questions
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {assessment.duration}
                      </div>
                    </div>
                    <Button className="w-full" onClick={() => setSelectedAssessment(assessment)}>
                      <Play className="h-4 w-4 mr-2" />
                      Start Assessment
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};
