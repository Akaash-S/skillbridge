import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAppData } from "@/context/AppDataContext";
import { FileText, Upload, CheckCircle, AlertTriangle, XCircle, Lightbulb, Target, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export const ResumeIntelligence = () => {
  const { userSkills, selectedRole } = useAppData();
  const [resumeUploaded, setResumeUploaded] = useState(false);

  // Mock resume analysis data (would come from actual resume parsing)
  const mockResumeAnalysis = {
    overallScore: 72,
    sections: {
      experience: { score: 85, status: "good" as const },
      education: { score: 90, status: "good" as const },
      skills: { score: 65, status: "warning" as const },
      projects: { score: 50, status: "poor" as const },
      summary: { score: 70, status: "warning" as const },
    },
    skillsCoverage: {
      matched: ["JavaScript", "React", "TypeScript", "HTML", "CSS"],
      missing: ["Node.js", "PostgreSQL", "Docker", "AWS"],
    },
    keywords: {
      found: ["React", "JavaScript", "Frontend", "Agile", "Git"],
      recommended: ["TypeScript", "REST API", "Testing", "CI/CD", "Performance"],
    },
    suggestions: [
      { type: "critical", text: "Add more project descriptions with quantifiable achievements" },
      { type: "warning", text: "Include more technical keywords relevant to your target role" },
      { type: "info", text: "Consider adding a summary section that highlights your key strengths" },
      { type: "tip", text: "Use action verbs to describe your experience" },
    ],
  };

  const getStatusColor = (status: "good" | "warning" | "poor") => {
    switch (status) {
      case "good": return "text-accent";
      case "warning": return "text-warning";
      case "poor": return "text-destructive";
    }
  };

  const getStatusIcon = (status: "good" | "warning" | "poor") => {
    switch (status) {
      case "good": return <CheckCircle className="h-4 w-4" />;
      case "warning": return <AlertTriangle className="h-4 w-4" />;
      case "poor": return <XCircle className="h-4 w-4" />;
    }
  };

  const getSuggestionStyle = (type: string) => {
    switch (type) {
      case "critical": return "border-destructive/50 bg-destructive/10";
      case "warning": return "border-warning/50 bg-warning/10";
      case "info": return "border-primary/50 bg-primary/10";
      case "tip": return "border-accent/50 bg-accent/10";
      default: return "";
    }
  };

  if (!resumeUploaded) {
    return (
      <Layout>
        <div className="space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Resume Intelligence</h1>
                <p className="text-muted-foreground">Turn your resume into a living artifact</p>
              </div>
            </div>
          </div>

          {/* Upload Section */}
          <Card className="border-2 border-dashed border-primary/30">
            <CardContent className="pt-12 pb-12">
              <div className="text-center space-y-6">
                <div className="h-20 w-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                  <Upload className="h-10 w-10 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">Upload Your Resume</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Get instant analysis of your resume's effectiveness, skill coverage, and alignment with your target roles.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button size="lg" onClick={() => setResumeUploaded(true)}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Resume (PDF)
                  </Button>
                  <p className="text-sm text-muted-foreground">or drag and drop</p>
                </div>
                <p className="text-xs text-muted-foreground">Supported: PDF, DOCX, TXT (Max 5MB)</p>
              </div>
            </CardContent>
          </Card>
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
                <FileText className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Resume Intelligence</h1>
                <p className="text-muted-foreground">Analysis of your resume</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => setResumeUploaded(false)}>
              <Upload className="h-4 w-4 mr-2" />
              Upload New
            </Button>
          </div>
        </div>

        {/* Overall Score */}
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative">
                <div className="h-32 w-32 rounded-full border-8 border-primary flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl font-bold">{mockResumeAnalysis.overallScore}</div>
                    <p className="text-sm text-muted-foreground">Score</p>
                  </div>
                </div>
              </div>
              <div className="flex-1 space-y-2 text-center md:text-left">
                <h3 className="text-xl font-semibold">Resume Health: Good</h3>
                <p className="text-muted-foreground">
                  Your resume is solid but has room for improvement. Focus on adding more project details and relevant keywords.
                </p>
                {selectedRole && (
                  <Badge variant="outline">
                    <Target className="h-3 w-3 mr-1" />
                    Analyzed for: {selectedRole.title}
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section Scores */}
        <Card>
          <CardHeader>
            <CardTitle>Resume Sections Health</CardTitle>
            <CardDescription>How each section of your resume performs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(mockResumeAnalysis.sections).map(([section, data]) => (
                <div key={section} className="flex items-center gap-4">
                  <div className="w-24 capitalize font-medium">{section}</div>
                  <div className="flex-1">
                    <Progress value={data.score} className="h-2" />
                  </div>
                  <div className={`flex items-center gap-1 w-20 ${getStatusColor(data.status)}`}>
                    {getStatusIcon(data.status)}
                    <span className="text-sm">{data.score}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Skills Coverage */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-accent" />
                Skills Found
              </CardTitle>
              <CardDescription>Skills mentioned in your resume</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {mockResumeAnalysis.skillsCoverage.matched.map(skill => (
                  <Badge key={skill} className="bg-accent">{skill}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                Missing Skills
              </CardTitle>
              <CardDescription>Skills you should consider adding</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {mockResumeAnalysis.skillsCoverage.missing.map(skill => (
                  <Badge key={skill} variant="outline">{skill}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Keywords */}
        <Card>
          <CardHeader>
            <CardTitle>Keyword Analysis</CardTitle>
            <CardDescription>Keywords ATS systems look for</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Keywords Found</h4>
                <div className="flex flex-wrap gap-2">
                  {mockResumeAnalysis.keywords.found.map(keyword => (
                    <Badge key={keyword} variant="secondary">{keyword}</Badge>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Recommended to Add</h4>
                <div className="flex flex-wrap gap-2">
                  {mockResumeAnalysis.keywords.recommended.map(keyword => (
                    <Badge key={keyword} variant="outline" className="border-primary/50">{keyword}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Suggestions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-warning" />
              Improvement Suggestions
            </CardTitle>
            <CardDescription>Actionable tips to improve your resume</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockResumeAnalysis.suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${getSuggestionStyle(suggestion.type)}`}
                >
                  <p className="text-sm">{suggestion.text}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};
