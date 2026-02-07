import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import { useAppData } from "@/context/AppDataContext";
import { Briefcase, ExternalLink, MapPin, Clock, Zap, Loader2, Search, Target, AlertCircle, RefreshCw, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiClient } from "@/services/apiClient";
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

interface JobsCache {
  [key: string]: {
    jobs: Job[];
    timestamp: number;
    totalJobs: number;
    searchTerm: string;
  };
}

// Optimized cache duration: 3 minutes for faster updates
const CACHE_DURATION = 3 * 60 * 1000;
// Debounce delay for search input
const SEARCH_DEBOUNCE_DELAY = 500;

export const Opportunities = () => {
  const { userSkills, selectedRole } = useAppData();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Refs for performance optimization
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // State for jobs
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [jobSearchQuery, setJobSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [jobLocation, setJobLocation] = useState("in");
  const [totalJobs, setTotalJobs] = useState(0);
  const [lastSearchTime, setLastSearchTime] = useState<number>(0);
  const [jobsCache, setJobsCache] = useState<JobsCache>({});
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [searchPerformance, setSearchPerformance] = useState<{
    lastSearchDuration: number;
    cacheHitRate: number;
    totalSearches: number;
    cacheHits: number;
  }>({
    lastSearchDuration: 0,
    cacheHitRate: 0,
    totalSearches: 0,
    cacheHits: 0
  });

  // Debounce search input
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchQuery(jobSearchQuery);
    }, SEARCH_DEBOUNCE_DELAY);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [jobSearchQuery]);

  // Memoized cache key with better performance
  const cacheKey = useMemo(() => {
    const searchTerm = debouncedSearchQuery.trim() || selectedRole?.title || "Software Developer";
    return `${searchTerm.toLowerCase().replace(/\s+/g, '_')}_${jobLocation}`;
  }, [debouncedSearchQuery, selectedRole?.title, jobLocation]);

  // Fixed cache management without infinite re-renders
  const getCachedJobs = useCallback((key: string): Job[] | null => {
    const cached = jobsCache[key];
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.jobs;
    }
    return null;
  }, [jobsCache]);

  // Enhanced cache setter with metadata
  const setCachedJobs = useCallback((key: string, jobs: Job[], total: number, searchTerm: string) => {
    setJobsCache(prev => ({
      ...prev,
      [key]: {
        jobs,
        timestamp: Date.now(),
        totalJobs: total,
        searchTerm
      }
    }));
  }, []);

  // Optimized skill matching with memoization - FIXED dependencies
  const calculateSkillMatch = useCallback((job: Job) => {
    if (!userSkills || userSkills.length === 0) {
      return { matchScore: 50, matchingSkills: [] };
    }

    const jobSkills = job.skills || [];
    const userSkillNames = userSkills.map(skill => skill.name.toLowerCase());
    
    // Enhanced fuzzy matching
    const matchingSkills = jobSkills.filter(skill => {
      const skillLower = skill.toLowerCase();
      return userSkillNames.some(userSkill => {
        // Exact match
        if (userSkill === skillLower) return true;
        // Contains match
        if (userSkill.includes(skillLower) || skillLower.includes(userSkill)) return true;
        // Word boundary match
        const words = userSkill.split(/\s+/);
        return words.some(word => word === skillLower || skillLower.includes(word));
      });
    });
    
    const matchScore = jobSkills.length > 0 
      ? Math.round((matchingSkills.length / jobSkills.length) * 100)
      : 50;
    
    return { matchScore, matchingSkills };
  }, [userSkills]); // Only depend on userSkills, not the function itself

  // Enhanced job loading with abort controller and performance tracking - FIXED dependencies
  const loadJobs = useCallback(async (searchRole?: string, location: string = "in", forceRefresh: boolean = false) => {
    const roleToSearch = searchRole?.trim() || selectedRole?.title || "Software Developer";
    const currentCacheKey = `${roleToSearch.toLowerCase().replace(/\s+/g, '_')}_${location}`;
    
    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cached = jobsCache[currentCacheKey];
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        setJobs(cached.jobs);
        setTotalJobs(cached.totalJobs || cached.jobs.length);
        setIsInitialLoad(false);
        
        // Update performance metrics separately
        setSearchPerformance(prev => ({
          ...prev,
          cacheHits: prev.cacheHits + 1,
          cacheHitRate: ((prev.cacheHits + 1) / (prev.totalSearches + 1)) * 100
        }));
        return;
      }
    }

    // Update performance metrics
    setSearchPerformance(prev => ({
      ...prev,
      totalSearches: prev.totalSearches + 1,
      cacheHitRate: (prev.cacheHits / (prev.totalSearches + 1)) * 100
    }));

    setLoadingJobs(true);
    const startTime = Date.now();
    
    // Create new abort controller
    abortControllerRef.current = new AbortController();
    
    try {
      
      const params = new URLSearchParams();
      params.append('role', roleToSearch);
      params.append('country', location);
      params.append('limit', '50'); // Increased limit for better results
      
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
          source: string;
        };
      }>(`/jobs/search?${params.toString()}`, false); // Disable apiClient cache since we have our own
      
      const jobsData = response.results?.jobs || [];
      const total = response.results?.total || jobsData.length;
      const source = response.results?.source || 'api';
      
      const searchDuration = Date.now() - startTime;
      
      // Calculate match scores in batches for better performance
      const jobsWithScores = jobsData.map((job: Job) => {
        const jobSkills = job.skills || [];
        const userSkillNames = (userSkills || []).map(skill => skill.name.toLowerCase());
        
        const matchingSkills = jobSkills.filter(skill => {
          const skillLower = skill.toLowerCase();
          return userSkillNames.some(userSkill => {
            if (userSkill === skillLower) return true;
            if (userSkill.includes(skillLower) || skillLower.includes(userSkill)) return true;
            const words = userSkill.split(/\s+/);
            return words.some(word => word === skillLower || skillLower.includes(word));
          });
        });
        
        const matchScore = jobSkills.length > 0 
          ? Math.round((matchingSkills.length / jobSkills.length) * 100)
          : 50;
        
        return {
          ...job,
          matchScore,
          matchingSkills
        };
      });
      
      // Sort by match score (highest first) with stable sort
      jobsWithScores.sort((a, b) => {
        if (b.matchScore !== a.matchScore) {
          return b.matchScore - a.matchScore;
        }
        // Secondary sort by posted date (newest first)
        return new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime();
      });
      
      // Update state
      setJobs(jobsWithScores);
      setTotalJobs(total);
      setLastSearchTime(Date.now());
      
      // Update performance metrics
      setSearchPerformance(prev => ({
        ...prev,
        lastSearchDuration: searchDuration
      }));
      
      // Cache the results
      setJobsCache(prev => ({
        ...prev,
        [currentCacheKey]: {
          jobs: jobsWithScores,
          timestamp: Date.now(),
          totalJobs: total,
          searchTerm: roleToSearch
        }
      }));
      
      
      // Show success toast for manual searches
      if (!isInitialLoad && forceRefresh) {
        toast({
          title: "Jobs Updated",
          description: `Found ${jobsWithScores.length} opportunities in ${searchDuration}ms`,
        });
      }
      
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return;
      }
      
      console.error('❌ Failed to load jobs:', error);
      toast({
        title: "Search Error",
        description: "Failed to fetch jobs. Please try again.",
        variant: "destructive",
      });
      setJobs([]);
      setTotalJobs(0);
    } finally {
      setLoadingJobs(false);
      setIsInitialLoad(false);
      abortControllerRef.current = null;
    }
  }, [selectedRole?.title, userSkills, jobsCache, isInitialLoad]); // Fixed dependencies

  // Load jobs on component mount and when target role changes - FIXED dependencies
  useEffect(() => {
    // Load jobs immediately when component mounts
    if (selectedRole?.id) {
      loadJobs(selectedRole.title, jobLocation, false);
    } else {
      loadJobs("Software Developer", jobLocation, false);
    }
  }, [selectedRole?.id, jobLocation]); // Only depend on selectedRole.id and jobLocation

  // Auto-search when debounced query changes - FIXED dependencies
  useEffect(() => {
    if (debouncedSearchQuery.trim() && debouncedSearchQuery !== (selectedRole?.title || "")) {
      loadJobs(debouncedSearchQuery, jobLocation, false);
    }
  }, [debouncedSearchQuery, jobLocation, selectedRole?.title]); // Removed loadJobs from dependencies

  // Enhanced job search with immediate feedback - FIXED dependencies
  const handleJobSearch = useCallback(() => {
    const searchTerm = jobSearchQuery.trim() || selectedRole?.title || "Software Developer";
    loadJobs(searchTerm, jobLocation, true);
  }, [jobSearchQuery, jobLocation, selectedRole?.title]); // Removed loadJobs from dependencies

  // Enhanced location change with immediate search - FIXED dependencies
  const handleLocationChange = useCallback((newLocation: string) => {
    setJobLocation(newLocation);
    const searchTerm = debouncedSearchQuery.trim() || selectedRole?.title || "Software Developer";
    // Use setTimeout to avoid stale closure
    setTimeout(() => {
      loadJobs(searchTerm, newLocation, true);
    }, 0);
  }, [debouncedSearchQuery, selectedRole?.title]); // Removed loadJobs from dependencies

  // Enhanced refresh with performance tracking - FIXED dependencies
  const handleRefresh = useCallback(() => {
    const searchTerm = debouncedSearchQuery.trim() || selectedRole?.title || "Software Developer";
    loadJobs(searchTerm, jobLocation, true);
  }, [debouncedSearchQuery, selectedRole?.title, jobLocation]); // Removed loadJobs from dependencies

  // Clear search and reset to default - FIXED dependencies
  const handleClearSearch = useCallback(() => {
    setJobSearchQuery("");
    setDebouncedSearchQuery("");
    if (selectedRole?.title) {
      setTimeout(() => {
        loadJobs(selectedRole.title, jobLocation, false);
      }, 0);
    }
  }, [selectedRole?.title, jobLocation]); // Removed loadJobs from dependencies

  // Job Skeleton Component for loading states
  const JobSkeleton = () => (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-20" />
            </div>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <div className="text-right">
            <Skeleton className="h-8 w-12" />
            <Skeleton className="h-3 w-8 mt-1" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-16 w-full" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="flex flex-wrap gap-1">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-14" />
        </div>
        <Skeleton className="h-2 w-full" />
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  );
  // Job Card Component - Optimized with memoization
  const JobCard = useCallback(({ job }: { job: Job }) => (
    <Card className="hover:border-primary/50 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <Badge className="bg-green-600 text-white">
                <Briefcase className="h-3 w-3 mr-1" />
                Live
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
  ), [userSkills]);

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
              Fast Job Search
              {searchPerformance.lastSearchDuration > 0 && (
                <Badge variant="outline" className="text-xs">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {searchPerformance.lastSearchDuration}ms
                </Badge>
              )}
              {lastSearchTime > 0 && (
                <Badge variant="outline" className="text-xs">
                  <RefreshCw className="h-3 w-3 mr-1" />
                  {Math.floor((Date.now() - lastSearchTime) / 1000)}s ago
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Real-time job search with smart caching • {searchPerformance.cacheHitRate.toFixed(1)}% cache hit rate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Input
                  id="job-search"
                  name="job-search"
                  placeholder="Search any job title (e.g., React Developer, Data Analyst, Product Manager)"
                  value={jobSearchQuery}
                  onChange={(e) => setJobSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleJobSearch()}
                  className="pr-20"
                  autoComplete="off"
                />
                {jobSearchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                    onClick={handleClearSearch}
                  >
                    ✕
                  </Button>
                )}
                {debouncedSearchQuery !== jobSearchQuery && jobSearchQuery.trim() && (
                  <div className="absolute right-8 top-1/2 -translate-y-1/2">
                    <div className="h-2 w-2 bg-yellow-500 rounded-full animate-pulse"></div>
                  </div>
                )}
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
              <Button variant="outline" onClick={handleRefresh} disabled={loadingJobs}>
                <RefreshCw className={`h-4 w-4 ${loadingJobs ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
            
            {/* Enhanced search status indicators */}
            <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                {jobsCache[cacheKey] && Date.now() - jobsCache[cacheKey].timestamp < CACHE_DURATION && !loadingJobs && (
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Using cached results</span>
                  </div>
                )}
                {debouncedSearchQuery !== jobSearchQuery && jobSearchQuery.trim() && (
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-yellow-500 rounded-full animate-pulse"></div>
                    <span>Typing... (search in {SEARCH_DEBOUNCE_DELAY}ms)</span>
                  </div>
                )}
                {loadingJobs && (
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span>Searching Adzuna API...</span>
                  </div>
                )}
              </div>
              
              {/* Performance metrics */}
              {searchPerformance.totalSearches > 0 && (
                <div className="flex items-center gap-4">
                  <span>Searches: {searchPerformance.totalSearches}</span>
                  <span>Cache hits: {searchPerformance.cacheHits}</span>
                  {searchPerformance.lastSearchDuration > 0 && (
                    <span>Last: {searchPerformance.lastSearchDuration}ms</span>
                  )}
                </div>
              )}
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
            {jobs.length > 0 && !loadingJobs && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Sorted by skill match</span>
                <Badge variant="outline">Best matches first</Badge>
              </div>
            )}
          </div>

          {loadingJobs ? (
            <div className="space-y-6">
              {/* Show skeleton loading */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <JobSkeleton key={index} />
                ))}
              </div>
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
                  <p className="text-sm text-muted-foreground">
                    Fetching real-time opportunities...
                  </p>
                </div>
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
                <Button onClick={handleRefresh} variant="outline">
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
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Fast Job Search</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Search any job title and get instant results from Adzuna's real-time job database. 
                  Features smart caching, auto-search as you type, and performance optimization for the fastest job search experience.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-xs">Auto-search (500ms delay)</Badge>
                  <Badge variant="outline" className="text-xs">Smart caching (3min)</Badge>
                  <Badge variant="outline" className="text-xs">Request cancellation</Badge>
                  <Badge variant="outline" className="text-xs">Performance tracking</Badge>
                  <Badge variant="outline" className="text-xs">Skill matching</Badge>
                  <Badge variant="outline" className="text-xs">Multi-country</Badge>
                </div>
                
                {/* Performance indicator */}
                {searchPerformance.totalSearches > 0 && (
                  <div className="mt-3 p-2 bg-green-50 dark:bg-green-950/20 rounded border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2 text-xs text-green-700 dark:text-green-300">
                      <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                      <span>
                        Performance: {searchPerformance.totalSearches} searches • 
                        {searchPerformance.cacheHitRate.toFixed(1)}% cache hit rate • 
                        Average response: {searchPerformance.lastSearchDuration}ms
                      </span>
                    </div>
                  </div>
                )}
                
                {/* Search tips */}
                <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-950/20 rounded border border-blue-200 dark:border-blue-800">
                  <div className="text-xs text-blue-700 dark:text-blue-300">
                    <strong>Search Tips:</strong> Try "React Developer", "Data Scientist", "Product Manager", "DevOps Engineer", 
                    "UI/UX Designer", "Machine Learning Engineer", or any job title. Results appear as you type!
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};
