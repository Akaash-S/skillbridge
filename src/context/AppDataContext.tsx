import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
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

  // Load initial data when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('📊 Loading initial app data for authenticated user');
      loadInitialData();
    }
  }, [isAuthenticated, user]);

  const loadInitialData = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      console.log('📊 Loading optimized initial data...');
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
      
      console.log('🔍 Initial data received:', {
        hasData: initialData.hasData,
        userSkillsCount: initialData.userSkills?.length || 0,
        masterSkillsCount: initialData.masterSkills?.length || 0,
        jobRolesCount: initialData.jobRoles?.length || 0,
        hasTargetRole: !!initialData.userState?.targetRole,
        hasAnalysis: !!initialData.skillGapAnalysis
      });
      
      if (initialData.hasData || initialData.masterSkills?.length > 0) {
        console.log('✅ Initial data loaded from backend');
        
        // Check if we have a target role and validate it's still in the available roles
        const targetRole = initialData.userState?.targetRole;
        const isValidRole = targetRole && initialData.jobRoles?.some(role => role.id === targetRole.id);
        
        if (targetRole && !isValidRole) {
          console.warn('⚠️ Stored target role is no longer valid, clearing role-specific data');
        }
        
        // Process roadmap data to ensure proper completion status
        const roadmapItems = isValidRole ? initialData.userState?.roadmapProgress?.roadmapItems || [] : [];
        const processedRoadmapItems = roadmapItems.map((item: any) => ({
          ...item,
          completed: Boolean(item.completed) // Ensure completed is a proper boolean
        }));
        
        setState(prev => ({
          ...prev,
          userSkills: initialData.userSkills || [],
          masterSkills: initialData.masterSkills || [],
          jobRoles: initialData.jobRoles || [],
          selectedRole: isValidRole ? targetRole : null,
          analysis: isValidRole ? initialData.skillGapAnalysis || null : null,
          analysisProgress: isValidRole ? initialData.userState?.analysisProgress || null : null,
          roadmapProgress: isValidRole ? initialData.userState?.roadmapProgress || null : null,
          roadmap: processedRoadmapItems,
          loading: false
        }));
        
        console.log('📈 Optimized data applied successfully', {
          hasValidRole: isValidRole,
          roleName: targetRole?.title || 'None',
          roadmapItemsCount: processedRoadmapItems.length,
          completedItemsCount: processedRoadmapItems.filter((item: any) => item.completed === true).length
        });
      } else {
        console.log('📝 No existing user state found - loading master data');
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
      console.log('✅ Master skills loaded:', skills.length);
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
      console.log('✅ Job roles loaded:', roles.length);
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
      console.log('✅ User profile updated');
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
      console.log('✅ Onboarding completed');
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
      console.log('✅ Skill added');
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
      console.log('✅ Skill removed');
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
      console.log('✅ Skill proficiency updated');
    } catch (error: any) {
      console.error('❌ Failed to update skill proficiency:', error);
      throw error;
    }
  }, []);

  // Select role - ENHANCED to handle role changes properly
  const selectRole = useCallback(async (role: JobRole) => {
    try {
      console.log('🎯 Selecting new role:', role.title);
      
      // Check if this is actually a different role
      const isDifferentRole = !state.selectedRole || state.selectedRole.id !== role.id;
      
      if (isDifferentRole) {
        console.log('🔄 Role changed - clearing old data and updating');
        
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
          console.log('🔄 Attempting to persist role to backend:', role);
          const response = await apiClient.put('/user-state/target-role', { 
            targetRole: role
          });
          console.log('✅ Role selection persisted to backend:', response);
        } catch (error) {
          console.error('❌ Failed to persist role selection to backend:', error);
          // Don't throw error here - local state is updated
        }
        
        console.log('✅ Role changed successfully:', {
          from: state.selectedRole?.title || 'None',
          to: role.title,
          clearedData: ['analysis', 'analysisProgress', 'roadmap', 'roadmapProgress']
        });
        
        // Auto-load roadmap for the new role
        setTimeout(async () => {
          try {
            console.log('🔄 Auto-loading roadmap for new role:', role.title);
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
              
              console.log('✅ Auto-loaded roadmap for new role:', role.title, 'with', initializedRoadmapItems.length, 'items');
            }
          } catch (error) {
            console.error('❌ Failed to auto-load roadmap for new role:', error);
          }
        }, 100); // Small delay to ensure state is updated
      } else {
        // Same role selected - just update state
        setState(prev => ({ ...prev, selectedRole: role }));
        console.log('ℹ️ Same role selected:', role.title);
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
      console.log('✅ Skill gap analysis completed');
    } catch (error: any) {
      console.error('❌ Failed to analyze skill gap:', error);
      setState(prev => ({ ...prev, loading: false }));
      throw error;
    }
  }, [state.selectedRole]);

  // Generate roadmap - SIMPLIFIED with better error handling
  const loadFixedRoadmap = useCallback(async () => {
    if (!state.selectedRole) {
      console.warn('⚠️ No role selected for roadmap');
      setState(prev => ({
        ...prev,
        error: 'Please select a role first to generate your roadmap'
      }));
      return;
    }
    
    try {
      console.log('📋 Loading fixed roadmap for role:', state.selectedRole.id);
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // Get fixed roadmap for the selected role
      const fixedRoadmapItems = getFixedRoadmap(state.selectedRole.id);
      
      if (fixedRoadmapItems.length === 0) {
        console.warn('⚠️ No fixed roadmap found for role:', state.selectedRole.id);
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
      
      console.log('✅ Fixed roadmap loaded successfully:', fixedRoadmapItems.length, 'items');
      
      // Try to load existing progress from backend (non-blocking)
      try {
        const response = await apiClient.get<{
          roadmap: any;
          hasRoadmap: boolean;
        }>('/roadmap');
        
        if (response.hasRoadmap && response.roadmap) {
          console.log('✅ Existing roadmap progress loaded');
          // Update with backend progress if available
        }
      } catch (error) {
        console.log('ℹ️ No existing roadmap progress found, using fresh roadmap');
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

  // Mark roadmap item complete - ENHANCED with analysis updates
  const markRoadmapItemComplete = useCallback(async (itemId: string) => {
    try {
      // Find the roadmap item to get skillId
      const roadmapItem = state.roadmap.find(item => item.id === itemId);
      if (!roadmapItem) {
        console.error('❌ Roadmap item not found:', itemId);
        throw new Error('Roadmap item not found');
      }

      const skillId = roadmapItem.skillId;
      const newCompletedState = !roadmapItem.completed;

      console.log('🔄 Updating roadmap item completion:', {
        itemId,
        skillId,
        completed: newCompletedState
      });

      // Optimistically update local state first for immediate UI feedback
      const updatedRoadmap = state.roadmap.map(item =>
        item.id === itemId ? { ...item, completed: newCompletedState } : item
      );
      
      setState(prev => ({
        ...prev,
        roadmap: updatedRoadmap
      }));

      // Calculate new progress
      const completedItems = updatedRoadmap.filter(item => item.completed).length;
      const totalItems = updatedRoadmap.length;
      const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

      // Update roadmap progress
      setState(prev => ({
        ...prev,
        roadmapProgress: prev.roadmapProgress ? {
          ...prev.roadmapProgress,
          completedItems,
          progress,
          roadmapItems: updatedRoadmap
        } : null
      }));

      // If skill was completed, update user skills and recalculate analysis
      if (newCompletedState && state.selectedRole) {
        console.log('🎯 Skill completed, updating analysis...');
        
        try {
          // Add the skill to user's skill list with intermediate proficiency
          const skillProficiency = roadmapItem.difficulty === 'advanced' ? 'advanced' : 
                                 roadmapItem.difficulty === 'beginner' ? 'beginner' : 'intermediate';
          
          // Check if user already has this skill
          const existingSkill = state.userSkills.find(skill => skill.id === skillId);
          
          if (!existingSkill) {
            // Add new skill
            await apiClient.post('/skills', { 
              skillId: skillId, 
              level: skillProficiency 
            });
            
            // Reload user skills
            const updatedSkills = await apiClient.get<UserSkill[]>('/skills');
            setState(prev => ({ ...prev, userSkills: updatedSkills }));
            
            console.log('✅ Added new skill:', skillId, 'at level:', skillProficiency);
          } else if (existingSkill.proficiency !== skillProficiency) {
            // Update existing skill proficiency if needed
            await apiClient.put(`/skills/${skillId}`, { level: skillProficiency });
            
            // Reload user skills
            const updatedSkills = await apiClient.get<UserSkill[]>('/skills');
            setState(prev => ({ ...prev, userSkills: updatedSkills }));
            
            console.log('✅ Updated skill proficiency:', skillId, 'to level:', skillProficiency);
          }

          // Recalculate skill gap analysis with updated skills
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
          
          console.log('✅ Analysis updated after skill completion:', {
            newReadinessScore: analysisResponse.analysis.readinessScore,
            matchedSkills: analysisResponse.analysis.matchedSkills.length,
            missingSkills: analysisResponse.analysis.missingSkills.length
          });
          
        } catch (analysisError) {
          console.warn('⚠️ Failed to update analysis after skill completion:', analysisError);
          // Don't throw error here as the main roadmap update was successful
        }
      }

      // Try to persist to backend (non-blocking for better UX)
      try {
        await apiClient.put('/roadmap/progress', {
          skillId: skillId,
          completed: newCompletedState
        });

        console.log('✅ Roadmap item completion persisted to database:', {
          itemId,
          skillId,
          completed: newCompletedState,
          progress: `${completedItems}/${totalItems} (${progress}%)`
        });
      } catch (backendError) {
        console.warn('⚠️ Failed to persist to backend, but local state updated:', backendError);
        // Don't throw error here - local state is already updated
        // User can continue working offline
      }

    } catch (error) {
      console.error('❌ Failed to update roadmap completion:', error);
      
      // Revert optimistic update on error
      const roadmapItem = state.roadmap.find(item => item.id === itemId);
      if (roadmapItem) {
        setState(prev => ({
          ...prev,
          roadmap: prev.roadmap.map(item =>
            item.id === itemId ? { ...item, completed: roadmapItem.completed } : item
          )
        }));
      }

      // Re-throw error so UI can handle it
      throw error;
    }
  }, [state.roadmap, state.selectedRole, state.userSkills]);

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
    console.log('✅ Progress reset');
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
        
        console.log('✅ Roadmap progress loaded from database:', {
          totalItems: roadmapItems.length,
          completedItems: roadmapItems.filter(item => item.completed).length,
          roadmapItemsDebug: roadmapItems.map(item => ({
            id: item.id,
            skillName: item.skillName,
            completed: item.completed,
            completedType: typeof item.completed
          }))
        });
      } else {
        // No existing roadmap found
        setState(prev => ({
          ...prev,
          roadmap: [],
          roadmapProgress: null,
          loading: false
        }));
        console.log('ℹ️ No existing roadmap found');
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
      console.log('ℹ️ No role selected, skipping role data refresh');
      return;
    }
    
    try {
      console.log('🔄 Refreshing role-dependent data for:', state.selectedRole.title);
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
          
          console.log('✅ Fresh analysis loaded for new role');
        } catch (error) {
          console.log('ℹ️ No existing analysis for new role, user can create one');
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
        console.log('✅ Fresh roadmap loaded for new role');
      }
      
      setState(prev => ({ ...prev, loading: false }));
      console.log('✅ Role data refresh completed');
      
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