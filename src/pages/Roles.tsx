import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useAppData } from "@/context/AppDataContext";
import { Layout } from "@/components/Layout";
import { RoleCard } from "@/components/RoleCard";
import { SkillChip } from "@/components/SkillChip";
import { StepIndicator } from "@/components/StepIndicator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, ArrowRight, Briefcase, DollarSign, TrendingUp, Loader2, Target, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { apiClient } from "@/services/apiClient";

export const Roles = () => {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [rolesWithSkillMatch, setRolesWithSkillMatch] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [userSkillsCount, setUserSkillsCount] = useState(0);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  
  const { 
    selectedRole, 
    selectRole, 
    userSkills, 
    jobRoles, 
    loading, 
    error, 
    clearError
  } = useAppData();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Calculate skill matching locally using cached data
  const calculateSkillMatch = (role: any) => {
    if (!userSkills.length) {
      return {
        percentage: 0,
        matched: 0,
        partial: 0,
        missing: role.requiredSkills?.length || 0,
        total: role.requiredSkills?.length || 0
      };
    }

    const requiredSkills = role.requiredSkills || [];
    const userSkillMap = new Map(userSkills.map(skill => [skill.id, skill.proficiency]));
    const proficiencyValues = { 'beginner': 1, 'intermediate': 2, 'advanced': 3 };

    let matched = 0;
    let partial = 0;

    requiredSkills.forEach((reqSkill: any) => {
      const userProficiency = userSkillMap.get(reqSkill.skillId);
      if (userProficiency) {
        const userLevel = proficiencyValues[userProficiency as keyof typeof proficiencyValues] || 1;
        const requiredLevel = proficiencyValues[reqSkill.minProficiency as keyof typeof proficiencyValues] || 2;
        
        if (userLevel >= requiredLevel) {
          matched++;
        } else {
          partial++;
        }
      }
    });

    const total = requiredSkills.length;
    const missing = total - matched - partial;
    const percentage = total > 0 ? ((matched + partial * 0.5) / total * 100) : 0;

    return {
      percentage: Math.round(percentage * 10) / 10,
      matched,
      partial,
      missing,
      total
    };
  };

  // Process job roles with skill matching locally
  const processedRoles = useMemo(() => {
    if (!jobRoles.length) return [];

    let filtered = jobRoles;

    // Apply category filter
    if (categoryFilter) {
      filtered = filtered.filter(role => role.category === categoryFilter);
    }

    // Apply search filter
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(role => 
        role.title.toLowerCase().includes(searchLower) ||
        role.description.toLowerCase().includes(searchLower) ||
        role.category.toLowerCase().includes(searchLower)
      );
    }

    // Add skill matching and sort by match percentage
    const rolesWithMatch = filtered.map(role => ({
      ...role,
      skillMatch: calculateSkillMatch(role)
    }));

    // Sort by skill match percentage (highest first)
    return rolesWithMatch.sort((a, b) => b.skillMatch.percentage - a.skillMatch.percentage);
  }, [jobRoles, userSkills, categoryFilter, search]);

  // Extract unique categories from job roles
  const availableCategories = useMemo(() => {
    if (!jobRoles.length) return [];
    const categorySet = new Set(jobRoles.map(role => role.category).filter(Boolean));
    return Array.from(categorySet).sort();
  }, [jobRoles]);

  // Load roles with skill matching from API (fallback)
  const loadRolesWithSkillMatchFromAPI = async (category?: string) => {
    setLoadingRoles(true);
    try {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      params.append('limit', '50');
      
      const result = await apiClient.get<{
        roles: any[];
        userSkillsCount: number;
      }>(`/roles/with-skill-match?${params.toString()}`);
      
      setRolesWithSkillMatch(result.roles);
      setUserSkillsCount(result.userSkillsCount);
    } catch (error) {
      console.error('Failed to load roles with skill match:', error);
      toast({
        title: "Error",
        description: "Failed to load job roles",
        variant: "destructive",
      });
    } finally {
      setLoadingRoles(false);
    }
  };

  // Load role categories
  const loadCategories = async () => {
    try {
      const result = await apiClient.get<{ categories: string[] }>('/roles/categories');
      setCategories(result.categories);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  // Initialize data on component mount
  useEffect(() => {
    console.log('💼 Roles page initializing...', {
      jobRolesCount: jobRoles.length,
      userSkillsCount: userSkills.length,
      isAuthenticated
    });

    // Use job roles from context if available
    if (jobRoles.length > 0) {
      console.log('✅ Using job roles from context');
      setRolesWithSkillMatch(processedRoles);
      setCategories(availableCategories);
      setUserSkillsCount(userSkills.length);
      setInitialDataLoaded(true);
    } else if (isAuthenticated) {
      console.log('🔄 Loading roles from API...');
      loadRolesWithSkillMatchFromAPI();
      loadCategories();
    }
  }, [jobRoles, userSkills, isAuthenticated]);

  // Update processed roles when dependencies change
  useEffect(() => {
    if (jobRoles.length > 0) {
      setRolesWithSkillMatch(processedRoles);
      setCategories(availableCategories);
      setUserSkillsCount(userSkills.length);
      setInitialDataLoaded(true);
    }
  }, [processedRoles, availableCategories, userSkills.length]);

  // Handle category filter change (only for API-loaded data)
  useEffect(() => {
    if (!jobRoles.length && isAuthenticated) {
      loadRolesWithSkillMatchFromAPI(categoryFilter || undefined);
    }
  }, [categoryFilter, jobRoles.length, isAuthenticated]);

  const filteredRoles = useMemo(() => {
    // Use processedRoles if we have job roles from context, otherwise use API data
    const rolesToFilter = jobRoles.length > 0 ? processedRoles : rolesWithSkillMatch;
    
    return rolesToFilter.filter((role) => {
      const matchesSearch = role.title.toLowerCase().includes(search.toLowerCase()) ||
        role.description.toLowerCase().includes(search.toLowerCase());
      return matchesSearch;
    });
  }, [search, processedRoles, rolesWithSkillMatch, jobRoles.length]);

  const detailRole = useMemo(() => {
    const rolesToSearch = jobRoles.length > 0 ? processedRoles : rolesWithSkillMatch;
    return rolesToSearch.find((r) => r.id === selectedRoleId);
  }, [selectedRoleId, processedRoles, rolesWithSkillMatch, jobRoles.length]);

  const handleSelectRole = async (roleId: string) => {
    const rolesToSearch = jobRoles.length > 0 ? processedRoles : rolesWithSkillMatch;
    const role = rolesToSearch.find((r) => r.id === roleId);
    if (role) {
      try {
        await selectRole(role);
        toast({
          title: "Role selected",
          description: `${role.title} has been set as your target role.`,
        });
        navigate("/analysis");
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to select role. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const getSkillMatchColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600 bg-green-50 dark:bg-green-950/20";
    if (percentage >= 60) return "text-yellow-600 bg-yellow-50 dark:bg-yellow-950/20";
    if (percentage >= 40) return "text-orange-600 bg-orange-50 dark:bg-orange-950/20";
    return "text-red-600 bg-red-50 dark:bg-red-950/20";
  };

  const getSkillMatchIcon = (percentage: number) => {
    if (percentage >= 80) return CheckCircle2;
    if (percentage >= 60) return Target;
    return AlertCircle;
  };

  const handleContinue = () => {
    if (!selectedRole) {
      toast({
        title: "Select a role",
        description: "Please select a target role before continuing.",
        variant: "destructive",
      });
      return;
    }
    navigate("/analysis");
  };

  if (error) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={clearError}>Try Again</Button>
          </div>
        </div>
      </Layout>
    );
  }

  // Show loading state only if we don't have any data yet
  const isInitialLoading = !initialDataLoaded && loadingRoles && filteredRoles.length === 0;

  if (isInitialLoading) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading job roles...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Step Indicator */}
        <StepIndicator currentStep={2} />

        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Choose Your Target Role</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Select the job role you want to work towards. We'll analyze your skills 
            and create a personalized roadmap.
          </p>
          {userSkillsCount > 0 && (
            <p className="text-sm text-primary">
              Showing skill match based on your {userSkillsCount} skills
            </p>
          )}
          {jobRoles.length > 0 && (
            <p className="text-xs text-green-600 dark:text-green-400">
              ⚡ {jobRoles.length} roles loaded instantly with skill matching
            </p>
          )}
        </div>

        {/* Selected Role Banner */}
        {selectedRole && (
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Selected Target Role</p>
                <p className="font-semibold text-lg">{selectedRole.title}</p>
              </div>
            </div>
            <Button onClick={handleContinue} className="group">
              Analyze Skills
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search roles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
            <Button
              variant={categoryFilter === null ? "default" : "outline"}
              size="sm"
              onClick={() => setCategoryFilter(null)}
            >
              All
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={categoryFilter === category ? "default" : "outline"}
                size="sm"
                onClick={() => setCategoryFilter(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loadingRoles && (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading roles with skill matching...</p>
          </div>
        )}

        {/* Roles Grid */}
        {!loadingRoles && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRoles.map((role) => {
              const MatchIcon = getSkillMatchIcon(role.skillMatch.percentage);
              
              return (
                <Card
                  key={role.id}
                  className={`cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] ${
                    selectedRole?.id === role.id ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => setSelectedRoleId(role.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-1">{role.title}</CardTitle>
                        <Badge variant="secondary" className="text-xs">
                          {role.category}
                        </Badge>
                      </div>
                      {userSkillsCount > 0 && (
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getSkillMatchColor(role.skillMatch.percentage)}`}>
                          <MatchIcon className="h-3 w-3" />
                          {role.skillMatch.percentage}%
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription className="text-sm mb-4 line-clamp-2">
                      {role.description}
                    </CardDescription>
                    
                    {userSkillsCount > 0 && (
                      <div className="grid grid-cols-3 gap-2 text-xs mb-4">
                        <div className="text-center p-2 rounded bg-green-50 dark:bg-green-950/20">
                          <div className="font-semibold text-green-600">{role.skillMatch.matched}</div>
                          <div className="text-green-700 dark:text-green-400">Matched</div>
                        </div>
                        <div className="text-center p-2 rounded bg-yellow-50 dark:bg-yellow-950/20">
                          <div className="font-semibold text-yellow-600">{role.skillMatch.partial}</div>
                          <div className="text-yellow-700 dark:text-yellow-400">Partial</div>
                        </div>
                        <div className="text-center p-2 rounded bg-red-50 dark:bg-red-950/20">
                          <div className="font-semibold text-red-600">{role.skillMatch.missing}</div>
                          <div className="text-red-700 dark:text-red-400">Missing</div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        <span>{role.avgSalary || "Varies"}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" />
                        <span>{role.demand || "Medium"}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!loadingRoles && filteredRoles.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No roles found matching your criteria.</p>
            <p className="text-sm">Try adjusting your search or category filter.</p>
          </div>
        )}

        {/* Role Detail Dialog */}
        <Dialog open={!!selectedRoleId} onOpenChange={() => setSelectedRoleId(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            {detailRole && (
              <>
                <DialogHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <DialogTitle className="text-2xl">{detailRole.title}</DialogTitle>
                      <DialogDescription className="text-base mt-2">
                        {detailRole.description}
                      </DialogDescription>
                    </div>
                    {userSkillsCount > 0 && (
                      <div className={`flex items-center gap-2 px-3 py-2 rounded-full font-medium ${getSkillMatchColor(detailRole.skillMatch.percentage)}`}>
                        <Target className="h-4 w-4" />
                        {detailRole.skillMatch.percentage}% Match
                      </div>
                    )}
                  </div>
                </DialogHeader>

                <div className="space-y-6">
                  {/* Skill Match Summary */}
                  {userSkillsCount > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3">Skill Match Analysis</h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-950/20">
                          <div className="text-2xl font-bold text-green-600">{detailRole.skillMatch.matched}</div>
                          <div className="text-sm text-green-700 dark:text-green-400">Matched Skills</div>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950/20">
                          <div className="text-2xl font-bold text-yellow-600">{detailRole.skillMatch.partial}</div>
                          <div className="text-sm text-yellow-700 dark:text-yellow-400">Partial Match</div>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-red-50 dark:bg-red-950/20">
                          <div className="text-2xl font-bold text-red-600">{detailRole.skillMatch.missing}</div>
                          <div className="text-sm text-red-700 dark:text-red-400">Missing Skills</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Required Skills */}
                  <div>
                    <h4 className="font-semibold mb-3">Required Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {detailRole.requiredSkills?.map((skill: any, index: number) => (
                        <SkillChip
                          key={index}
                          name={skill.skillId?.replace('-', ' ') || `Skill ${index + 1}`}
                          proficiency={skill.minProficiency || "intermediate"}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Role Details */}
                  <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <p className="text-sm text-muted-foreground">Category</p>
                      <p className="font-medium">{detailRole.category}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Average Salary</p>
                      <p className="font-medium">{detailRole.avgSalary || "Varies"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Demand</p>
                      <p className="font-medium">{detailRole.demand || "Medium"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Required Skills</p>
                      <p className="font-medium">{detailRole.requiredSkills?.length || 0} skills</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={() => handleSelectRole(detailRole.id)}
                      className="flex-1"
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Target className="mr-2 h-4 w-4" />
                      )}
                      Select This Role
                    </Button>
                    <Button variant="outline" onClick={() => setSelectedRoleId(null)}>
                      Close
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};