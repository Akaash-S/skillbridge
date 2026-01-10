import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/context/AuthContext";
import { useAppData } from "@/context/AppDataContext";
import { jobRolesDatabase, skillsDatabase } from "@/data/mockData";
import { Target, TrendingUp, Clock, DollarSign, ArrowRight, Sparkles, Zap, Briefcase, ExternalLink, MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { apiClient } from "@/services/apiClient";

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

export const CareerHub = () => {
  const { userSkills, selectedRole } = useAppData();
  const navigate = useNavigate();
  
  // State for target role jobs
  const [targetRoleJobs, setTargetRoleJobs] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [jobRecommendations, setJobRecommendations] = useState<Job[]>([]);

  // Load jobs for the target role
  const loadTargetRoleJobs = async () => {
    if (!selectedRole) return;
    
    setLoadingJobs(true);
    try {
      console.log(`🎯 Loading jobs for target role: ${selectedRole.title}`);
      const params = new URLSearchParams();
      params.append('role', selectedRole.title);
      params.append('location', 'in');
      params.append('limit', '6');
      
      const response = await apiClient.get<{
        query: {
          role: string;
          country: string;
          location: string;
          limit: number;
        };
        results: {
          jobs: Job[];
          total: number;
        };
      }>(`/jobs/search?${params.toString()}`);
      const jobsData = response.results?.jobs || [];
      
      // Calculate match scores for jobs based on user skills
      const jobsWithScores = jobsData.map((job: Job) => {
        const jobSkills = job.skills || [];
        const userSkillIds = userSkills.map(skill => skill.name.toLowerCase());
        
        // Calculate skill match
        const matchingSkills = jobSkills.filter(skill => 
          userSkillIds.some(userSkill => 
            userSkill.includes(skill.toLowerCase()) || skill.toLowerCase().includes(userSkill)
          )
        );
        
        const matchScore = jobSkills.length > 0 
          ? Math.round((matchingSkills.length / jobSkills.length) * 100)
          : 50;
        
        return {
          ...job,
          matchScore,
          matchingSkills
        };
      });
      
      // Sort by match score
      jobsWithScores.sort((a, b) => b.matchScore - a.matchScore);
      setTargetRoleJobs(jobsWithScores);
      
    } catch (error) {
      console.error('Failed to load target role jobs:', error);
    } finally {
      setLoadingJobs(false);
    }
  };

  // Load job recommendations
  const loadJobRecommendations = async () => {
    try {
      const response = await apiClient.get('/jobs/recommendations');
      setJobRecommendations(response.recommendations || []);
    } catch (error) {
      console.error('Failed to load job recommendations:', error);
    }
  };

  // Load jobs when target role changes
  useEffect(() => {
    if (selectedRole) {
      loadTargetRoleJobs();
    }
    loadJobRecommendations();
  }, [selectedRole]);

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

  // Job Card Component for target role jobs
  const JobCard = ({ job }: { job: Job }) => (
    <Card className="hover:border-primary/50 transition-colors">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-base line-clamp-2">{job.title}</CardTitle>
            <CardDescription>{job.company}</CardDescription>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              {job.location || 'Remote'}
              {job.salary?.display && (
                <>
                  <span>•</span>
                  <span>{job.salary.display}</span>
                </>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-primary">{job.matchScore}%</div>
            <p className="text-xs text-muted-foreground">match</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>
        
        {job.skills && job.skills.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {job.skills.slice(0, 4).map((skill, index) => {
              const hasSkill = (userSkills || []).some(s => 
                s.name.toLowerCase().includes(skill.toLowerCase()) || 
                skill.toLowerCase().includes(s.name.toLowerCase())
              );
              
              return (
                <Badge
                  key={index}
                  variant={hasSkill ? "default" : "outline"}
                  className={`text-xs ${hasSkill ? "bg-accent" : ""}`}
                >
                  {skill}
                  {hasSkill && " ✓"}
                </Badge>
              );
            })}
            {job.skills.length > 4 && (
              <Badge variant="outline" className="text-xs">+{job.skills.length - 4}</Badge>
            )}
          </div>
        )}

        <div className="space-y-1">
          <Progress value={job.matchScore} className="h-1" />
          <p className="text-xs text-muted-foreground">
            {job.matchingSkills?.length || 0} of {job.skills?.length || 0} skills match
          </p>
        </div>

        <Button size="sm" className="w-full" asChild>
          <a href={job.applyUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-3 w-3 mr-2" />
            Apply
          </a>
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

        {/* Target Role Jobs */}
        {selectedRole && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" />
                  <CardTitle>Live Jobs for {selectedRole.title}</CardTitle>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate("/opportunities")}>
                  View All Jobs
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
              <CardDescription>
                Real-time job opportunities matching your target role
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingJobs ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Loading jobs...</p>
                  </div>
                </div>
              ) : targetRoleJobs.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {targetRoleJobs.slice(0, 6).map(job => (
                    <JobCard key={job.jobId} job={job} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Briefcase className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground mb-4">
                    No jobs found for {selectedRole.title}. Try checking the Opportunities page for more options.
                  </p>
                  <Button variant="outline" onClick={loadTargetRoleJobs}>
                    Refresh Jobs
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

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
