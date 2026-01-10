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
  mfaRequired: boolean;
  mfaToken: string | null;
  requireMFAOnNextLogin: boolean; // New flag for manual logout
}

interface AppContextType extends AppState {
  login: () => Promise<void>;
  logout: (requireMFA?: boolean) => Promise<void>; // Add optional MFA requirement
  completeMFALogin: (mfaToken: string, code: string, isRecoveryCode?: boolean) => Promise<void>;
  setUserProfile: (profile: UserProfile) => void;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  completeOnboarding: (onboardingData: {
    name: string;
    education: string;
    experience: string;
    interests: string[];
  }) => Promise<void>;
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
    mfaRequired: false,
    mfaToken: null,
    requireMFAOnNextLogin: false,
  });

  // Debug: Track user state changes
  useEffect(() => {
    console.log('👤 User state changed:', {
      hasUser: !!state.user,
      userName: state.user?.name,
      userEmail: state.user?.email,
      isAuthenticated: state.isAuthenticated
    });
  }, [state.user, state.isAuthenticated]);

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

  // Load user state from backend with optimized initial load
  const loadUserState = useCallback(async (isAuth: boolean) => {
    if (!isAuth) {
      console.log('🔒 Not authenticated, skipping user state load');
      return;
    }
    
    console.log('📊 Loading optimized initial data...');
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      const initialData = await apiService.getInitialLoadData();
      
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
        
        // Update state with all data at once - preserve user and auth state
        setState(prev => {
          console.log('🔍 State before loadUserState update:', {
            hasUser: !!prev.user,
            userName: prev.user?.name,
            isAuthenticated: prev.isAuthenticated
          });
          
          const newState = {
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
            // Explicitly preserve authentication state
          };
          
          console.log('🔍 State after loadUserState update:', {
            hasUser: !!newState.user,
            userName: newState.user?.name,
            isAuthenticated: newState.isAuthenticated
          });
          
          return newState;
        });
        
        console.log('📈 Optimized data applied successfully');
      } else {
        console.log('📝 No existing user state found - loading master data');
        // For new users, still load master skills and job roles
        await Promise.all([
          loadMasterSkills(),
          loadJobRoles()
        ]);
        setState(prev => ({ ...prev, loading: false }));
      }
    } catch (error) {
      console.error('❌ Failed to load initial data:', error);
      // Fallback to individual loading
      console.log('🔄 Falling back to individual data loading...');
      try {
        await Promise.all([
          loadMasterSkills(),
          loadJobRoles()
        ]);
      } catch (fallbackError) {
        console.error('❌ Fallback loading also failed:', fallbackError);
        setState(prev => ({
          ...prev,
          error: 'Failed to load application data. Please refresh the page.',
          loading: false
        }));
      }
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [loadMasterSkills, loadJobRoles]);

  // Initialize Firebase auth listener
  useEffect(() => {
    console.log('🔥 Setting up Firebase auth listener');
    let isInitializing = true;
    
    // Handle redirect result first (in case user was redirected back)
    FirebaseAuthService.handleRedirectResult().then((redirectUser) => {
      if (redirectUser) {
        console.log('✅ Redirect authentication successful');
        // The auth state change listener will handle the rest
      }
    }).catch((error) => {
      console.error('❌ Redirect result error:', error);
    });
    
    const unsubscribe = FirebaseAuthService.onAuthStateChanged(async (firebaseUser) => {
      console.log('🔄 Auth state changed:', firebaseUser ? `User: ${firebaseUser.email}` : 'No user');
      console.log('🔍 Firebase user details:', {
        hasUser: !!firebaseUser,
        email: firebaseUser?.email,
        uid: firebaseUser?.uid,
        emailVerified: firebaseUser?.emailVerified,
        isInitializing
      });
      
      // Skip the first call if it's null during initialization
      if (!firebaseUser && isInitializing) {
        console.log('🔄 Skipping initial null user during initialization');
        isInitializing = false;
        return;
      }
      
      isInitializing = false;
      
      if (firebaseUser) {
        try {
          setState(prev => ({ ...prev, loading: true, error: null }));
          console.log('🔑 Getting fresh token...');
          
          // Get fresh token using our Firebase service
          const idToken = await FirebaseAuthService.getCurrentUserToken();
          if (!idToken) {
            throw new Error('Failed to get authentication token');
          }
          
          // Check if this is session restoration or explicit login
          const isSessionRestoration = FirebaseAuthService.isSessionRestoration();
          console.log('🔍 Session type:', isSessionRestoration ? 'Session Restoration' : 'Explicit Login');
          
          // Handle session restoration - clear manual logout flag if needed
          if (isSessionRestoration) {
            FirebaseAuthService.handleSessionRestoration();
          }
          
          console.log('🚀 Logging in with backend...');
          const loginResponse = await apiService.login(idToken);
          console.log('📋 Backend login response:', {
            hasUser: !!loginResponse.user,
            userName: loginResponse.user?.name,
            userEmail: loginResponse.user?.email,
            isNewUser: loginResponse.isNewUser,
            mfaRequired: loginResponse.mfa_required,
            fullResponse: loginResponse
          });
          
          // Determine if MFA verification is needed
          const shouldRequireMFA = loginResponse.mfa_required && FirebaseAuthService.shouldRequireMFA();
          
          console.log('🔐 MFA decision:', {
            backendMfaRequired: loginResponse.mfa_required,
            shouldRequireMFA: shouldRequireMFA,
            isSessionRestoration: isSessionRestoration,
            mfaToken: loginResponse.mfa_token ? 'present' : 'none'
          });
          
          if (shouldRequireMFA) {
            console.log('🔐 MFA verification required (explicit login after manual logout)');
            setState(prev => ({
              ...prev,
              mfaRequired: true,
              mfaToken: loginResponse.mfa_token,
              isAuthenticated: false,
              user: null,
              loading: false,
            }));
            // Don't load user state yet - wait for MFA verification
            return;
          }
          
          console.log('✅ Backend login successful', isSessionRestoration ? '(session restored)' : '(no MFA required)');
          
          // Update state with authentication
          setState(prev => ({
            ...prev,
            isAuthenticated: true,
            firebaseUser,
            user: loginResponse.user,
            mfaRequired: false,
            mfaToken: null,
            requireMFAOnNextLogin: false,
            loading: false,
          }));

          console.log('🔄 State updated with user:', {
            userFromResponse: loginResponse.user,
            userEmail: loginResponse.user?.email,
            userName: loginResponse.user?.name
          });

          // Load user state after successful authentication
          console.log('📊 Loading application data after authentication...');
          
          try {
            await loadUserState(true);
            
            // Log final auth state for debugging
            console.log('🎯 Final auth state after login:', {
              isAuthenticated: true,
              hasUser: !!loginResponse.user,
              userName: loginResponse.user?.name,
              userEmail: loginResponse.user?.email,
              sessionType: isSessionRestoration ? 'restored' : 'new'
            });
          } catch (error) {
            console.error('❌ Error loading user state:', error);
          }
          
        } catch (error) {
          console.error('❌ Auth error:', error);
          setState(prev => ({
            ...prev,
            error: error instanceof Error ? error.message : 'Authentication failed',
            loading: false,
          }));
        }
      } else {
        console.log('🔓 User logged out - Firebase user is null');
        console.log('🔍 Current state before logout:', {
          wasAuthenticated: state.isAuthenticated,
          hadUser: !!state.user,
          currentUserEmail: state.user?.email
        });
        
        // Only clear state if we were actually authenticated before
        if (state.isAuthenticated || state.user) {
          console.log('🧹 Clearing authentication state');
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
            mfaRequired: false,
            mfaToken: null,
          }));
        } else {
          console.log('🔄 Ignoring logout - user was not authenticated');
        }
      }
    });

    return unsubscribe;
  }, [loadUserState]);

  const login = useCallback(async () => {
    try {
      console.log('🔑 Starting login process...');
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const user = await FirebaseAuthService.signInWithGoogle();
      console.log('✅ Firebase sign-in successful:', user.email);
      
      // Auth state change will handle the backend login and MFA check
      // Don't set loading to false here - let the auth state handler do it
    } catch (error: any) {
      console.error('❌ Login error:', error);
      
      // Don't show error for redirect in progress
      if (error.message === 'REDIRECT_IN_PROGRESS') {
        console.log('🔄 Redirect authentication in progress...');
        // Don't set loading to false for redirect
        return;
      }
      
      // Set loading to false for actual errors
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Login failed',
        loading: false,
      }));
      throw error;
    }
  }, []);

  const completeMFALogin = useCallback(async (mfaToken: string, code: string, isRecoveryCode: boolean = false) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const loginResponse = await apiService.completeMFALogin(mfaToken, code, isRecoveryCode);
      
      // Mark MFA as verified for this session
      FirebaseAuthService.markMFAVerified();
      
      setState(prev => ({
        ...prev,
        isAuthenticated: true,
        user: loginResponse.user,
        mfaRequired: false,
        mfaToken: null,
        requireMFAOnNextLogin: false,
        loading: false,
      }));

      // Load user state after successful MFA login
      await loadUserState(true);
      
    } catch (error) {
      console.error('MFA login error:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'MFA verification failed',
        loading: false,
      }));
      throw error;
    }
  }, [loadUserState]);

  const logout = useCallback(async (requireMFA: boolean = false) => {
    try {
      console.log('🔓 Logging out...', requireMFA ? '(manual - MFA required next time)' : '(automatic - no MFA required)');
      
      await FirebaseAuthService.signOut(requireMFA);
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
        mfaRequired: false,
        mfaToken: null,
        requireMFAOnNextLogin: false,
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

  const completeOnboarding = useCallback(async (onboardingData: {
    name: string;
    education: string;
    experience: string;
    interests: string[];
  }) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const response = await apiService.completeOnboarding(onboardingData);
      setState((prev) => ({
        ...prev,
        user: response.profile,
        loading: false,
      }));
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to complete onboarding',
        loading: false,
      }));
      throw error; // Re-throw so the component can handle it
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
      
      // Clear user data cache since skills changed
      apiService.clearUserDataCache();
      
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
      
      // Clear user data cache since skills changed
      apiService.clearUserDataCache();
      
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
      
      // Clear user data cache since skills changed
      apiService.clearUserDataCache();
      
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
    const { selectedRole, analysis } = state;
    
    // Check prerequisites before setting loading state
    if (!selectedRole || !state.isAuthenticated) {
      return;
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // Generate roadmap based on skill gap analysis
      const roadmapItems: RoadmapItem[] = [];
      let itemId = 1;
      
      // Add items for missing skills
      if (analysis?.missingSkills) {
        analysis.missingSkills.forEach((missingSkill: any) => {
          roadmapItems.push({
            id: `missing-${itemId++}`,
            skillId: missingSkill.skillId,
            skillName: missingSkill.skillName,
            difficulty: missingSkill.required,
            estimatedTime: missingSkill.required === 'beginner' ? '2-4 weeks' : missingSkill.required === 'intermediate' ? '4-6 weeks' : '6-8 weeks',
            completed: false,
            resources: [
              {
                id: `resource-${missingSkill.skillId}-1`,
                title: `${missingSkill.skillName} Fundamentals`,
                type: 'course',
                url: `#learn-${missingSkill.skillId}`,
                duration: '2-4 weeks',
                provider: 'Online Learning Platform'
              }
            ]
          });
        });
      }
      
      // Add items for partial skills that need improvement
      if (analysis?.partialSkills) {
        analysis.partialSkills.forEach((partialSkill: any) => {
          roadmapItems.push({
            id: `improve-${itemId++}`,
            skillId: partialSkill.skill?.id || partialSkill.skillId,
            skillName: partialSkill.skill?.name || partialSkill.skillName,
            difficulty: partialSkill.required,
            estimatedTime: '2-3 weeks',
            completed: false,
            resources: [
              {
                id: `resource-${partialSkill.skill?.id || partialSkill.skillId}-1`,
                title: `Advanced ${partialSkill.skill?.name || partialSkill.skillName}`,
                type: 'course',
                url: `#improve-${partialSkill.skill?.id || partialSkill.skillId}`,
                duration: '2-3 weeks',
                provider: 'Online Learning Platform'
              }
            ]
          });
        });
      }
      
      // Add general milestones
      if (roadmapItems.length > 0) {
        roadmapItems.push({
          id: `milestone-${itemId++}`,
          skillId: 'portfolio',
          skillName: 'Portfolio Project',
          difficulty: 'intermediate',
          estimatedTime: '4-6 weeks',
          completed: false,
          resources: [
            {
              id: 'resource-portfolio-1',
              title: 'Portfolio Project Ideas',
              type: 'documentation',
              url: '#portfolio-ideas',
              duration: '4-6 weeks',
              provider: 'Career Guide'
            }
          ]
        });
        
        roadmapItems.push({
          id: `milestone-${itemId++}`,
          skillId: 'job-search',
          skillName: 'Job Application Process',
          difficulty: 'advanced',
          estimatedTime: '2-3 weeks',
          completed: false,
          resources: [
            {
              id: 'resource-job-search-1',
              title: 'Job Search Strategy',
              type: 'documentation',
              url: '#job-search',
              duration: '2-3 weeks',
              provider: 'Career Guide'
            }
          ]
        });
      }
      
      // If no specific roadmap items, create a general learning path
      if (roadmapItems.length === 0) {
        roadmapItems.push({
          id: 'general-1',
          skillId: 'general',
          skillName: 'Skill Development',
          difficulty: 'intermediate',
          estimatedTime: '4-6 weeks',
          completed: false,
          resources: [
            {
              id: 'resource-general-1',
              title: 'Advanced Learning Resources',
              type: 'course',
              url: '#advanced-learning',
              duration: '4-6 weeks',
              provider: 'Online Learning Platform'
            }
          ]
        });
      }
      
      setState(prev => ({
        ...prev,
        roadmap: roadmapItems,
        loading: false,
      }));
      
      // Save roadmap progress to user state
      const roadmapProgressData = {
        targetRole: selectedRole.id,
        experienceLevel: state.userSkills.length >= 10 ? 'advanced' : 
                        state.userSkills.length >= 5 ? 'intermediate' : 'beginner',
        totalItems: roadmapItems.length,
        completedItems: 0,
        progress: 0,
        roadmapItems: roadmapItems,
        generatedAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };
      
      setState(prev => ({ ...prev, roadmapProgress: roadmapProgressData }));
      
      // Save to backend
      try {
        await apiService.updateRoadmapProgressState(roadmapProgressData);
        console.log('✅ Roadmap generated and saved to user state');
      } catch (saveError) {
        console.warn('⚠️ Failed to save roadmap to backend, but local state updated:', saveError);
      }
      
    } catch (error) {
      console.error('Failed to generate roadmap:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to generate roadmap',
        loading: false,
      }));
    }
  }, [state.selectedRole, state.isAuthenticated, state.userSkills.length, state.analysis]);

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
        completeMFALogin,
        setUserProfile,
        updateUserProfile,
        completeOnboarding,
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
