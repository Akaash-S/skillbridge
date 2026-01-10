import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
import { UserSkill, JobRole, RoadmapItem, ProficiencyLevel } from "@/data/mockData";
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
  selectRole: (role: JobRole) => void;
  loadJobRoles: () => Promise<void>;
  
  // Analysis methods
  analyzeSkillGap: () => Promise<void>;
  generateRoadmap: () => Promise<void>;
  markRoadmapItemComplete: (itemId: string) => void;
  resetProgress: () => void;
  loadRoadmapProgress: () => Promise<void>;
  
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
        
        setState(prev => ({
          ...prev,
          userSkills: initialData.userSkills || [],
          masterSkills: initialData.masterSkills || [],
          jobRoles: initialData.jobRoles || [],
          selectedRole: initialData.userState?.targetRole || null,
          analysis: initialData.skillGapAnalysis || null,
          analysisProgress: initialData.userState?.analysisProgress || null,
          roadmapProgress: initialData.userState?.roadmapProgress || null,
          roadmap: initialData.userState?.roadmapProgress?.roadmapItems || [],
          loading: false
        }));
        
        console.log('📈 Optimized data applied successfully');
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

  // Select role
  const selectRole = useCallback((role: JobRole) => {
    setState(prev => ({ ...prev, selectedRole: role }));
    console.log('✅ Role selected:', role.title);
  }, []);

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

  // Generate roadmap
  const generateRoadmap = useCallback(async () => {
    if (!state.selectedRole) {
      throw new Error('Please select a role first');
    }
    
    try {
      setState(prev => ({ ...prev, loading: true }));
      const roadmapItems = await apiClient.post<RoadmapItem[]>('/roadmap/generate', {
        targetRole: state.selectedRole.id
      });
      setState(prev => ({
        ...prev,
        roadmap: roadmapItems || [],
        roadmapProgress: {
          targetRole: state.selectedRole.id,
          totalItems: roadmapItems?.length || 0,
          completedItems: 0,
          progress: 0,
          roadmapItems: roadmapItems || []
        },
        loading: false
      }));
      console.log('✅ Roadmap generated');
    } catch (error: any) {
      console.error('❌ Failed to generate roadmap:', error);
      setState(prev => ({ ...prev, loading: false }));
      throw error;
    }
  }, [state.selectedRole]);

  // Mark roadmap item complete
  const markRoadmapItemComplete = useCallback((itemId: string) => {
    setState(prev => ({
      ...prev,
      roadmap: prev.roadmap.map(item =>
        item.id === itemId ? { ...item, completed: true } : item
      )
    }));
    console.log('✅ Roadmap item marked complete:', itemId);
  }, []);

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

  // Load roadmap progress
  const loadRoadmapProgress = useCallback(async () => {
    try {
      const response = await apiClient.get<{
        roadmap: any & { 
          milestones?: any[];
          progress?: {
            skillProgress: number;
            milestoneProgress: number;
            totalSkills: number;
            completedSkills: number;
          };
        };
      }>('/roadmap');
      
      // Convert roadmap milestones to roadmap items format if needed
      const roadmapItems: RoadmapItem[] = [];
      if (response.roadmap?.milestones) {
        for (const milestone of response.roadmap.milestones) {
          for (const skill of milestone.skills || []) {
            roadmapItems.push({
              id: `roadmap-${skill.skillId}`,
              skillId: skill.skillId,
              skillName: skill.skillName || skill.skillId,
              resources: skill.resources || [],
              difficulty: skill.targetLevel || 'intermediate',
              estimatedTime: `${skill.estimatedHours || 20} hours`,
              completed: skill.completed || false
            });
          }
        }
      }
      
      setState(prev => ({
        ...prev,
        roadmapProgress: response.roadmap,
        roadmap: roadmapItems
      }));
      console.log('✅ Roadmap progress loaded');
    } catch (error: any) {
      console.error('❌ Failed to load roadmap progress:', error);
      throw error;
    }
  }, []);

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
    generateRoadmap,
    markRoadmapItemComplete,
    resetProgress,
    loadRoadmapProgress,
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