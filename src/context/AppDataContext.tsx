import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect, useRef } from "react";
import { UserSkill, JobRole, RoadmapItem, ProficiencyLevel } from "@/data/mockData";
import { getFixedRoadmap } from "@/data/fixedRoadmaps";
import { apiClient } from "@/services/apiClient";
import { useAuth } from "@/context/AuthContext";

interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  education: string;
  experience: string;
  interests: string[];
  notifications: boolean;
  weeklyGoal: number;
}

interface SkillGapAnalysis {
  readinessScore: number;
  matchedSkills: { skill: UserSkill; required: ProficiencyLevel }[];
  missingSkills: { skillId: string; skillName: string; required: ProficiencyLevel }[];
  partialSkills: { skill: UserSkill; required: ProficiencyLevel }[];
}

interface AnalysisProgress {
  initialScore: number;
  currentScore: number;
  scoreImprovement: number;
  initialMatchedSkills: number;
  currentMatchedSkills: number;
  skillsImprovement: number;
  completedRoadmapItems: number;
  progressHistory: Array<{
    timestamp: string;
    readinessScore: number;
    completedSkills: number;
    event: string;
    skillId?: string;
  }>;
  lastUpdated?: string;
  createdAt?: string;
}

interface AppDataState {
  userSkills: UserSkill[];
  masterSkills: UserSkill[];
  jobRoles: JobRole[];
  selectedRole: JobRole | null;
  analysis: SkillGapAnalysis | null;
  analysisProgress: AnalysisProgress | null;
  roadmap: RoadmapItem[];
  roadmapProgress: any | null;
  loading: boolean;
  error: string | null;
}

interface AppDataContextType extends AppDataState {
  // User profile methods
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  completeOnboarding: (onboardingData: {
    name: string;
    education: string;
    experience: string;
    interests: string[];
  }) => Promise<void>;
  
  // Skills methods
  addSkill: (skillId: string, proficiency: ProficiencyLevel) => Promise<void>;
  removeSkill: (skillId: string) => Promise<void>;
  updateSkillProficiency: (skillId: string, proficiency: ProficiencyLevel) => Promise<void>;
  loadMasterSkills: () => Promise<void>;
  
  // Roles methods
  selectRole: (role: JobRole) => Promise<void>;
  loadJobRoles: () => Promise<void>;
  
  // Analysis methods
  analyzeSkillGap: () => Promise<void>;
  loadFixedRoadmap: () => void;
  markRoadmapItemComplete: (itemId: string) => Promise<void>;
  resetProgress: () => void;
  loadRoadmapProgress: () => Promise<void>;
  refreshRoleData: () => Promise<void>;
  
  // Utility methods
  clearError: () => void;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

interface AppDataProviderProps {
  children: ReactNode;
}

export const AppDataProvider: React.FC<AppDataProviderProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  
  const [state, setState] = useState<AppDataState>({
    userSkills: [],
    masterSkills: [],
    jobRoles: [],
    selectedRole: null,
    analysis: null,
    analysisProgress: null,
    roadmap: [],
    roadmapProgress: null,
    loading: false,
    error: null,
  });

  // Use ref to track timeouts for cleanup to prevent memory leaks
  const timeoutRefs = useRef<NodeJS.Timeout[]>([]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    const currentTimeouts = timeoutRefs.current;
    return () => {
      currentTimeouts.forEach(clearTimeout);
    };
  }, []);

  const clearAllTimeouts = useCallback(() => {
    timeoutRefs.current.forEach(clearTimeout);
    timeoutRefs.current = [];
  }, []);

  const addTimeout = useCallback((fn: () => void, delay: number) => {
    const timeoutId = setTimeout(fn, delay);
    timeoutRefs.current.push(timeoutId);
    return timeoutId;
  }, []);
  // Load initial data when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      loadInitialData();
    }
  }, [isAuthenticated, user]);

  const loadInitialData = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await apiClient.get<{
        initialData: {
          hasData: boolean;
          userSkills?: UserSkill[];
          masterSkills?: UserSkill[];
          jobRoles?: JobRole[];
          userState?: {
            targetRole?: JobRole;
            analysisProgress?: AnalysisProgress;
            roadmapProgress?: any;
          };
          skillGapAnalysis?: SkillGapAnalysis;
        };
      }>('/user-state/initial-load');
      
      const initialData = response.initialData;
      
      if (initialData.hasData || initialData.masterSkills?.length > 0) {
        
        // Check if we have a target role and validate it's still in the available roles
        const targetRole = initialData.userState?.targetRole;
        const isValidRole = targetRole && initialData.jobRoles?.some(role => role.id === targetRole.id);
        
        if (targetRole && !isValidRole) {
          // console.warn('⚠️ Stored target role is no longer valid, clearing role-specific data');
        }
        
        // CRITICAL FIX: Validate roadmap matches current role
        let processedRoadmapItems: any[] = [];
        if (isValidRole && initialData.userState?.roadmapProgress) {
          const storedRoadmapProgress = initialData.userState.roadmapProgress;
          const storedRoadmapRoleId = storedRoadmapProgress.targetRole;
          
          // Only use stored roadmap if it matches the current target role
          if (storedRoadmapRoleId === targetRole.id) {
            const roadmapItems = storedRoadmapProgress.roadmapItems || [];
            processedRoadmapItems = roadmapItems.map((item: any) => ({
              ...item,
              completed: Boolean(item.completed) // Ensure completed is a proper boolean
            }));
          } else {
            // console.warn('⚠️ Stored roadmap is for different role, will generate fresh roadmap');
            // Don't load stale roadmap data - let the component generate fresh roadmap
            processedRoadmapItems = [];
          }
        }
        
        setState(prev => ({
          ...prev,
          userSkills: initialData.userSkills || [],
          masterSkills: initialData.masterSkills || [],
          jobRoles: initialData.jobRoles || [],
          selectedRole: isValidRole ? targetRole : null,
          analysis: isValidRole ? initialData.skillGapAnalysis || null : null,
          analysisProgress: isValidRole ? initialData.userState?.analysisProgress || null : null,
          roadmapProgress: isValidRole && processedRoadmapItems.length > 0 ? {
            ...initialData.userState?.roadmapProgress,
            roadmapItems: processedRoadmapItems
          } : null,
          roadmap: processedRoadmapItems,
          loading: false
        }));
        
        // CRITICAL FIX: Auto-generate fresh roadmap if role exists but no valid roadmap
        if (isValidRole && processedRoadmapItems.length === 0) {
          addTimeout(() => {
            try {
              const fixedRoadmapItems = getFixedRoadmap(targetRole.id);
              if (fixedRoadmapItems.length > 0) {
                const initializedRoadmapItems = fixedRoadmapItems.map(item => ({
                  ...item,
                  completed: false
                }));
                
                setState(prev => ({
                  ...prev,
                  roadmap: initializedRoadmapItems,
                  roadmapProgress: {
                    targetRole: targetRole.id,
                    totalItems: initializedRoadmapItems.length,
                    completedItems: 0,
                    progress: 0,
                    roadmapItems: initializedRoadmapItems
                  }
                }));
                
              }
            } catch (error) {
              console.error('❌ Failed to generate fresh roadmap:', error);
            }
          }, 100); // Small delay to ensure state is updated
        }
      } else {
        await Promise.all([
          loadMasterSkills(),
          loadJobRoles()
        ]);
        setState(prev => ({ ...prev, loading: false }));
      }
    } catch (error: any) {
      console.error('❌ Failed to load initial data:', error);
      setState(prev => ({
        ...prev,
        error: error.message || 'Failed to load application data',
        loading: false
      }));
    }
  }, [isAuthenticated]);

  // Load master skills
  const loadMasterSkills = useCallback(async () => {
    try {
      const skills = await apiClient.get<UserSkill[]>('/skills/master');
      setState(prev => ({ ...prev, masterSkills: skills }));
    } catch (error: any) {
      console.error('❌ Failed to load master skills:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to load master skills'
      }));
    }
  }, []);

  // Load job roles
  const loadJobRoles = useCallback(async () => {
    try {
      const roles = await apiClient.get<JobRole[]>('/roles');
      setState(prev => ({ ...prev, jobRoles: roles }));
    } catch (error: any) {
      console.error('❌ Failed to load job roles:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to load job roles'
      }));
    }
  }, []);

  // Update user profile
  const updateUserProfile = useCallback(async (updates: Partial<UserProfile>) => {
    try {
      await apiClient.put('/users/profile', updates);
    } catch (error: any) {
      console.error('❌ Failed to update user profile:', error);
      throw error;
    }
  }, []);

  // Complete onboarding
  const completeOnboarding = useCallback(async (onboardingData: {
    name: string;
    education: string;
    experience: string;
    interests: string[];
  }) => {
    try {
      await apiClient.post('/users/onboarding', onboardingData);
    } catch (error: any) {
      console.error('❌ Failed to complete onboarding:', error);
      throw error;
    }
  }, []);

  // Add skill
  const addSkill = useCallback(async (skillId: string, proficiency: ProficiencyLevel) => {
    try {
      await apiClient.post('/skills', { skillId, level: proficiency });
      // Reload user skills
      const skills = await apiClient.get<UserSkill[]>('/skills');
      setState(prev => ({ ...prev, userSkills: skills }));
    } catch (error: any) {
      console.error('❌ Failed to add skill:', error);
      throw error;
    }
  }, []);

  // Remove skill
  const removeSkill = useCallback(async (skillId: string) => {
    try {
      await apiClient.delete(`/skills/${skillId}`);
      // Reload user skills
      const skills = await apiClient.get<UserSkill[]>('/skills');
      setState(prev => ({ ...prev, userSkills: skills }));
    } catch (error: any) {
      console.error('❌ Failed to remove skill:', error);
      throw error;
    }
  }, []);

  // Update skill proficiency
  const updateSkillProficiency = useCallback(async (skillId: string, proficiency: ProficiencyLevel) => {
    try {
      await apiClient.put(`/skills/${skillId}`, { level: proficiency });
      // Reload user skills
      const skills = await apiClient.get<UserSkill[]>('/skills');
      setState(prev => ({ ...prev, userSkills: skills }));
    } catch (error: any) {
      console.error('❌ Failed to update skill proficiency:', error);
      throw error;
    }
  }, []);

  // Select role - ENHANCED to handle role changes properly
  const selectRole = useCallback(async (role: JobRole) => {
    try {
      
      // Check if this is actually a different role
      const isDifferentRole = !state.selectedRole || state.selectedRole.id !== role.id;
      
      if (isDifferentRole) {
        
        // Clear old role-specific data when changing roles
        setState(prev => ({
          ...prev,
          selectedRole: role,
          analysis: null,           // Clear old analysis
          analysisProgress: null,   // Clear old progress
          roadmap: [],             // Clear old roadmap
          roadmapProgress: null,   // Clear old roadmap progress
          loading: false,
          error: null
        }));
        
        // Persist role selection to backend
        try {
          const response = await apiClient.put('/user-state/target-role', { 
            targetRole: role
          });
        } catch (error) {
          console.error('❌ Failed to persist role selection to backend:', error);
          // Don't throw error here - local state is updated
        }
        
        // Auto-load roadmap for the new role
        addTimeout(async () => {
          try {
            const fixedRoadmapItems = getFixedRoadmap(role.id);
            if (fixedRoadmapItems.length > 0) {
              const initializedRoadmapItems = fixedRoadmapItems.map(item => ({
                ...item,
                completed: false
              }));
              
              setState(prev => ({
                ...prev,
                roadmap: initializedRoadmapItems,
                roadmapProgress: {
                  targetRole: role.id,
                  totalItems: initializedRoadmapItems.length,
                  completedItems: 0,
                  progress: 0,
                  roadmapItems: initializedRoadmapItems
                }
              }));
              
            }
          } catch (error) {
            console.error('❌ Failed to auto-load roadmap for new role:', error);
          }
        }, 100); // Small delay to ensure state is updated
      } else {
        // Same role selected - just update state
        setState(prev => ({ ...prev, selectedRole: role }));
      }
      
    } catch (error: any) {
      console.error('❌ Failed to select role:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to select role. Please try again.'
      }));
      throw error;
    }
  }, [state.selectedRole]);

  // Analyze skill gap
  const analyzeSkillGap = useCallback(async () => {
    if (!state.selectedRole) {
      throw new Error('Please select a role first');
    }
    
    try {
      setState(prev => ({ ...prev, loading: true }));
      const response = await apiClient.get<{
        roleId: string;
        analysis: SkillGapAnalysis;
        progress: AnalysisProgress;
        hasProgress: boolean;
      }>(`/skills/analyze/${state.selectedRole.id}`);
      setState(prev => ({
        ...prev,
        analysis: response.analysis,
        analysisProgress: response.progress,
        loading: false
      }));
    } catch (error: any) {
      console.error('❌ Failed to analyze skill gap:', error);
      setState(prev => ({ ...prev, loading: false }));
      throw error;
    }
  }, [state.selectedRole]);

  // Generate roadmap - SIMPLIFIED with better error handling
  const loadFixedRoadmap = useCallback(async () => {
    if (!state.selectedRole) {
      // console.warn('⚠️ No role selected for roadmap');
      setState(prev => ({
        ...prev,
        error: 'Please select a role first to generate your roadmap'
      }));
      return;
    }
    
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // Get fixed roadmap for the selected role
      const fixedRoadmapItems = getFixedRoadmap(state.selectedRole.id);
      
      if (fixedRoadmapItems.length === 0) {
        // console.warn('⚠️ No fixed roadmap found for role:', state.selectedRole.id);
        setState(prev => ({
          ...prev,
          roadmap: [],
          roadmapProgress: null,
          loading: false,
          error: `No roadmap template available for ${state.selectedRole.title}. Please try a different role.`
        }));
        return;
      }
      
      // Set the roadmap immediately with proper completion status
      setState(prev => ({
        ...prev,
        roadmap: fixedRoadmapItems.map(item => ({
          ...item,
          completed: false // Ensure all items start as incomplete
        })),
        roadmapProgress: {
          targetRole: state.selectedRole?.id || '',
          totalItems: fixedRoadmapItems.length,
          completedItems: 0,
          progress: 0,
          roadmapItems: fixedRoadmapItems.map(item => ({
            ...item,
            completed: false // Ensure all items start as incomplete
          }))
        },
        loading: false,
        error: null
      }));
      
      
      // Try to load existing progress from backend (non-blocking)
      try {
        const response = await apiClient.get<{
          roadmap: any;
          hasRoadmap: boolean;
        }>('/roadmap');
        
        if (response.hasRoadmap && response.roadmap) {
          // Update with backend progress if available
        }
      } catch (error) {
      }
      
    } catch (error: any) {
      console.error('❌ Failed to load fixed roadmap:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to load roadmap. Please try again.',
        loading: false
      }));
    }
  }, [state.selectedRole]); // Removed loadRoadmapProgress dependency to prevent circular reference

  // Mark roadmap item complete - CONSOLIDATED state updates to prevent race conditions
  const markRoadmapItemComplete = useCallback(async (itemId: string) => {
    // Find the roadmap item in current state to get skillId - MOVE OUTSIDE TRY
    const roadmapItem = state.roadmap.find(item => item.id === itemId);
    if (!roadmapItem) {
      console.error('❌ Roadmap item not found:', itemId);
      return;
    }

    const skillId = roadmapItem.skillId;
    const newCompletedState = !roadmapItem.completed;

    try {
      // Optimistically update local state using functional update to prevent race conditions
      setState(prev => {
        const updatedRoadmap = prev.roadmap.map(item =>
          item.id === itemId ? { ...item, completed: newCompletedState } : item
        );
        
        // Calculate new progress metrics
        const completedItems = updatedRoadmap.filter(item => item.completed).length;
        const totalItems = updatedRoadmap.length;
        const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
        
        return {
          ...prev,
          roadmap: updatedRoadmap,
          roadmapProgress: prev.roadmapProgress ? {
            ...prev.roadmapProgress,
            completedItems,
            progress,
            roadmapItems: updatedRoadmap
          } : null
        };
      });

      // If skill was completed, update user skills and recalculate analysis
      if (newCompletedState && state.selectedRole) {
        try {
          const skillProficiency = roadmapItem.difficulty === 'advanced' ? 'advanced' : 
                                 roadmapItem.difficulty === 'beginner' ? 'beginner' : 'intermediate';
          
          // Check if user already has this skill
          const existingSkill = state.userSkills.find(skill => skill.id === skillId);
          
          if (!existingSkill) {
            await apiClient.post('/skills', { skillId: skillId, level: skillProficiency });
            const updatedSkills = await apiClient.get<UserSkill[]>('/skills');
            setState(prev => ({ ...prev, userSkills: updatedSkills }));
          } else if (existingSkill.proficiency !== skillProficiency) {
            await apiClient.put(`/skills/${skillId}`, { level: skillProficiency });
            const updatedSkills = await apiClient.get<UserSkill[]>('/skills');
            setState(prev => ({ ...prev, userSkills: updatedSkills }));
          }

          // Recalculate skill gap analysis - only on successful skill update
          const analysisResponse = await apiClient.get<{
            roleId: string;
            analysis: SkillGapAnalysis;
            progress: AnalysisProgress;
            hasProgress: boolean;
          }>(`/skills/analyze/${state.selectedRole.id}`);
          
          setState(prev => ({
            ...prev,
            analysis: analysisResponse.analysis,
            analysisProgress: analysisResponse.progress
          }));
          
        } catch (analysisError) {
          console.error('⚠️ Failed to update analysis after skill completion:', analysisError);
        }
      }

      // Persist to backend
      try {
        await apiClient.put('/roadmap/progress', {
          skillId: skillId,
          completed: newCompletedState
        });
      } catch (backendError) {
        console.error('⚠️ Failed to persist to backend, but local state updated:', backendError);
      }

    } catch (error) {
      console.error('❌ Failed to update roadmap completion:', error);
      
      // Revert optimistic update on error
      setState(prev => {
        const itemToRevert = prev.roadmap.find(i => i.id === itemId);
        if (!itemToRevert) return prev;
        
        const revertedRoadmap = prev.roadmap.map(item =>
          item.id === itemId ? { ...item, completed: !newCompletedState } : item
        );
        
        const completedItems = revertedRoadmap.filter(item => item.completed).length;
        const progress = revertedRoadmap.length > 0 ? Math.round((completedItems / revertedRoadmap.length) * 100) : 0;
        
        return {
          ...prev,
          roadmap: revertedRoadmap,
          roadmapProgress: prev.roadmapProgress ? {
            ...prev.roadmapProgress,
            completedItems,
            progress,
            roadmapItems: revertedRoadmap
          } : null
        };
      });

      throw error;
    }
  }, [state.roadmap, state.selectedRole, state.userSkills, addTimeout]);

  // Reset progress
  const resetProgress = useCallback(() => {
    setState(prev => ({
      ...prev,
      analysis: null,
      analysisProgress: null,
      roadmap: [],
      roadmapProgress: null,
      selectedRole: null
    }));
  }, []);

  // Load roadmap progress - ENHANCED to fetch from database
  const loadRoadmapProgress = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      
      // First try to get existing roadmap from backend
      const response = await apiClient.get<{
        roadmap: any;
        hasRoadmap: boolean;
      }>('/roadmap');
      
      if (response.hasRoadmap && response.roadmap) {
        // Convert backend roadmap format to frontend format
        const backendRoadmap = response.roadmap;
        const roadmapItems: RoadmapItem[] = [];
        
        // Extract roadmap items from milestones
        if (backendRoadmap.milestones) {
          backendRoadmap.milestones.forEach((milestone: any, milestoneIndex: number) => {
            if (milestone.skills) {
              milestone.skills.forEach((skill: any) => {
                const roadmapItem: RoadmapItem = {
                  id: `roadmap-${skill.skillId}`,
                  skillId: skill.skillId,
                  skillName: skill.skillName || skill.skillId,
                  resources: skill.resources || [],
                  difficulty: skill.targetLevel || 'intermediate',
                  estimatedTime: `${skill.estimatedHours || 20} hours`,
                  completed: Boolean(skill.completed) === true // Ensure proper boolean conversion
                };
                roadmapItems.push(roadmapItem);
              });
            }
          });
        }
        
        // Update state with loaded roadmap
        setState(prev => ({
          ...prev,
          roadmap: roadmapItems,
          roadmapProgress: {
            targetRole: backendRoadmap.roleId,
            totalItems: roadmapItems.length,
            completedItems: roadmapItems.filter(item => item.completed).length,
            progress: backendRoadmap.progress?.skillProgress || 0,
            roadmapItems: roadmapItems
          },
          loading: false
        }));
        
      } else {
        // No existing roadmap found
        setState(prev => ({
          ...prev,
          roadmap: [],
          roadmapProgress: null,
          loading: false
        }));
      }
    } catch (error: any) {
      console.error('❌ Failed to load roadmap progress:', error);
      setState(prev => ({ ...prev, loading: false }));
      // Don't throw error here as this is often called on page load
    }
  }, []);

  // Refresh role-dependent data - NEW utility function
  const refreshRoleData = useCallback(async () => {
    if (!state.selectedRole) {
      return;
    }
    
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // Clear existing role data
      setState(prev => ({
        ...prev,
        analysis: null,
        analysisProgress: null,
        roadmap: [],
        roadmapProgress: null
      }));
      
      // Load fresh analysis if user has skills
      if (state.userSkills.length > 0) {
        try {
          const analysisResponse = await apiClient.get<{
            roleId: string;
            analysis: SkillGapAnalysis;
            progress: AnalysisProgress;
            hasProgress: boolean;
          }>(`/skills/analyze/${state.selectedRole.id}`);
          
          setState(prev => ({
            ...prev,
            analysis: analysisResponse.analysis,
            analysisProgress: analysisResponse.progress
          }));
          
        } catch (error) {
        }
      }
      
      // Load fresh roadmap with proper initialization
      const fixedRoadmapItems = getFixedRoadmap(state.selectedRole.id);
      if (fixedRoadmapItems.length > 0) {
        const initializedRoadmapItems = fixedRoadmapItems.map(item => ({
          ...item,
          completed: false // Ensure all items start as incomplete
        }));
        
        setState(prev => ({
          ...prev,
          roadmap: initializedRoadmapItems,
          roadmapProgress: {
            targetRole: state.selectedRole?.id || '',
            totalItems: initializedRoadmapItems.length,
            completedItems: 0,
            progress: 0,
            roadmapItems: initializedRoadmapItems
          }
        }));
      }
      
      setState(prev => ({ ...prev, loading: false }));
      
    } catch (error: any) {
      console.error('❌ Failed to refresh role data:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to refresh role data. Please try again.',
        loading: false
      }));
    }
  }, [state.selectedRole, state.userSkills]);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const contextValue: AppDataContextType = {
    // State
    ...state,
    
    // Methods
    updateUserProfile,
    completeOnboarding,
    addSkill,
    removeSkill,
    updateSkillProficiency,
    loadMasterSkills,
    selectRole,
    loadJobRoles,
    analyzeSkillGap,
    loadFixedRoadmap,
    markRoadmapItemComplete,
    resetProgress,
    loadRoadmapProgress,
    refreshRoleData,
    clearError
  };

  return (
    <AppDataContext.Provider value={contextValue}>
      {children}
    </AppDataContext.Provider>
  );
};

// Custom hook to use app data context
export const useAppData = (): AppDataContextType => {
  const context = useContext(AppDataContext);
  if (context === undefined) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
};

export default AppDataContext;