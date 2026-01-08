import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useApp } from "@/context/AppContext";
import { Briefcase, ExternalLink, MapPin, Clock, Zap, Loader2, Search, Filter, Target, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiService } from "@/services/api";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

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

export const Opportunities = () => {
  const { userSkills, selectedRole, isAuthenticated } = useApp();
  const navigate = useNavigate();
  
  // State for jobs
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [jobSearchQuery, setJobSearchQuery] = useState("");
  const [jobLocation, setJobLocation] = useState("in");
  const [totalJobs, setTotalJobs] = useState(0);

  // Calculate skill match for a job
  const calculateSkillMatch = (job: Job) => {
    const jobSkills = job.skills || [];
    const userSkillNames = (userSkills || []).map(skill => skill.name.toLowerCase());
    
    // Find matching skills using fuzzy matching
    const matchingSkills = jobSkills.filter(skill => 
      userSkillNames.some(userSkill => 
        userSkill.includes(skill.toLowerCase()) || 
        skill.toLowerCase().includes(userSkill)
      )
    );
    
    const matchScore = jobSkills.length > 0 
      ? Math.round((matchingSkills.length / jobSkills.length) * 100)
      : 50; // Default score if no skills listed
    
    return { matchScore, matchingSkills };
  };

  // Load jobs from Adzuna API
  const loadJobs = async (searchRole?: string, location: string = "in") => {
    setLoadingJobs(true);
    try {
      const roleToSearch = searchRole || selectedRole?.title || "Software Developer";
      console.log(`🔍 Searching jobs for: ${roleToSearch} in ${location}`);
      
      const response = await apiService.searchJobs(roleToSearch, location, 50);
      console.log('🔍 Raw API response:', response);
      
      const jobsData = response.results?.jobs || [];
      setTotalJobs(response.results?.total || jobsData.length);
      
      console.log(`📊 Jobs data:`, {
        jobsCount: jobsData.length,
        totalJobs: response.results?.total,
        firstJob: jobsData[0]
      });
      
      // Calculate match scores for jobs based on user skills
      const jobsWithScores = jobsData.map((job: Job) => {
        const { matchScore, matchingSkills } = calculateSkillMatch(job);
        return {
          ...job,
          matchScore,
          matchingSkills
        };
      });
      
      // Sort by match score (highest first)
      jobsWithScores.sort((a, b) => b.matchScore - a.matchScore);
      
      setJobs(jobsWithScores);
      console.log(`✅ Loaded ${jobsWithScores.length} jobs with match scores`);
      
    } catch (error) {
      console.error('❌ Failed to load jobs:', error);
      toast({
        title: "Error",
        description: "Failed to load job opportunities. Please try again.",
        variant: "destructive",
      });
      setJobs([]);
    } finally {
      setLoadingJobs(false);
    }
  };

  // Load jobs on component mount and when target role changes
  useEffect(() => {
    console.log('🔄 Opportunities page mounted/updated', {
      selectedRole: selectedRole?.title,
      isAuthenticated,
      userSkillsCount: userSkills?.length || 0
    });
    
    // Load jobs immediately when component mounts
    loadJobs();
  }, [selectedRole]); // Only depend on selectedRole to avoid infinite loops

  // Handle job search
  const handleJobSearch = () => {
    if (jobSearchQuery.trim()) {
      loadJobs(jobSearchQuery, jobLocation);
    } else if (selectedRole) {
      loadJobs(selectedRole.title, jobLocation);
    }
  };

  // Handle location change
  const handleLocationChange = (newLocation: string) => {
    setJobLocation(newLocation);
    const searchTerm = jobSearchQuery || selectedRole?.title || "Software Developer";
    loadJobs(searchTerm, newLocation);
  };

  // Job Card Component
  const JobCard = ({ job }: { job: Job }) => (
    <Card className="hover:border-primary/50 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <Badge className="bg-primary text-primary-foreground">
                <Briefcase className="h-3 w-3 mr-1" />
                Live Job
              </Badge>
              <Badge variant="outline">{job.source}</Badge>
              {job.contractType && (
                <Badge variant="secondary" className="text-xs">{job.contractType}</Badge>
              )}
            </div>
            <CardTitle className="text-lg line-clamp-2">{job.title}</CardTitle>
            <CardDescription className="font-medium">{job.company}</CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">{job.matchScore}%</div>
            <p className="text-xs text-muted-foreground">match</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-3">{job.description}</p>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            <span className="line-clamp-1">{job.location || 'Location not specified'}</span>
          </div>
          {job.salary?.display && (
            <div className="flex items-center gap-1">
              <Zap className="h-3 w-3" />
              <span>{job.salary.display}</span>
            </div>
          )}
        </div>

        {job.postedDate && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            Posted: {new Date(job.postedDate).toLocaleDateString()}
          </div>
        )}

        {job.skills && job.skills.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Required Skills</p>
            <div className="flex flex-wrap gap-1">
              {job.skills.slice(0, 8).map((skill, index) => {
                const hasSkill = (userSkills || []).some(s => 
                  s.name.toLowerCase().includes(skill.toLowerCase()) || 
                  skill.toLowerCase().includes(s.name.toLowerCase())
                );
                const isMatching = job.matchingSkills?.includes(skill);
                
                return (
                  <Badge
                    key={index}
                    variant={hasSkill ? "default" : "outline"}
                    className={`text-xs ${hasSkill ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : isMatching ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" : ""}`}
                  >
                    {skill}
                    {hasSkill && " ✓"}
                  </Badge>
                );
              })}
              {job.skills.length > 8 && (
                <Badge variant="outline" className="text-xs">+{job.skills.length - 8} more</Badge>
              )}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Skill Match</span>
            <span className="font-medium">{job.matchScore}%</span>
          </div>
          <Progress value={job.matchScore} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {job.matchingSkills?.length || 0} of {job.skills?.length || 0} skills match your profile
          </p>
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

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Briefcase className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Live Job Opportunities</h1>
              <p className="text-muted-foreground">Real-time jobs from Adzuna matching your profile</p>
            </div>
          </div>
          
          {/* Target Role Info */}
          {selectedRole ? (
            <div className="flex items-center gap-2 p-4 bg-primary/5 rounded-lg border border-primary/20">
              <Target className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Showing jobs for your target role:</p>
                <p className="text-lg font-semibold text-primary">{selectedRole.title}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">No target role selected</p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">Select a target role to see more relevant job opportunities</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate("/roles")}>
                Choose Role
              </Button>
            </div>
          )}
        </div>

        {/* Job Search Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search Live Jobs
            </CardTitle>
            <CardDescription>
              Search for real-time job opportunities from Adzuna API
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder={`Search jobs (e.g., ${selectedRole?.title || 'Frontend Developer, Data Scientist'})`}
                  value={jobSearchQuery}
                  onChange={(e) => setJobSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleJobSearch()}
                />
              </div>
              <Select value={jobLocation} onValueChange={handleLocationChange}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in">🇮🇳 India</SelectItem>
                  <SelectItem value="us">🇺🇸 USA</SelectItem>
                  <SelectItem value="gb">🇬🇧 UK</SelectItem>
                  <SelectItem value="ca">🇨🇦 Canada</SelectItem>
                  <SelectItem value="au">🇦🇺 Australia</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleJobSearch} disabled={loadingJobs}>
                {loadingJobs ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                Search
              </Button>
              <Button variant="outline" onClick={() => loadJobs()} disabled={loadingJobs}>
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Job Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Briefcase className="h-8 w-8 text-primary" />
                <div className="ml-4">
                  <p className="text-2xl font-bold">{jobs.length}</p>
                  <p className="text-sm text-muted-foreground">Live Jobs Found</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Target className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold">
                    {jobs.filter(job => job.matchScore >= 70).length}
                  </p>
                  <p className="text-sm text-muted-foreground">High Match (70%+)</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Zap className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold">{totalJobs}</p>
                  <p className="text-sm text-muted-foreground">Total Available</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Jobs Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {loadingJobs ? "Loading Jobs..." : `${jobs.length} Jobs Found`}
            </h2>
            {jobs.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Sorted by skill match</span>
                <Badge variant="outline">Best matches first</Badge>
              </div>
            )}
          </div>

          {loadingJobs ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
                <h3 className="text-lg font-semibold mb-2">Searching Live Jobs</h3>
                <p className="text-muted-foreground">
                  Fetching real-time opportunities from Adzuna...
                </p>
              </div>
            </div>
          ) : jobs.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map(job => (
                <JobCard key={job.jobId} job={job} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Briefcase className="h-20 w-20 mx-auto mb-6 text-muted-foreground opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No Jobs Found</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {selectedRole 
                  ? `No live jobs found for "${selectedRole.title}" in the selected location. Try searching for different roles or check back later.`
                  : "Try searching for specific roles or select a target role to see relevant opportunities."
                }
              </p>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => loadJobs()} variant="outline">
                  <Search className="h-4 w-4 mr-2" />
                  Refresh Jobs
                </Button>
                {!selectedRole && (
                  <Button onClick={() => navigate("/roles")}>
                    <Target className="h-4 w-4 mr-2" />
                    Choose Target Role
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Help Section */}
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Briefcase className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">About Live Jobs</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  These are real-time job opportunities fetched from Adzuna's job search API. 
                  Jobs are matched against your skills and sorted by relevance to help you find the best opportunities.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-xs">Real-time data</Badge>
                  <Badge variant="outline" className="text-xs">Skill matching</Badge>
                  <Badge variant="outline" className="text-xs">Direct apply links</Badge>
                  <Badge variant="outline" className="text-xs">Multiple countries</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};
