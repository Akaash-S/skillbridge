import { useState, useEffect, useCallback, useMemo } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/context/AuthContext";
import { useAppData } from "@/context/AppDataContext";
import { jobRolesDatabase, skillsDatabase } from "@/data/mockData";
import { 
  Target, TrendingUp, Clock, DollarSign, ArrowRight, Sparkles, Zap, Briefcase, 
  ExternalLink, MapPin, Loader2, Star, Award, BookOpen, Users, BarChart3,
  Lightbulb, Rocket, Shield, Globe, Brain, Code, Database, Palette,
  ChevronRight, Filter, Search, Calendar, Building, Gauge, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { apiClient } from "@/services/apiClient";
import { toast } from "@/hooks/use-toast";

interface Job {
  jobId: string;
  title: string;
  company: string;
  location: string;
  description: string;
  salary: {
    display: string;
    min?: number;
    max?: number;
  };
  skills: string[];
  applyUrl: string;
  postedDate: string;
  category: string;
  contractType: string;
  source: string;
  matchScore?: number;
  matchingSkills?: string[];
}

interface CareerPath {
  id: string;
  title: string;
  description: string;
  steps: string[];
  timeframe: string;
  difficulty: 'Easy' | 'Moderate' | 'Challenging';
  salaryGrowth: string;
  demandTrend: 'Rising' | 'Stable' | 'Declining';
  requiredSkills: string[];
  currentMatch: number;
}

interface ExtendedJobRole {
  id: string;
  title: string;
  description: string;
  category: string;
  avgSalary: string;
  demand: string;
  requiredSkills: Array<{ skillId: string; minProficiency: any; }>;
  similarity: number;
  matchPercentage: number;
}

interface MarketInsight {
  title: string;
  description: string;
  trend: 'up' | 'down' | 'stable';
  impact: 'high' | 'medium' | 'low';
  category: 'salary' | 'demand' | 'skills' | 'remote';
  value: string;
}

export const CareerHub = () => {
  const { userSkills, selectedRole } = useAppData();
  const navigate = useNavigate();
  
  // Enhanced state management
  const [targetRoleJobs, setTargetRoleJobs] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [jobRecommendations, setJobRecommendations] = useState<Job[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [careerPaths, setCareerPaths] = useState<CareerPath[]>([]);
  const [marketInsights, setMarketInsights] = useState<MarketInsight[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(false);

  // Enhanced career intelligence functions
  const generateCareerPaths = useCallback(() => {
    if (!selectedRole || !userSkills) return [];

    const currentSkillNames = userSkills.map(s => s.name.toLowerCase());
    const targetSkills = selectedRole.requiredSkills.map(s => s.skillId);
    
    // Generate intelligent career paths based on current role and skills
    const paths: CareerPath[] = [
      {
        id: 'direct',
        title: `Direct Path to ${selectedRole.title}`,
        description: `Focus on core skills needed for ${selectedRole.title}`,
        steps: [
          'Complete skill gap analysis',
          'Focus on missing technical skills',
          'Build portfolio projects',
          'Apply for entry-level positions',
          'Gain practical experience'
        ],
        timeframe: getTimeToReady(calculateRoleMatch(selectedRole)),
        difficulty: getDifficultyLevel(calculateRoleMatch(selectedRole)),
        salaryGrowth: '+15-25%',
        demandTrend: 'Rising',
        requiredSkills: selectedRole.requiredSkills.map(s => s.skillId).slice(0, 5),
        currentMatch: calculateRoleMatch(selectedRole)
      },
      {
        id: 'gradual',
        title: 'Gradual Transition Path',
        description: 'Step-by-step progression through related roles',
        steps: [
          'Master current role skills',
          'Take on hybrid responsibilities',
          'Transition to senior role',
          'Move to target position',
          'Specialize and advance'
        ],
        timeframe: '8-12 months',
        difficulty: 'Moderate',
        salaryGrowth: '+20-35%',
        demandTrend: 'Stable',
        requiredSkills: ['leadership', 'project-management', 'communication'],
        currentMatch: Math.min(calculateRoleMatch(selectedRole) + 20, 100)
      },
      {
        id: 'accelerated',
        title: 'Accelerated Learning Path',
        description: 'Intensive skill development for faster transition',
        steps: [
          'Enroll in intensive bootcamp',
          'Complete certification programs',
          'Build comprehensive portfolio',
          'Network with industry professionals',
          'Apply for target positions'
        ],
        timeframe: '3-6 months',
        difficulty: 'Challenging',
        salaryGrowth: '+30-50%',
        demandTrend: 'Rising',
        requiredSkills: ['self-learning', 'time-management', 'adaptability'],
        currentMatch: calculateRoleMatch(selectedRole)
      }
    ];

    return paths;
  }, [selectedRole, userSkills]);

  // Generate market insights
  const generateMarketInsights = useCallback(() => {
    const insights: MarketInsight[] = [
      {
        title: 'Remote Work Opportunities',
        description: 'Remote positions have increased by 40% in tech roles',
        trend: 'up',
        impact: 'high',
        category: 'remote',
        value: '+40%'
      },
      {
        title: 'AI/ML Skills Premium',
        description: 'Roles requiring AI/ML skills command 25% higher salaries',
        trend: 'up',
        impact: 'high',
        category: 'salary',
        value: '+25%'
      },
      {
        title: 'Cloud Skills Demand',
        description: 'Cloud computing skills are in top 3 most demanded',
        trend: 'up',
        impact: 'high',
        category: 'demand',
        value: 'Top 3'
      },
      {
        title: 'Full-Stack Versatility',
        description: 'Full-stack developers have 60% more job opportunities',
        trend: 'up',
        impact: 'medium',
        category: 'demand',
        value: '+60%'
      },
      {
        title: 'Cybersecurity Growth',
        description: 'Security roles growing 15% year-over-year',
        trend: 'up',
        impact: 'high',
        category: 'demand',
        value: '+15% YoY'
      },
      {
        title: 'DevOps Integration',
        description: 'DevOps skills becoming standard across development roles',
        trend: 'up',
        impact: 'medium',
        category: 'skills',
        value: '85% adoption'
      }
    ];

    return insights;
  }, []);

  // Enhanced role matching with detailed analysis
  const calculateDetailedRoleMatch = useCallback((role: typeof jobRolesDatabase[0]) => {
    if (!userSkills || userSkills.length === 0) return { overall: 0, technical: 0, soft: 0, missing: [] };

    const requiredSkillIds = role.requiredSkills.map(s => s.skillId);
    const userSkillIds = userSkills.map(s => s.id);
    const overlap = requiredSkillIds.filter(id => userSkillIds.includes(id));
    const missing = requiredSkillIds.filter(id => !userSkillIds.includes(id));
    
    const overall = Math.round((overlap.length / requiredSkillIds.length) * 100);
    
    // Categorize skills for detailed analysis
    const technicalSkills = requiredSkillIds.filter(id => {
      const skill = skillsDatabase.find(s => s.id === id);
      return skill?.category === 'technical';
    });
    const softSkills = requiredSkillIds.filter(id => {
      const skill = skillsDatabase.find(s => s.id === id);
      return skill?.category === 'soft';
    });
    
    const technicalMatch = technicalSkills.length > 0 
      ? Math.round((technicalSkills.filter(id => userSkillIds.includes(id)).length / technicalSkills.length) * 100)
      : 100;
    
    const softMatch = softSkills.length > 0
      ? Math.round((softSkills.filter(id => userSkillIds.includes(id)).length / softSkills.length) * 100)
      : 100;

    return {
      overall,
      technical: technicalMatch,
      soft: softMatch,
      missing: missing.slice(0, 5) // Top 5 missing skills
    };
  }, [userSkills]);

  // Load enhanced job data with better matching
  const loadTargetRoleJobs = useCallback(async () => {
    if (!selectedRole) return;
    
    setLoadingJobs(true);
    try {
      console.log(`🎯 Loading enhanced jobs for: ${selectedRole.title}`);
      const params = new URLSearchParams();
      params.append('role', selectedRole.title);
      params.append('country', 'in');
      params.append('limit', '12'); // Increased for better selection
      
      const response = await apiClient.get<{
        query: { role: string; country: string; limit: number; };
        results: { jobs: Job[]; total: number; };
      }>(`/jobs/search?${params.toString()}`);
      
      const jobsData = response.results?.jobs || [];
      
      // Enhanced job matching with detailed scoring
      const jobsWithScores = jobsData.map((job: Job) => {
        const jobSkills = job.skills || [];
        const userSkillNames = userSkills?.map(skill => skill.name.toLowerCase()) || [];
        
        // Advanced skill matching
        const exactMatches = jobSkills.filter(skill => 
          userSkillNames.includes(skill.toLowerCase())
        );
        
        const partialMatches = jobSkills.filter(skill => 
          userSkillNames.some(userSkill => 
            userSkill.includes(skill.toLowerCase()) || 
            skill.toLowerCase().includes(userSkill)
          )
        );
        
        const matchingSkills = [...new Set([...exactMatches, ...partialMatches])];
        
        // Calculate weighted match score
        const exactWeight = 1.0;
        const partialWeight = 0.6;
        const totalWeight = (exactMatches.length * exactWeight) + 
                           ((partialMatches.length - exactMatches.length) * partialWeight);
        
        const matchScore = jobSkills.length > 0 
          ? Math.round((totalWeight / jobSkills.length) * 100)
          : 50;
        
        return {
          ...job,
          matchScore: Math.min(matchScore, 100),
          matchingSkills,
          exactMatches: exactMatches.length,
          partialMatches: partialMatches.length - exactMatches.length
        };
      });
      
      // Sort by match score and recency
      jobsWithScores.sort((a, b) => {
        if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
        return new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime();
      });
      
      setTargetRoleJobs(jobsWithScores);
      
    } catch (error) {
      console.error('Failed to load target role jobs:', error);
      toast({
        title: "Error Loading Jobs",
        description: "Failed to fetch job opportunities. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingJobs(false);
    }
  }, [selectedRole, userSkills]);

  // Load market insights
  const loadMarketInsights = useCallback(async () => {
    setLoadingInsights(true);
    try {
      // Simulate API call for market insights
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMarketInsights(generateMarketInsights());
    } catch (error) {
      console.error('Failed to load market insights:', error);
    } finally {
      setLoadingInsights(false);
    }
  }, [generateMarketInsights]);

  // Initialize data
  useEffect(() => {
    if (selectedRole) {
      loadTargetRoleJobs();
      setCareerPaths(generateCareerPaths());
    }
    loadMarketInsights();
  }, [selectedRole, loadTargetRoleJobs, generateCareerPaths, loadMarketInsights]);

  // Utility functions
  const calculateRoleMatch = (role: typeof jobRolesDatabase[0]) => {
    const requiredSkillIds = role.requiredSkills.map(s => s.skillId);
    const userSkillIds = userSkills?.map(s => s.id) || [];
    const overlap = requiredSkillIds.filter(id => userSkillIds.includes(id));
    return Math.round((overlap.length / requiredSkillIds.length) * 100);
  };

  const getTimeToReady = (matchPercentage: number) => {
    if (matchPercentage >= 80) return "1-2 months";
    if (matchPercentage >= 60) return "3-4 months";
    if (matchPercentage >= 40) return "5-6 months";
    return "6+ months";
  };

  const getDifficultyLevel = (matchPercentage: number): 'Easy' | 'Moderate' | 'Challenging' => {
    if (matchPercentage >= 70) return 'Easy';
    if (matchPercentage >= 40) return 'Moderate';
    return 'Challenging';
  };

  const getDifficulty = (matchPercentage: number) => {
    if (matchPercentage >= 70) return { label: "Easy Transition", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" };
    if (matchPercentage >= 40) return { label: "Moderate", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" };
    return { label: "Challenging", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" };
  };

  // Get filtered and sorted adjacent roles
  const getAdjacentRoles = useMemo((): ExtendedJobRole[] => {
    if (!selectedRole) return jobRolesDatabase.slice(0, 6).map(role => ({
      ...role,
      similarity: 0,
      matchPercentage: calculateRoleMatch(role)
    }));
    
    const targetSkills = selectedRole.requiredSkills.map(s => s.skillId);
    return jobRolesDatabase
      .filter(role => role.id !== selectedRole.id)
      .map(role => {
        const roleSkills = role.requiredSkills.map(s => s.skillId);
        const overlap = targetSkills.filter(s => roleSkills.includes(s)).length;
        const similarity = overlap / Math.max(targetSkills.length, roleSkills.length);
        const matchPercentage = calculateRoleMatch(role);
        return { ...role, similarity, matchPercentage };
      })
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 6);
  }, [selectedRole, userSkills]);

  // Enhanced Job Card Component
  const EnhancedJobCard = ({ job }: { job: Job }) => (
    <Card className="hover:border-primary/50 transition-all duration-200 hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                <Briefcase className="h-3 w-3 mr-1" />
                Live
              </Badge>
              <Badge variant="outline" className="text-xs">{job.source}</Badge>
              {job.contractType && (
                <Badge variant="secondary" className="text-xs">{job.contractType}</Badge>
              )}
            </div>
            <CardTitle className="text-base line-clamp-2 leading-tight">{job.title}</CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Building className="h-3 w-3" />
              <span className="font-medium">{job.company}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span>{job.location || 'Remote'}</span>
              {job.salary?.display && (
                <>
                  <span>•</span>
                  <DollarSign className="h-3 w-3" />
                  <span>{job.salary.display}</span>
                </>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-primary">{job.matchScore}%</div>
            <p className="text-xs text-muted-foreground">match</p>
            <div className="flex items-center gap-1 mt-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star 
                  key={i} 
                  className={`h-2 w-2 ${i < Math.floor(job.matchScore / 20) ? 'fill-primary text-primary' : 'text-muted-foreground'}`} 
                />
              ))}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-3">{job.description}</p>
        
        {job.postedDate && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>Posted: {new Date(job.postedDate).toLocaleDateString()}</span>
          </div>
        )}

        {job.skills && job.skills.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Required Skills</p>
            <div className="flex flex-wrap gap-1">
              {job.skills.slice(0, 6).map((skill, index) => {
                const hasSkill = (userSkills || []).some(s => 
                  s.name.toLowerCase().includes(skill.toLowerCase()) || 
                  skill.toLowerCase().includes(s.name.toLowerCase())
                );
                const isExactMatch = (job as any).exactMatches > 0 && 
                  (userSkills || []).some(s => s.name.toLowerCase() === skill.toLowerCase());
                
                return (
                  <Badge
                    key={index}
                    variant={hasSkill ? "default" : "outline"}
                    className={`text-xs ${
                      isExactMatch 
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
                        : hasSkill 
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" 
                        : ""
                    }`}
                  >
                    {skill}
                    {hasSkill && (isExactMatch ? " ✓" : " ~")}
                  </Badge>
                );
              })}
              {job.skills.length > 6 && (
                <Badge variant="outline" className="text-xs">+{job.skills.length - 6} more</Badge>
              )}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Skill Match</span>
            <div className="flex items-center gap-2">
              <span className="font-medium">{job.matchScore}%</span>
              <Gauge className="h-3 w-3 text-primary" />
            </div>
          </div>
          <Progress value={job.matchScore} className="h-2" />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{job.matchingSkills?.length || 0} of {job.skills?.length || 0} skills match</span>
            {(job as any).exactMatches > 0 && (
              <span className="text-green-600 font-medium">
                {(job as any).exactMatches} exact matches
              </span>
            )}
          </div>
        </div>

        <Button className="w-full" asChild>
          <a href={job.applyUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4 mr-2" />
            Apply Now
          </a>
        </Button>
      </CardContent>
    </Card>
  );

  // Market Insight Card Component
  const MarketInsightCard = ({ insight }: { insight: MarketInsight }) => {
    const getTrendIcon = () => {
      switch (insight.trend) {
        case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
        case 'down': return <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />;
        default: return <BarChart3 className="h-4 w-4 text-blue-600" />;
      }
    };

    const getCategoryIcon = () => {
      switch (insight.category) {
        case 'salary': return <DollarSign className="h-4 w-4" />;
        case 'demand': return <Users className="h-4 w-4" />;
        case 'skills': return <Brain className="h-4 w-4" />;
        case 'remote': return <Globe className="h-4 w-4" />;
        default: return <BarChart3 className="h-4 w-4" />;
      }
    };

    return (
      <Card className="hover:border-primary/50 transition-colors">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              {getCategoryIcon()}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-sm">{insight.title}</h4>
                {getTrendIcon()}
              </div>
              <p className="text-xs text-muted-foreground mb-2">{insight.description}</p>
              <div className="flex items-center justify-between">
                <Badge 
                  variant="outline" 
                  className={`text-xs ${
                    insight.impact === 'high' ? 'border-red-200 text-red-700' :
                    insight.impact === 'medium' ? 'border-yellow-200 text-yellow-700' :
                    'border-green-200 text-green-700'
                  }`}
                >
                  {insight.impact} impact
                </Badge>
                <span className="text-sm font-bold text-primary">{insight.value}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Career Path Card Component
  const CareerPathCard = ({ path }: { path: CareerPath }) => {
    const getDifficultyColor = (difficulty: string) => {
      switch (difficulty) {
        case 'Easy': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
        case 'Moderate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
        case 'Challenging': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
        default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      }
    };

    return (
      <Card className="hover:border-primary/50 transition-colors">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg">{path.title}</CardTitle>
              <CardDescription className="mt-1">{path.description}</CardDescription>
            </div>
            <Badge className={getDifficultyColor(path.difficulty)}>
              {path.difficulty}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{path.timeframe}</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span>{path.salaryGrowth}</span>
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <span>{path.demandTrend}</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span>{path.currentMatch}% match</span>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Path Steps:</p>
            <div className="space-y-1">
              {path.steps.slice(0, 3).map((step, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                    {index + 1}
                  </div>
                  <span>{step}</span>
                </div>
              ))}
              {path.steps.length > 3 && (
                <div className="text-xs text-muted-foreground ml-7">
                  +{path.steps.length - 3} more steps
                </div>
              )}
            </div>
          </div>

          <Progress value={path.currentMatch} className="h-2" />
          
          <Button variant="outline" className="w-full">
            <Rocket className="h-4 w-4 mr-2" />
            Start This Path
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Enhanced Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary via-primary/80 to-accent flex items-center justify-center">
              <Target className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Career Intelligence Hub
              </h1>
              <p className="text-muted-foreground">AI-powered career planning and opportunity discovery</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Live Jobs</p>
                    <p className="text-lg font-bold">{targetRoleJobs.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Role Match</p>
                    <p className="text-lg font-bold">{selectedRole ? calculateRoleMatch(selectedRole) : 0}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Career Paths</p>
                    <p className="text-lg font-bold">{careerPaths.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-yellow-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Insights</p>
                    <p className="text-lg font-bold">{marketInsights.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Enhanced Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="opportunities" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Opportunities
            </TabsTrigger>
            <TabsTrigger value="paths" className="flex items-center gap-2">
              <Rocket className="h-4 w-4" />
              Career Paths
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Market Insights
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Primary Target Role */}
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-primary/3 to-accent/5">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <CardTitle>Primary Career Goal</CardTitle>
                  </div>
                  {selectedRole && (
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      {selectedRole.category}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {selectedRole ? (
                  <div className="space-y-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <h3 className="text-2xl font-bold">{selectedRole.title}</h3>
                        <p className="text-muted-foreground max-w-2xl">{selectedRole.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-primary">{calculateRoleMatch(selectedRole)}%</div>
                        <p className="text-sm text-muted-foreground">Current Match</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <DollarSign className="h-4 w-4" />
                          Salary Range
                        </div>
                        <p className="font-semibold text-lg">{selectedRole.avgSalary}</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <TrendingUp className="h-4 w-4" />
                          Market Demand
                        </div>
                        <Badge className={
                          selectedRole.demand === "high" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" :
                          selectedRole.demand === "medium" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" : 
                          "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        }>
                          {selectedRole.demand.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          Time to Ready
                        </div>
                        <p className="font-semibold text-lg">{getTimeToReady(calculateRoleMatch(selectedRole))}</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Award className="h-4 w-4" />
                          Difficulty
                        </div>
                        <Badge className={getDifficulty(calculateRoleMatch(selectedRole)).color}>
                          {getDifficulty(calculateRoleMatch(selectedRole)).label}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Overall Progress</span>
                        <span className="text-sm text-muted-foreground">{calculateRoleMatch(selectedRole)}% complete</span>
                      </div>
                      <Progress value={calculateRoleMatch(selectedRole)} className="h-3" />
                    </div>

                    <div className="flex gap-3">
                      <Button onClick={() => navigate("/roadmap")} className="flex-1">
                        <BookOpen className="h-4 w-4 mr-2" />
                        View Learning Roadmap
                      </Button>
                      <Button variant="outline" onClick={() => navigate("/opportunities")} className="flex-1">
                        <Briefcase className="h-4 w-4 mr-2" />
                        Find Jobs
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Target className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-xl font-semibold mb-2">No Target Role Selected</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      Choose your career goal to unlock personalized insights, job opportunities, and learning paths.
                    </p>
                    <Button onClick={() => navigate("/roles")} size="lg">
                      <Target className="h-4 w-4 mr-2" />
                      Choose Your Target Role
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => setActiveTab("opportunities")}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900">
                      <Briefcase className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Live Opportunities</h3>
                      <p className="text-sm text-muted-foreground">Real-time job matches</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => setActiveTab("paths")}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900">
                      <Rocket className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Career Paths</h3>
                      <p className="text-sm text-muted-foreground">Strategic progression plans</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => setActiveTab("insights")}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900">
                      <BarChart3 className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Market Intelligence</h3>
                      <p className="text-sm text-muted-foreground">Industry trends & insights</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Adjacent Roles Preview */}
            {getAdjacentRoles.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" />
                        Related Career Opportunities
                      </CardTitle>
                      <CardDescription>
                        {selectedRole 
                          ? `Roles similar to ${selectedRole.title} based on skill overlap`
                          : "Explore these career paths based on your current skills"}
                      </CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => navigate("/roles")}>
                      View All Roles
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {getAdjacentRoles.slice(0, 3).map((role) => {
                      const difficulty = getDifficulty(role.matchPercentage);
                      
                      return (
                        <Card key={role.id} className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => navigate("/roles")}>
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <CardTitle className="text-base">{role.title}</CardTitle>
                                <CardDescription className="line-clamp-2 text-xs">{role.description}</CardDescription>
                              </div>
                              <Badge className={difficulty.color} variant="outline">
                                {difficulty.label}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Skill Match</span>
                              <span className="font-medium">{role.matchPercentage}%</span>
                            </div>
                            <Progress value={role.matchPercentage} className="h-2" />
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                {role.avgSalary}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {getTimeToReady(role.matchPercentage)}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Opportunities Tab */}
          <TabsContent value="opportunities" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Live Job Opportunities</h2>
                <p className="text-muted-foreground">
                  {selectedRole ? `Real-time jobs for ${selectedRole.title}` : "Explore job opportunities"}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => navigate("/opportunities")}>
                  <Search className="h-4 w-4 mr-2" />
                  Advanced Search
                </Button>
                <Button onClick={loadTargetRoleJobs} disabled={loadingJobs}>
                  {loadingJobs ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Refresh
                </Button>
              </div>
            </div>

            {selectedRole ? (
              <>
                {loadingJobs ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <Card key={i} className="animate-pulse">
                        <CardHeader>
                          <div className="h-4 bg-muted rounded w-3/4"></div>
                          <div className="h-3 bg-muted rounded w-1/2"></div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="h-3 bg-muted rounded"></div>
                            <div className="h-3 bg-muted rounded w-2/3"></div>
                            <div className="h-8 bg-muted rounded"></div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : targetRoleJobs.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Found {targetRoleJobs.length} opportunities</span>
                      <span>•</span>
                      <span>Sorted by skill match</span>
                      <span>•</span>
                      <span>Updated in real-time</span>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {targetRoleJobs.map(job => (
                        <EnhancedJobCard key={job.jobId} job={job} />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <Briefcase className="h-20 w-20 mx-auto mb-6 text-muted-foreground opacity-50" />
                    <h3 className="text-xl font-semibold mb-2">No Jobs Found</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      No live jobs found for {selectedRole.title}. Try refreshing or check the Opportunities page for more search options.
                    </p>
                    <div className="flex gap-3 justify-center">
                      <Button onClick={loadTargetRoleJobs} variant="outline">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh Jobs
                      </Button>
                      <Button onClick={() => navigate("/opportunities")}>
                        <Search className="h-4 w-4 mr-2" />
                        Advanced Search
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <Target className="h-20 w-20 mx-auto mb-6 text-muted-foreground opacity-50" />
                <h3 className="text-xl font-semibold mb-2">Select a Target Role</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Choose your career goal to see personalized job opportunities that match your skills and interests.
                </p>
                <Button onClick={() => navigate("/roles")} size="lg">
                  <Target className="h-4 w-4 mr-2" />
                  Choose Target Role
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Career Paths Tab */}
          <TabsContent value="paths" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Strategic Career Paths</h2>
                <p className="text-muted-foreground">
                  {selectedRole ? `Personalized paths to become a ${selectedRole.title}` : "Choose a target role to see career paths"}
                </p>
              </div>
              <Button variant="outline" onClick={() => navigate("/roadmap")}>
                <BookOpen className="h-4 w-4 mr-2" />
                View Learning Roadmap
              </Button>
            </div>

            {selectedRole ? (
              <div className="space-y-6">
                <div className="grid md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {careerPaths.map(path => (
                    <CareerPathCard key={path.id} path={path} />
                  ))}
                </div>

                {/* Career Transition Tips */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-yellow-600" />
                      Career Transition Tips
                    </CardTitle>
                    <CardDescription>Expert advice for your career journey</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      {[
                        {
                          title: "Build a Portfolio",
                          description: "Showcase your skills with real projects",
                          icon: <Code className="h-4 w-4" />
                        },
                        {
                          title: "Network Actively",
                          description: "Connect with professionals in your target field",
                          icon: <Users className="h-4 w-4" />
                        },
                        {
                          title: "Continuous Learning",
                          description: "Stay updated with industry trends and technologies",
                          icon: <BookOpen className="h-4 w-4" />
                        },
                        {
                          title: "Gain Experience",
                          description: "Take on projects or freelance work in your target area",
                          icon: <Award className="h-4 w-4" />
                        }
                      ].map((tip, index) => (
                        <div key={index} className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                          <div className="p-2 rounded-lg bg-primary/10">
                            {tip.icon}
                          </div>
                          <div>
                            <h4 className="font-medium text-sm">{tip.title}</h4>
                            <p className="text-xs text-muted-foreground mt-1">{tip.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-16">
                <Rocket className="h-20 w-20 mx-auto mb-6 text-muted-foreground opacity-50" />
                <h3 className="text-xl font-semibold mb-2">Select a Target Role</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Choose your career goal to see personalized learning paths and strategic progression plans.
                </p>
                <Button onClick={() => navigate("/roles")} size="lg">
                  <Target className="h-4 w-4 mr-2" />
                  Choose Target Role
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Market Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Market Intelligence</h2>
                <p className="text-muted-foreground">Industry trends, salary insights, and demand forecasts</p>
              </div>
              <Button variant="outline" onClick={loadMarketInsights} disabled={loadingInsights}>
                {loadingInsights ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Refresh Insights
              </Button>
            </div>

            {loadingInsights ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-muted rounded-lg"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-muted rounded w-3/4"></div>
                          <div className="h-3 bg-muted rounded"></div>
                          <div className="h-3 bg-muted rounded w-1/2"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {marketInsights.map((insight, index) => (
                    <MarketInsightCard key={index} insight={insight} />
                  ))}
                </div>

                {/* Industry Trends */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      Industry Trends 2024
                    </CardTitle>
                    <CardDescription>Key developments shaping the tech industry</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { trend: "AI/ML Integration", impact: "High", description: "AI skills becoming essential across all tech roles" },
                        { trend: "Remote-First Culture", impact: "High", description: "Permanent shift to distributed teams and remote work" },
                        { trend: "Cloud-Native Development", impact: "Medium", description: "Containerization and microservices adoption" },
                        { trend: "Cybersecurity Focus", impact: "High", description: "Security-first approach in all development practices" },
                        { trend: "Low-Code/No-Code", impact: "Medium", description: "Democratization of software development" }
                      ].map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                          <div>
                            <h4 className="font-medium text-sm">{item.trend}</h4>
                            <p className="text-xs text-muted-foreground">{item.description}</p>
                          </div>
                          <Badge 
                            variant="outline"
                            className={
                              item.impact === 'High' ? 'border-red-200 text-red-700' :
                              item.impact === 'Medium' ? 'border-yellow-200 text-yellow-700' :
                              'border-green-200 text-green-700'
                            }
                          >
                            {item.impact} Impact
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Salary Insights */}
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-green-600" />
                        Salary Growth Trends
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {[
                          { role: "AI/ML Engineer", growth: "+35%", salary: "₹25-45L" },
                          { role: "DevOps Engineer", growth: "+28%", salary: "₹18-35L" },
                          { role: "Full Stack Developer", growth: "+22%", salary: "₹15-30L" },
                          { role: "Data Scientist", growth: "+20%", salary: "₹20-40L" }
                        ].map((item, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm">{item.role}</p>
                              <p className="text-xs text-muted-foreground">{item.salary}</p>
                            </div>
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              {item.growth}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-blue-600" />
                        High Demand Skills
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {[
                          { skill: "React/Next.js", demand: "Very High", jobs: "15K+" },
                          { skill: "Python", demand: "Very High", jobs: "12K+" },
                          { skill: "AWS/Cloud", demand: "High", jobs: "10K+" },
                          { skill: "Docker/K8s", demand: "High", jobs: "8K+" }
                        ].map((item, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm">{item.skill}</p>
                              <p className="text-xs text-muted-foreground">{item.jobs} jobs</p>
                            </div>
                            <Badge 
                              variant="outline"
                              className={
                                item.demand === 'Very High' ? 'border-red-200 text-red-700' :
                                'border-blue-200 text-blue-700'
                              }
                            >
                              {item.demand}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};