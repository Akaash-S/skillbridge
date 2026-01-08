import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { Layout } from "@/components/Layout";
import { SkillChip } from "@/components/SkillChip";
import { StepIndicator } from "@/components/StepIndicator";
import { ProficiencyLevel } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, ArrowRight, Target, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";

export const Skills = () => {
  const [search, setSearch] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("");
  const [proficiency, setProficiency] = useState<ProficiencyLevel>("intermediate");
  const [currentPage, setCurrentPage] = useState(1);
  const [availableSkills, setAvailableSkills] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loadingSkills, setLoadingSkills] = useState(false);
  const [roleAnalysis, setRoleAnalysis] = useState<any>(null);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  
  const { 
    userSkills, 
    masterSkills, 
    selectedRole, 
    addSkill, 
    removeSkill, 
    updateSkillProficiency, 
    loading, 
    error, 
    clearError,
    isAuthenticated 
  } = useApp();
  const navigate = useNavigate();

  // Filter master skills to exclude user skills
  const getFilteredMasterSkills = useMemo(() => {
    if (!masterSkills.length) return [];
    
    const userSkillIds = new Set(userSkills.map(skill => skill.id));
    return masterSkills.filter(skill => !userSkillIds.has(skill.id));
  }, [masterSkills, userSkills]);

  // Apply search and pagination to filtered master skills
  const getAvailableSkillsFromMaster = useMemo(() => {
    let filtered = getFilteredMasterSkills;
    
    // Apply search filter
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(skill => 
        skill.name.toLowerCase().includes(searchLower) ||
        skill.category.toLowerCase().includes(searchLower)
      );
    }
    
    // Calculate pagination
    const itemsPerPage = 20;
    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedSkills = filtered.slice(startIndex, endIndex);
    
    return {
      skills: paginatedSkills,
      pagination: {
        page: currentPage,
        limit: itemsPerPage,
        total: totalItems,
        totalPages,
        hasNext: currentPage < totalPages,
        hasPrev: currentPage > 1
      }
    };
  }, [getFilteredMasterSkills, search, currentPage]);

  // Load additional skills via API if master skills are not sufficient
  const loadAvailableSkillsFromAPI = async (page: number = 1, searchQuery: string = "") => {
    // Only use API if we don't have master skills or need to search beyond what we have
    if (masterSkills.length > 0 && !searchQuery) {
      return; // Use master skills instead
    }
    
    setLoadingSkills(true);
    try {
      const result = await apiService.getMasterSkillsPaginated({
        page,
        limit: 20,
        search: searchQuery || undefined,
        excludeUserSkills: true
      });
      
      setAvailableSkills(result.skills);
      setPagination(result.pagination);
    } catch (error) {
      console.error('Failed to load available skills:', error);
      toast({
        title: "Error",
        description: "Failed to load available skills",
        variant: "destructive",
      });
    } finally {
      setLoadingSkills(false);
    }
  };

  // Load skills with role analysis if target role is selected
  const loadSkillsWithRoleAnalysis = async () => {
    if (selectedRole && isAuthenticated) {
      try {
        const result = await apiService.getSkillsWithRoleAnalysis(selectedRole.id);
        setRoleAnalysis(result.roleAnalysis);
      } catch (error) {
        console.error('Failed to load role analysis:', error);
      }
    }
  };

  // Initialize data on component mount
  useEffect(() => {
    console.log('🎯 Skills page initializing...', {
      masterSkillsCount: masterSkills.length,
      userSkillsCount: userSkills.length,
      hasSelectedRole: !!selectedRole,
      isAuthenticated
    });

    // Use master skills from context if available
    if (masterSkills.length > 0) {
      console.log('✅ Using master skills from context');
      const result = getAvailableSkillsFromMaster;
      setAvailableSkills(result.skills);
      setPagination(result.pagination);
      setInitialDataLoaded(true);
    } else if (isAuthenticated) {
      console.log('🔄 Loading skills from API...');
      loadAvailableSkillsFromAPI(1, search);
    }

    // Load role analysis if target role is selected
    if (selectedRole) {
      loadSkillsWithRoleAnalysis();
    }
  }, [masterSkills, userSkills, selectedRole, isAuthenticated]);

  // Update available skills when master skills or user skills change
  useEffect(() => {
    if (masterSkills.length > 0) {
      const result = getAvailableSkillsFromMaster;
      setAvailableSkills(result.skills);
      setPagination(result.pagination);
      setInitialDataLoaded(true);
    }
  }, [getAvailableSkillsFromMaster]);

  // Handle search with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1);
      
      if (masterSkills.length > 0) {
        // Use local filtering for master skills
        const result = getAvailableSkillsFromMaster;
        setAvailableSkills(result.skills);
        setPagination(result.pagination);
      } else {
        // Use API for search
        loadAvailableSkillsFromAPI(1, search);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [search, getAvailableSkillsFromMaster, masterSkills.length]);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    
    if (masterSkills.length > 0) {
      // Page change will be handled by the useMemo effect
      return;
    } else {
      loadAvailableSkillsFromAPI(page, search);
    }
  };

  const groupedSkills = useMemo(() => {
    const groups: Record<string, typeof availableSkills> = {};
    availableSkills.forEach((skill) => {
      if (!groups[skill.category]) {
        groups[skill.category] = [];
      }
      groups[skill.category].push(skill);
    });
    return groups;
  }, [availableSkills]);

  const handleAddSkill = async () => {
    if (!selectedSkill) {
      toast({
        title: "Select a skill",
        description: "Please select a skill to add.",
        variant: "destructive",
      });
      return;
    }

    try {
      await addSkill(selectedSkill, proficiency);
      setSelectedSkill("");
      setProficiency("intermediate");
      
      // Skills will be automatically updated via AppContext
      // Available skills will be updated via useEffect when userSkills changes
      
      // Reload role analysis if target role is selected
      if (selectedRole) {
        loadSkillsWithRoleAnalysis();
      }
      
      toast({
        title: "Skill added",
        description: "Your skill has been added successfully.",
      });
    } catch (error) {
      // Error is handled in the context
    }
  };

  const handleRemoveSkill = async (skillId: string) => {
    try {
      await removeSkill(skillId);
      
      // Skills will be automatically updated via AppContext
      // Available skills will be updated via useEffect when userSkills changes
      
      // Reload role analysis if target role is selected
      if (selectedRole) {
        loadSkillsWithRoleAnalysis();
      }
      
      toast({
        title: "Skill removed",
        description: "Your skill has been removed successfully.",
      });
    } catch (error) {
      // Error is handled in the context
    }
  };

  const handleUpdateProficiency = async (skillId: string, newProficiency: ProficiencyLevel) => {
    try {
      await updateSkillProficiency(skillId, newProficiency);
      
      // Reload role analysis if target role is selected
      if (selectedRole) {
        loadSkillsWithRoleAnalysis();
      }
      
      toast({
        title: "Skill updated",
        description: "Your skill proficiency has been updated.",
      });
    } catch (error) {
      // Error is handled in the context
    }
  };

  const handleContinue = () => {
    if (userSkills.length === 0) {
      toast({
        title: "Add at least one skill",
        description: "Please add at least one skill before continuing.",
        variant: "destructive",
      });
      return;
    }
    navigate("/roles");
  };

  if (error) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={clearError}>Try Again</Button>
          </div>
        </div>
      </Layout>
    );
  }

  // Show loading state only if we don't have any data yet
  const isInitialLoading = !initialDataLoaded && loadingSkills && availableSkills.length === 0;

  if (isInitialLoading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading skills...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Step Indicator */}
        <StepIndicator currentStep={1} />

        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Add Your Skills</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Tell us what skills you already have. Be honest about your proficiency levels 
            for the most accurate analysis.
          </p>
          {masterSkills.length > 0 && (
            <p className="text-xs text-green-600 dark:text-green-400">
              ⚡ {masterSkills.length} skills loaded instantly from cache
            </p>
          )}
        </div>

        {/* Role Analysis Summary */}
        {roleAnalysis && (
          <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg">Skills for {roleAnalysis.roleTitle}</CardTitle>
              <CardDescription>
                Your readiness: {roleAnalysis.readinessScore}% • {roleAnalysis.matchedCount} matched, {roleAnalysis.missingCount} missing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-3 gap-4 text-sm">
                <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-950/20">
                  <div className="text-2xl font-bold text-green-600">{roleAnalysis.matchedCount}</div>
                  <div className="text-green-700 dark:text-green-400">Matched</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/20">
                  <div className="text-2xl font-bold text-yellow-600">{roleAnalysis.partialCount}</div>
                  <div className="text-yellow-700 dark:text-yellow-400">Partial</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-red-50 dark:bg-red-950/20">
                  <div className="text-2xl font-bold text-red-600">{roleAnalysis.missingCount}</div>
                  <div className="text-red-700 dark:text-red-400">Missing</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Add Skill Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Add a New Skill</CardTitle>
            <CardDescription>
              Search and select skills, then rate your proficiency level.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search skills..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Select value={selectedSkill} onValueChange={setSelectedSkill}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a skill" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {loadingSkills ? (
                    <div className="p-4 text-center">
                      <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                    </div>
                  ) : (
                    Object.entries(groupedSkills).map(([category, skills]) => (
                      <div key={category}>
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                          {category}
                        </div>
                        {skills.map((skill) => (
                          <SelectItem key={skill.id} value={skill.id}>
                            {skill.name}
                          </SelectItem>
                        ))}
                      </div>
                    ))
                  )}
                </SelectContent>
              </Select>

              <Select
                value={proficiency}
                onValueChange={(v) => setProficiency(v as ProficiencyLevel)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Button onClick={handleAddSkill} disabled={loading || loadingSkills}>
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}
                Add Skill
              </Button>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!pagination.hasPrev || loadingSkills}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {currentPage} of {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!pagination.hasNext || loadingSkills}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Current Skills */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Skills ({userSkills.length})</CardTitle>
            <CardDescription>
              Click on a skill to update proficiency, or remove it.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {userSkills.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No skills added yet.</p>
                <p className="text-sm">Search and add skills above to get started.</p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {userSkills.map((skill) => (
                  <div key={skill.id} className="group relative">
                    <SkillChip
                      name={skill.name}
                      proficiency={skill.proficiency}
                      onRemove={() => handleRemoveSkill(skill.id)}
                    />
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <div className="bg-popover border border-border rounded-lg shadow-lg p-2 flex gap-1">
                        {(["beginner", "intermediate", "advanced"] as ProficiencyLevel[]).map(
                          (level) => (
                            <button
                              key={level}
                              onClick={() => handleUpdateProficiency(skill.id, level)}
                              className={`px-2 py-1 text-xs rounded capitalize ${
                                skill.proficiency === level
                                  ? "bg-primary text-primary-foreground"
                                  : "hover:bg-muted"
                              }`}
                            >
                              {level}
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Continue Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleContinue}
            size="lg"
            className="group"
            disabled={userSkills.length === 0}
          >
            Choose Target Role
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </Layout>
  );
};