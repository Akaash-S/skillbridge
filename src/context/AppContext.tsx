import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { UserSkill, JobRole, RoadmapItem, ProficiencyLevel, skillsDatabase, learningResourcesDatabase } from "@/data/mockData";

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

interface AppState {
  isAuthenticated: boolean;
  user: UserProfile | null;
  userSkills: UserSkill[];
  selectedRole: JobRole | null;
  analysis: SkillGapAnalysis | null;
  roadmap: RoadmapItem[];
}

interface AppContextType extends AppState {
  login: () => void;
  logout: () => void;
  setUserProfile: (profile: UserProfile) => void;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  addSkill: (skillId: string, proficiency: ProficiencyLevel) => void;
  removeSkill: (skillId: string) => void;
  updateSkillProficiency: (skillId: string, proficiency: ProficiencyLevel) => void;
  selectRole: (role: JobRole) => void;
  analyzeSkillGap: () => void;
  generateRoadmap: () => void;
  markRoadmapItemComplete: (itemId: string) => void;
  resetProgress: () => void;
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
    userSkills: [],
    selectedRole: null,
    analysis: null,
    roadmap: [],
  });

  const login = useCallback(() => {
    setState((prev) => ({ ...prev, isAuthenticated: true }));
  }, []);

  const logout = useCallback(() => {
    setState({
      isAuthenticated: false,
      user: null,
      userSkills: [],
      selectedRole: null,
      analysis: null,
      roadmap: [],
    });
  }, []);

  const setUserProfile = useCallback((profile: UserProfile) => {
    setState((prev) => ({ ...prev, user: { ...defaultUser, ...profile } }));
  }, []);

  const updateUserProfile = useCallback((updates: Partial<UserProfile>) => {
    setState((prev) => ({
      ...prev,
      user: prev.user ? { ...prev.user, ...updates } : null,
    }));
  }, []);

  const addSkill = useCallback((skillId: string, proficiency: ProficiencyLevel) => {
    const skill = skillsDatabase.find((s) => s.id === skillId);
    if (!skill) return;

    setState((prev) => {
      const exists = prev.userSkills.some((s) => s.id === skillId);
      if (exists) return prev;
      return {
        ...prev,
        userSkills: [...prev.userSkills, { ...skill, proficiency }],
      };
    });
  }, []);

  const removeSkill = useCallback((skillId: string) => {
    setState((prev) => ({
      ...prev,
      userSkills: prev.userSkills.filter((s) => s.id !== skillId),
    }));
  }, []);

  const updateSkillProficiency = useCallback((skillId: string, proficiency: ProficiencyLevel) => {
    setState((prev) => ({
      ...prev,
      userSkills: prev.userSkills.map((s) =>
        s.id === skillId ? { ...s, proficiency } : s
      ),
    }));
  }, []);

  const selectRole = useCallback((role: JobRole) => {
    setState((prev) => ({ ...prev, selectedRole: role, analysis: null, roadmap: [] }));
  }, []);

  const proficiencyValue = (level: ProficiencyLevel): number => {
    switch (level) {
      case "beginner": return 1;
      case "intermediate": return 2;
      case "advanced": return 3;
    }
  };

  const analyzeSkillGap = useCallback(() => {
    const { userSkills, selectedRole } = state;
    if (!selectedRole) return;

    const matchedSkills: SkillGapAnalysis["matchedSkills"] = [];
    const missingSkills: SkillGapAnalysis["missingSkills"] = [];
    const partialSkills: SkillGapAnalysis["partialSkills"] = [];

    selectedRole.requiredSkills.forEach((req) => {
      const userSkill = userSkills.find((s) => s.id === req.skillId);
      const skillInfo = skillsDatabase.find((s) => s.id === req.skillId);

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

    setState((prev) => ({
      ...prev,
      analysis: { readinessScore, matchedSkills, missingSkills, partialSkills },
    }));
  }, [state]);

  const generateRoadmap = useCallback(() => {
    const { analysis } = state;
    if (!analysis) return;

    const roadmapItems: RoadmapItem[] = [];

    analysis.partialSkills.forEach((partial) => {
      const resources = learningResourcesDatabase[partial.skill.id] || [];
      roadmapItems.push({
        id: `roadmap-${partial.skill.id}`,
        skillId: partial.skill.id,
        skillName: partial.skill.name,
        resources,
        difficulty: partial.required,
        estimatedTime: resources.reduce((acc, r) => acc + parseInt(r.duration), 0) + " hours",
        completed: false,
      });
    });

    analysis.missingSkills.forEach((missing) => {
      const resources = learningResourcesDatabase[missing.skillId] || [];
      roadmapItems.push({
        id: `roadmap-${missing.skillId}`,
        skillId: missing.skillId,
        skillName: missing.skillName,
        resources,
        difficulty: missing.required,
        estimatedTime: resources.reduce((acc, r) => acc + parseInt(r.duration), 0) + " hours",
        completed: false,
      });
    });

    setState((prev) => ({ ...prev, roadmap: roadmapItems }));
  }, [state]);

  const markRoadmapItemComplete = useCallback((itemId: string) => {
    setState((prev) => ({
      ...prev,
      roadmap: prev.roadmap.map((item) =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      ),
    }));
  }, []);

  const resetProgress = useCallback(() => {
    setState((prev) => ({
      ...prev,
      analysis: null,
      roadmap: [],
      selectedRole: null,
    }));
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
