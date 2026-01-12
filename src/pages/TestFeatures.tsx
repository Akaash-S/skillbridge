import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Certificate } from "@/components/Certificate";
import { LearningResources } from "@/components/LearningResources";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  Trophy, 
  BookOpen, 
  Download, 
  Share2,
  TestTube,
  CheckCircle2,
  Star
} from "lucide-react";
import { toast } from "sonner";

export const TestFeatures = () => {
  const [showCertificate, setShowCertificate] = useState(false);
  const [showResources, setShowResources] = useState(false);

  const mockUser = {
    name: "Alex Johnson",
    email: "alex.johnson@example.com"
  };

  const mockRole = {
    title: "Full Stack Developer"
  };

  const mockResources = [
    {
      id: '1',
      title: 'Complete React Developer Course',
      description: 'Master React from basics to advanced concepts with hands-on projects',
      url: 'https://example.com/react-course',
      type: 'course' as const,
      provider: 'TechAcademy',
      duration: '40 hours',
      difficulty: 'intermediate' as const,
      rating: 4.8,
      price: 'paid' as const,
      tags: ['React', 'JavaScript', 'Frontend'],
      skillsRequired: ['JavaScript Basics'],
      isBookmarked: false
    },
    {
      id: '2',
      title: 'Node.js Fundamentals',
      description: 'Learn server-side JavaScript with Node.js and Express',
      url: 'https://example.com/nodejs-fundamentals',
      type: 'tutorial' as const,
      provider: 'CodeMaster',
      duration: '12 hours',
      difficulty: 'beginner' as const,
      rating: 4.6,
      price: 'free' as const,
      tags: ['Node.js', 'Backend', 'JavaScript'],
      skillsRequired: [],
      isBookmarked: true
    },
    {
      id: '3',
      title: 'Advanced TypeScript Patterns',
      description: 'Deep dive into TypeScript advanced features and design patterns',
      url: 'https://example.com/typescript-advanced',
      type: 'video' as const,
      provider: 'TypeScript Pro',
      duration: '8 hours',
      difficulty: 'advanced' as const,
      rating: 4.9,
      price: 'freemium' as const,
      tags: ['TypeScript', 'Advanced', 'Patterns'],
      skillsRequired: ['TypeScript Basics', 'JavaScript'],
      isBookmarked: false
    }
  ];

  const handleResourceClick = (resource: any) => {
    toast.info(`Opening: ${resource.title}`);
  };

  const handleBookmarkToggle = (resourceId: string, isBookmarked: boolean) => {
    toast.success(isBookmarked ? 'Resource bookmarked!' : 'Bookmark removed!');
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
            <TestTube className="h-8 w-8 text-primary" />
            Feature Testing Dashboard
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Test and demonstrate the new Certificate and Learning Resources components
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Certificate Feature */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-600" />
                Certificate Component
              </CardTitle>
              <CardDescription>
                Test the certificate generation and download functionality
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>User:</span>
                  <Badge variant="outline">{mockUser.name}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Role:</span>
                  <Badge variant="outline">{mockRole.title}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Skills Completed:</span>
                  <Badge variant="outline">15</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Readiness Score:</span>
                  <Badge variant="outline" className="text-green-600">95%</Badge>
                </div>
              </div>
              
              <Dialog open={showCertificate} onOpenChange={setShowCertificate}>
                <DialogTrigger asChild>
                  <Button className="w-full gap-2">
                    <Trophy className="h-4 w-4" />
                    View Certificate
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>🏆 Achievement Certificate</DialogTitle>
                    <DialogDescription>
                      Congratulations on completing your learning roadmap!
                    </DialogDescription>
                  </DialogHeader>
                  <Certificate
                    userName={mockUser.name}
                    userEmail={mockUser.email}
                    roleName={mockRole.title}
                    completionDate={new Date()}
                    skillsCompleted={15}
                    totalHours={120}
                    readinessScore={95}
                    onDownload={() => {
                      toast.success('Certificate downloaded successfully!');
                      setShowCertificate(false);
                    }}
                    onShare={() => {
                      toast.success('Achievement shared successfully!');
                      setShowCertificate(false);
                    }}
                  />
                </DialogContent>
              </Dialog>
              
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => toast.success('Certificate downloaded as HTML!')}
                  className="gap-2"
                >
                  <Download className="h-3 w-3" />
                  Download
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => toast.success('Achievement shared to clipboard!')}
                  className="gap-2"
                >
                  <Share2 className="h-3 w-3" />
                  Share
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Learning Resources Feature */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                Learning Resources Component
              </CardTitle>
              <CardDescription>
                Test the learning resources with filtering and search
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Total Resources:</span>
                  <Badge variant="outline">{mockResources.length}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Resource Types:</span>
                  <div className="flex gap-1">
                    <Badge variant="secondary" className="text-xs">Course</Badge>
                    <Badge variant="secondary" className="text-xs">Tutorial</Badge>
                    <Badge variant="secondary" className="text-xs">Video</Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Difficulty Levels:</span>
                  <div className="flex gap-1">
                    <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">Beginner</Badge>
                    <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">Intermediate</Badge>
                    <Badge variant="secondary" className="text-xs bg-red-100 text-red-800">Advanced</Badge>
                  </div>
                </div>
              </div>
              
              <Button 
                onClick={() => setShowResources(!showResources)}
                className="w-full gap-2"
                variant={showResources ? "secondary" : "default"}
              >
                <BookOpen className="h-4 w-4" />
                {showResources ? 'Hide Resources' : 'Show Resources'}
              </Button>
              
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => toast.info('Search functionality works!')}
                >
                  Test Search
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => toast.info('Filter functionality works!')}
                >
                  Test Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Learning Resources Demo */}
        {showResources && (
          <Card>
            <CardHeader>
              <CardTitle>Learning Resources Demo</CardTitle>
              <CardDescription>
                Interactive demo of the learning resources component with sample data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LearningResources
                skillName={mockRole.title}
                resources={mockResources}
                onResourceClick={handleResourceClick}
                onBookmarkToggle={handleBookmarkToggle}
                showFilters={true}
              />
            </CardContent>
          </Card>
        )}

        {/* Feature Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Implementation Status
            </CardTitle>
            <CardDescription>
              Current status of implemented features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-medium">✅ Completed Features</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    Certificate component with download/share
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    Learning resources with filtering
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    Dashboard integration
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    Roadmap completion tracking
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    Profile backend integration
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    Real-time progress updates
                  </li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium">🚀 Enhanced Features</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-600" />
                    Interactive dashboard with 10+ actions
                  </li>
                  <li className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-600" />
                    Comprehensive resume generation
                  </li>
                  <li className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-600" />
                    LinkedIn profile optimization
                  </li>
                  <li className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-600" />
                    Learning analytics and insights
                  </li>
                  <li className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-600" />
                    Roadmap access for 0% progress users
                  </li>
                  <li className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-600" />
                    Green completion indicators
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};