import { useAppData } from "@/context/AppDataContext";
import { Layout } from "@/components/Layout";
import { LearningResources } from "@/components/LearningResources";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { 
  BookOpen, 
  Target, 
  TrendingUp, 
  ArrowRight,
  GraduationCap,
  Code,
  Video,
  FileText
} from "lucide-react";

export const Resources = () => {
  const { selectedRole, userSkills, roadmap } = useAppData();

  const completedSkills = roadmap.filter(item => item.completed);
  const nextSkills = roadmap.filter(item => !item.completed).slice(0, 3);

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
            <BookOpen className="h-8 w-8 text-primary" />
            Learning Resources
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover curated learning materials to accelerate your career growth. 
            Find courses, tutorials, and resources tailored to your learning path.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <div className="text-2xl font-bold">{userSkills.length}</div>
              <div className="text-sm text-muted-foreground">Skills Added</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold">{completedSkills.length}</div>
              <div className="text-sm text-muted-foreground">Skills Completed</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold">{selectedRole ? '1' : '0'}</div>
              <div className="text-sm text-muted-foreground">Target Role</div>
            </CardContent>
          </Card>
        </div>

        {/* Current Focus */}
        {selectedRole && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Current Learning Focus
              </CardTitle>
              <CardDescription>
                Resources tailored for your {selectedRole.title} journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold">{selectedRole.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {completedSkills.length} of {roadmap.length} skills completed
                  </p>
                </div>
                <Badge variant="secondary">
                  {Math.round((completedSkills.length / Math.max(roadmap.length, 1)) * 100)}% Complete
                </Badge>
              </div>
              
              {nextSkills.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Next Skills to Learn:</h4>
                  <div className="grid sm:grid-cols-3 gap-3">
                    {nextSkills.map((skill, index) => (
                      <div key={skill.id} className="p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-primary bg-primary/10 rounded-full h-5 w-5 flex items-center justify-center">
                            {index + 1}
                          </span>
                          <span className="text-sm font-medium truncate">{skill.skillName}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{skill.estimatedTime}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex gap-3 mt-4">
                <Link to="/roadmap">
                  <Button size="sm">
                    View Full Roadmap
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/analysis">
                  <Button variant="outline" size="sm">
                    Check Progress
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Resource Categories */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <GraduationCap className="h-8 w-8 mx-auto mb-3 text-blue-600" />
              <h3 className="font-semibold mb-1">Courses</h3>
              <p className="text-xs text-muted-foreground">Structured learning paths</p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <Video className="h-8 w-8 mx-auto mb-3 text-red-600" />
              <h3 className="font-semibold mb-1">Videos</h3>
              <p className="text-xs text-muted-foreground">Visual learning content</p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <Code className="h-8 w-8 mx-auto mb-3 text-green-600" />
              <h3 className="font-semibold mb-1">Tutorials</h3>
              <p className="text-xs text-muted-foreground">Hands-on practice</p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <FileText className="h-8 w-8 mx-auto mb-3 text-purple-600" />
              <h3 className="font-semibold mb-1">Documentation</h3>
              <p className="text-xs text-muted-foreground">Reference materials</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Learning Resources Component */}
        <LearningResources
          skillName={selectedRole?.title}
          showFilters={true}
        />
      </div>
    </Layout>
  );
};