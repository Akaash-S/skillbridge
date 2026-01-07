import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
import { UserSkill, JobRole, RoadmapItem, ProficiencyLevel } from "@/data/mockData";
import { apiService } from "@/services/api";
import { FirebaseAuthService } from "@/services/firebase";
import { User } from "firebase/auth";

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

interface AppState {
  isAuthenticated: boolean;
  user: UserProfile | null;
  firebaseUser: User | null;
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

interface AppContextType extends AppState {
  login: () => Promise<void>;
  logout: () => Promise<void>;
  setUserProfile: (profile: UserProfile) => void;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  addSkill: (skillId: string, proficiency: ProficiencyLevel) => Promise<void>;
  removeSkill: (skillId: string) => Promise<void>;
  updateSkillProficiency: (skillId: string, proficiency: ProficiencyLevel) => Promise<void>;
  selectRole: (role: JobRole) => void;
  analyzeSkillGap: () => Promise<void>;
  generateRoadmap: () => Promise<void>;
  markRoadmapItemComplete: (itemId: string) => void;
  resetProgress: () => void;
  loadMasterSkills: () => Promise<void>;
  loadJobRoles: () => Promise<void>;
  loadRoadmapProgress: () => Promise<void>;
  clearError: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const defaultUser: UserProfile = {
  name: "",
  email: "user@example.com",
  avatar: "",
  education: "",
  experience: "",
  interests: [],
  notifications: true,
  weeklyGoal: 10,
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>({
    isAuthenticated: false,
    user: null,
    firebaseUser: null,
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

  const loadMasterSkills = useCallback(async () => {
    console.log('🎯 Loading master skills...');
    try {
      const masterSkills = await apiService.getMasterSkills();
      console.log('✅ Master skills loaded:', masterSkills.length);
      setState(prev => ({ ...prev, masterSkills }));
    } catch (error) {
      console.error('❌ Failed to load master skills:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to load skills database'
      }));
    }
  }, []);

  const loadJobRoles = useCallback(async () => {
    console.log('💼 Loading job roles...');
    try {
      const jobRoles = await apiService.getJobRoles();
      console.log('✅ Job roles loaded:', jobRoles.length);
      setState(prev => ({ ...prev, jobRoles }));
    } catch (error) {
      console.error('❌ Failed to load job roles:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to load job roles'
      }));
    }
  }, []);

  // Load user state from backend
  const loadUserState = useCallback(async () => {
    if (!state.isAuthenticated) {
      console.log('🔒 Not authenticated, skipping user state load');
      return;
    }
    
    console.log('📊 Loading user state from backend...');
    try {
      const { userState, hasData } = await apiService.getUserState();
      
      if (hasData && userState) {
        console.log('✅ User state loaded from backend');
        
        // Update state with persisted data
        setState(prev => ({
          ...prev,
          userSkills: userState.skills || [],
          selectedRole: userState.targetRole || null,
          analysis: userState.analysis || null,
          analysisProgress: userState.analysisProgress || null,
          roadmapProgress: userState.roadmapProgress || null,
          // Convert roadmap items if they exist
          roadmap: userState.roadmapProgress?.roadmapItems || [],
        }));
        
        console.log('📈 User state applied:', {
          skills: userState.skills?.length || 0,
          hasTargetRole: !!userState.targetRole,
          hasAnalysis: !!userState.analysis,
          hasRoadmap: !!userState.roadmapProgress
        });
      } else {
        console.log('📝 No existing user state found - new user');
      }
    } catch (error) {
      console.error('❌ Failed to load user state:', error);
      // Don't set error state for this - user can still use the app
    }
  }, [state.isAuthenticated]);

  // Initialize Firebase auth listener
  useEffect(() => {
    console.log('🔥 Setting up Firebase auth listener');
    const unsubscribe = FirebaseAuthService.onAuthStateChanged(async (firebaseUser) => {
      console.log('🔄 Auth state changed:', firebaseUser ? `User: ${firebaseUser.email}` : 'No user');
      
      if (firebaseUser) {
        try {
          setState(prev => ({ ...prev, loading: true, error: null }));
          console.log('🔑 Getting fresh token...');
          
          // Get fresh token using our Firebase service (this ensures it's stored properly)
          const idToken = await FirebaseAuthService.getCurrentUserToken();
          if (!idToken) {
            throw new Error('Failed to get authentication token');
          }
          
          console.log('🚀 Logging in with backend...');
          const loginResponse = await apiService.login(idToken);
          console.log('✅ Backend login successful');
          
          setState(prev => ({
            ...prev,
            isAuthenticated: true,
            firebaseUser,
            user: loginResponse.user,
            loading: false,
          }));

          // Load master data and user state after successful authentication
          console.log('📊 Loading application data after authentication...');
          await Promise.all([
            loadMasterSkills(),
            loadJobRoles()
          ]);
          
          // Load user state after master data is loaded
          await loadUserState();
          
        } catch (error) {
          console.error('❌ Auth error:', error);
          setState(prev => ({
            ...prev,
            error: error instanceof Error ? error.message : 'Authentication failed',
            loading: false,
          }));
        }
      } else {
        console.log('🔓 User logged out');
        setState(prev => ({
          ...prev,
          isAuthenticated: false,
          firebaseUser: null,
          user: null,
          userSkills: [],
          masterSkills: [],
          jobRoles: [],
          selectedRole: null,
          analysis: null,
          analysisProgress: null,
          roadmap: [],
          roadmapProgress: null,
          loading: false,
        }));
      }
    });

    return unsubscribe;
  }, []); // Remove dependencies to prevent infinite loops

  const login = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      await FirebaseAuthService.signInWithGoogle();
      // Auth state change will handle the rest
    } catch (error) {
      console.error('Login error:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Login failed',
        loading: false,
      }));
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await FirebaseAuthService.signOut();
      setState({
        isAuthenticated: false,
        user: null,
        firebaseUser: null,
        userSkills: [],
        masterSkills: state.masterSkills, // Keep master skills
        jobRoles: state.jobRoles, // Keep job roles
        selectedRole: null,
        analysis: null,
        analysisProgress: null,
        roadmap: [],
        roadmapProgress: null,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Logout error:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Logout failed'
      }));
    }
  }, [state.masterSkills, state.jobRoles]);

  const setUserProfile = useCallback((profile: UserProfile) => {
    setState((prev) => ({ ...prev, user: { ...defaultUser, ...profile } }));
  }, []);

  const updateUserProfile = useCallback(async (updates: Partial<UserProfile>) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const response = await apiService.updateUserProfile(updates);
      setState((prev) => ({
        ...prev,
        user: response.profile,
        loading: false,
      }));
    } catch (error) {
      console.error('Failed to update profile:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to update profile',
        loading: false,
      }));
    }
  }, []);

  const addSkill = useCallback(async (skillId: string, proficiency: ProficiencyLevel) => {
    if (!state.isAuthenticated) {
      setState(prev => ({
        ...prev,
        error: 'Please log in to add skills'
      }));
      return;
    }
    
    try {
      console.log('🔄 Adding skill:', { skillId, proficiency });
      await apiService.addSkill(skillId, proficiency, 'medium');
      
      // Reload user skills from backend
      const userSkills = await apiService.getUserSkills();
      setState(prev => ({ ...prev, userSkills }));
      
      // Update user state with new skills
      await apiService.updateUserSkillsState(userSkills);
      
      console.log('✅ Skill added and state updated');
    } catch (error) {
      console.error('Failed to add skill:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to add skill'
      }));
    }
  }, [state.isAuthenticated]);

  const removeSkill = useCallback(async (skillId: string) => {
    try {
      await apiService.removeSkill(skillId);
      
      // Reload user skills from backend
      const userSkills = await apiService.getUserSkills();
      setState(prev => ({ ...prev, userSkills }));
      
      // Update user state with remaining skills
      await apiService.updateUserSkillsState(userSkills);
    } catch (error) {
      console.error('Failed to remove skill:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to remove skill'
      }));
    }
  }, []);

  const updateSkillProficiency = useCallback(async (skillId: string, proficiency: ProficiencyLevel) => {
    try {
      await apiService.updateSkill(skillId, proficiency);
      
      // Reload user skills from backend
      const userSkills = await apiService.getUserSkills();
      setState(prev => ({ ...prev, userSkills }));
      
      // Update user state with updated skills
      await apiService.updateUserSkillsState(userSkills);
    } catch (error) {
      console.error('Failed to update skill:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to update skill'
      }));
    }
  }, []);

  const selectRole = useCallback(async (role: JobRole) => {
    try {
      // Save target role to backend and user state
      const response = await apiService.selectTargetRole(role.id);
      await apiService.updateTargetRoleState(role);
      
      setState((prev) => ({ 
        ...prev, 
        selectedRole: role, 
        analysis: null, 
        analysisProgress: null, 
        roadmap: [] 
      }));
      
      console.log('✅ Target role selected and saved:', role.title);
    } catch (error) {
      console.error('❌ Failed to save target role:', error);
      // Still update local state even if save fails
      setState((prev) => ({ 
        ...prev, 
        selectedRole: role, 
        analysis: null, 
        analysisProgress: null, 
        roadmap: [] 
      }));
    }
  }, []);

  const proficiencyValue = (level: ProficiencyLevel): number => {
    switch (level) {
      case "beginner": return 1;
      case "intermediate": return 2;
      case "advanced": return 3;
    }
  };

  const analyzeSkillGap = useCallback(async () => {
    const { userSkills, selectedRole } = state;
    if (!selectedRole || !state.isAuthenticated) return;

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // Use backend API for skill gap analysis with progress tracking
      const response = await apiService.analyzeSkillGaps(selectedRole.id);
      setState(prev => ({
        ...prev,
        analysis: response.analysis,
        analysisProgress: response.progress,
        loading: false,
      }));
      
      // Save analysis to user state
      await apiService.updateAnalysisState(response.analysis);
      console.log('✅ Analysis completed and saved to state');
      
    } catch (error) {
      console.error('Failed to analyze skill gap:', error);
      
      // Fallback to local analysis if API fails
      const matchedSkills: SkillGapAnalysis["matchedSkills"] = [];
      const missingSkills: SkillGapAnalysis["missingSkills"] = [];
      const partialSkills: SkillGapAnalysis["partialSkills"] = [];

      selectedRole.requiredSkills.forEach((req) => {
        const userSkill = userSkills.find((s) => s.id === req.skillId);
        const skillInfo = state.masterSkills.find((s) => s.id === req.skillId);

        if (!userSkill) {
          missingSkills.push({
            skillId: req.skillId,
            skillName: skillInfo?.name || req.skillId,
            required: req.minProficiency,
          });
        } else if (proficiencyValue(userSkill.proficiency) >= proficiencyValue(req.minProficiency)) {
          matchedSkills.push({ skill: userSkill, required: req.minProficiency });
        } else {
          partialSkills.push({ skill: userSkill, required: req.minProficiency });
        }
      });

      const totalRequired = selectedRole.requiredSkills.length;
      const fullyMatched = matchedSkills.length;
      const partiallyMatched = partialSkills.length * 0.5;
      const readinessScore = Math.round(((fullyMatched + partiallyMatched) / totalRequired) * 100);

      const fallbackAnalysis = { readinessScore, matchedSkills, missingSkills, partialSkills };
      
      setState((prev) => ({
        ...prev,
        analysis: fallbackAnalysis,
        analysisProgress: {
          initialScore: readinessScore,
          currentScore: readinessScore,
          scoreImprovement: 0,
          initialMatchedSkills: matchedSkills.length,
          currentMatchedSkills: matchedSkills.length,
          skillsImprovement: 0,
          completedRoadmapItems: 0,
          progressHistory: [],
          lastUpdated: undefined,
          createdAt: undefined
        },
        loading: false,
      }));
    }
  }, [state.selectedRole, state.userSkills, state.masterSkills, state.isAuthenticated]);

  const generateRoadmap = useCallback(async () => {
    const { selectedRole } = state;
    
    // Check prerequisites before setting loading state
    if (!selectedRole || !state.isAuthenticated) {
      return;
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // Determine experience level based on user's skills
      const experienceLevel = state.userSkills.length >= 10 ? 'advanced' : 
                             state.userSkills.length >= 5 ? 'intermediate' : 'beginner';
      
      // Use fast template-based roadmap generation
      const roadmapItems = await apiService.generateRoadmap(selectedRole.id, experienceLevel);
      
      setState(prev => ({
        ...prev,
        roadmap: roadmapItems,
        loading: false,
      }));
      
      // Save roadmap progress to user state
      const roadmapProgressData = {
        targetRole: selectedRole.id,
        experienceLevel,
        totalItems: roadmapItems.length,
        completedItems: 0,
        progress: 0,
        roadmapItems: roadmapItems,
        generatedAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };
      
      await apiService.updateRoadmapProgressState(roadmapProgressData);
      console.log('✅ Roadmap generated and saved to user state');
      
    } catch (error) {
      console.error('Failed to generate roadmap:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to generate roadmap',
        loading: false,
      }));
    }
  }, [state.selectedRole, state.isAuthenticated, state.userSkills.length]);

  const markRoadmapItemComplete = useCallback(async (itemId: string) => {
    // Update local state immediately for responsive UI
    setState((prev) => ({
      ...prev,
      roadmap: prev.roadmap.map((item) =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      ),
    }));

    // Update backend if authenticated
    if (state.isAuthenticated) {
      try {
        // Find the roadmap item to get skill details
        const roadmapItem = state.roadmap.find(item => item.id === itemId);
        if (roadmapItem) {
          const isCompleted = !roadmapItem.completed; // Toggle state
          
          // Call backend to update progress (this will trigger analysis update)
          await apiService.updateRoadmapProgress(0, roadmapItem.skillId, isCompleted);
          
          // Update roadmap progress in user state
          const updatedRoadmap = state.roadmap.map((item) =>
            item.id === itemId ? { ...item, completed: isCompleted } : item
          );
          
          const totalItems = updatedRoadmap.length;
          const completedItems = updatedRoadmap.filter(item => item.completed).length;
          const progress = (completedItems / totalItems * 100);
          
          const roadmapProgressData = {
            targetRole: state.selectedRole?.id || '',
            totalItems,
            completedItems,
            progress: Math.round(progress),
            roadmapItems: updatedRoadmap,
            lastUpdated: new Date().toISOString()
          };
          
          await apiService.updateRoadmapProgressState(roadmapProgressData);
          
          // Optionally refresh analysis to get updated progress
          if (state.selectedRole && isCompleted) {
            // Small delay to ensure backend processing is complete
            setTimeout(() => {
              analyzeSkillGap();
            }, 1000);
          }
        }
      } catch (error) {
        console.error('Failed to update roadmap progress:', error);
        // Revert local state on error
        setState((prev) => ({
          ...prev,
          roadmap: prev.roadmap.map((item) =>
            item.id === itemId ? { ...item, completed: !item.completed } : item
          ),
        }));
      }
    }
  }, [state.isAuthenticated, state.roadmap, state.selectedRole, analyzeSkillGap]);

  const resetProgress = useCallback(() => {
    setState((prev) => ({
      ...prev,
      analysis: null,
      analysisProgress: null,
      roadmap: [],
      selectedRole: null,
    }));
  }, []);

  const loadRoadmapProgress = useCallback(async () => {
    if (!state.isAuthenticated) return;
    
    try {
      const progressData = await apiService.getRoadmapProgressStats();
      setState(prev => ({ 
        ...prev, 
        roadmapProgress: progressData
      }));
    } catch (error) {
      console.error('Failed to load roadmap progress:', error);
      
      // If it's an auth error, clear the authentication state
      if (error instanceof Error && error.message.includes('Authentication failed')) {
        setState(prev => ({
          ...prev,
          isAuthenticated: false,
          user: null,
          firebaseUser: null,
          error: 'Session expired - please log in again'
        }));
      } else {
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Failed to load roadmap progress'
        }));
      }
    }
  }, []); // Remove state.isAuthenticated dependency to prevent recreation

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return (
    <AppContext.Provider
      value={{
        ...state,
        login,
        logout,
        setUserProfile,
        updateUserProfile,
        addSkill,
        removeSkill,
        updateSkillProficiency,
        selectRole,
        analyzeSkillGap,
        generateRoadmap,
        markRoadmapItemComplete,
        resetProgress,
        loadMasterSkills,
        loadJobRoles,
        loadRoadmapProgress,
        clearError,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
