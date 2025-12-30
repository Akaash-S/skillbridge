import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useApp } from "@/context/AppContext";
import { Briefcase, ExternalLink, Users, Code2, Trophy, Heart, MapPin, Clock, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Opportunity {
  id: string;
  title: string;
  company: string;
  type: "internship" | "freelance" | "opensource" | "hackathon" | "volunteer";
  location: string;
  remote: boolean;
  skills: string[];
  matchScore: number;
  deadline?: string;
  description: string;
}

export const Opportunities = () => {
  const { userSkills } = useApp();

  // Mock opportunities data
  const opportunities: Opportunity[] = [
    {
      id: "1",
      title: "Frontend Developer Intern",
      company: "TechStartup Inc.",
      type: "internship",
      location: "San Francisco, CA",
      remote: true,
      skills: ["react", "ts", "tailwind"],
      matchScore: 85,
      deadline: "2024-02-15",
      description: "Join our team to build modern web applications using React and TypeScript.",
    },
    {
      id: "2",
      title: "React Dashboard Project",
      company: "Upwork Client",
      type: "freelance",
      location: "Remote",
      remote: true,
      skills: ["react", "js", "css"],
      matchScore: 92,
      description: "Build an analytics dashboard with charts and real-time data.",
    },
    {
      id: "3",
      title: "Contribute to React Query",
      company: "TanStack",
      type: "opensource",
      location: "GitHub",
      remote: true,
      skills: ["react", "ts"],
      matchScore: 78,
      description: "Help improve the most popular data-fetching library for React.",
    },
    {
      id: "4",
      title: "AI/ML Hackathon 2024",
      company: "HackOrg",
      type: "hackathon",
      location: "Virtual",
      remote: true,
      skills: ["python", "ml", "tensorflow"],
      matchScore: 65,
      deadline: "2024-01-30",
      description: "48-hour hackathon focused on AI/ML solutions for climate change.",
    },
    {
      id: "5",
      title: "Tech Mentor for Students",
      company: "Code.org",
      type: "volunteer",
      location: "Remote",
      remote: true,
      skills: ["js", "python", "communication"],
      matchScore: 88,
      description: "Help underrepresented students learn programming basics.",
    },
    {
      id: "6",
      title: "Backend Developer Intern",
      company: "CloudScale",
      type: "internship",
      location: "New York, NY",
      remote: false,
      skills: ["nodejs", "postgresql", "docker"],
      matchScore: 72,
      deadline: "2024-02-01",
      description: "Work on scalable microservices architecture.",
    },
    {
      id: "7",
      title: "Open Source Documentation",
      company: "MDN Web Docs",
      type: "opensource",
      location: "GitHub",
      remote: true,
      skills: ["html", "css", "js"],
      matchScore: 95,
      description: "Improve web documentation for developers worldwide.",
    },
    {
      id: "8",
      title: "Mobile App Freelance",
      company: "Fiverr Client",
      type: "freelance",
      location: "Remote",
      remote: true,
      skills: ["react", "ts"],
      matchScore: 80,
      description: "Convert existing web app to React Native mobile app.",
    },
  ];

  const getTypeIcon = (type: Opportunity["type"]) => {
    switch (type) {
      case "internship": return <Briefcase className="h-4 w-4" />;
      case "freelance": return <Zap className="h-4 w-4" />;
      case "opensource": return <Code2 className="h-4 w-4" />;
      case "hackathon": return <Trophy className="h-4 w-4" />;
      case "volunteer": return <Heart className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: Opportunity["type"]) => {
    switch (type) {
      case "internship": return "bg-primary text-primary-foreground";
      case "freelance": return "bg-accent text-accent-foreground";
      case "opensource": return "bg-warning text-warning-foreground";
      case "hackathon": return "bg-destructive text-destructive-foreground";
      case "volunteer": return "bg-info text-info-foreground";
    }
  };

  const filterByType = (type: Opportunity["type"] | "all") => {
    if (type === "all") return opportunities;
    return opportunities.filter(o => o.type === type);
  };

  const OpportunityCard = ({ opportunity }: { opportunity: Opportunity }) => (
    <Card className="hover:border-primary/50 transition-colors">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge className={getTypeColor(opportunity.type)}>
                {getTypeIcon(opportunity.type)}
                <span className="ml-1 capitalize">{opportunity.type}</span>
              </Badge>
              {opportunity.remote && (
                <Badge variant="outline">Remote</Badge>
              )}
            </div>
            <CardTitle className="text-lg">{opportunity.title}</CardTitle>
            <CardDescription>{opportunity.company}</CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">{opportunity.matchScore}%</div>
            <p className="text-xs text-muted-foreground">match</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">{opportunity.description}</p>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {opportunity.location}
          </div>
          {opportunity.deadline && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Due: {new Date(opportunity.deadline).toLocaleDateString()}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Required Skills</p>
          <div className="flex flex-wrap gap-1">
            {opportunity.skills.map(skillId => {
              const hasSkill = userSkills.some(s => s.id === skillId);
              return (
                <Badge
                  key={skillId}
                  variant={hasSkill ? "default" : "outline"}
                  className={hasSkill ? "bg-accent" : ""}
                >
                  {skillId}
                  {hasSkill && " ✓"}
                </Badge>
              );
            })}
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Why this matches you</span>
          </div>
          <Progress value={opportunity.matchScore} className="h-1.5" />
          <p className="text-xs text-muted-foreground">
            You have {opportunity.skills.filter(s => userSkills.some(us => us.id === s)).length} of {opportunity.skills.length} required skills
          </p>
        </div>

        <Button className="w-full">
          <ExternalLink className="h-4 w-4 mr-2" />
          View Opportunity
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Briefcase className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Opportunities Hub</h1>
              <p className="text-muted-foreground">Discover where your skills can shine</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { type: "internship", label: "Internships", count: filterByType("internship").length },
            { type: "freelance", label: "Freelance", count: filterByType("freelance").length },
            { type: "opensource", label: "Open Source", count: filterByType("opensource").length },
            { type: "hackathon", label: "Hackathons", count: filterByType("hackathon").length },
            { type: "volunteer", label: "Volunteer", count: filterByType("volunteer").length },
          ].map(stat => (
            <Card key={stat.type}>
              <CardContent className="pt-4 text-center">
                <div className="text-2xl font-bold">{stat.count}</div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Opportunities Tabs */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="internship">Internships</TabsTrigger>
            <TabsTrigger value="freelance">Freelance</TabsTrigger>
            <TabsTrigger value="opensource">Open Source</TabsTrigger>
            <TabsTrigger value="hackathon">Hackathons</TabsTrigger>
            <TabsTrigger value="volunteer">Volunteer</TabsTrigger>
          </TabsList>

          {["all", "internship", "freelance", "opensource", "hackathon", "volunteer"].map(type => (
            <TabsContent key={type} value={type} className="space-y-4">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filterByType(type as Opportunity["type"] | "all")
                  .sort((a, b) => b.matchScore - a.matchScore)
                  .map(opportunity => (
                    <OpportunityCard key={opportunity.id} opportunity={opportunity} />
                  ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </Layout>
  );
};
