import { UserSkill, JobRole, RoadmapItem, LearningResource, ProficiencyLevel } from "@/data/mockData";
import { env } from "@/config/env";

// API Configuration from environment
const API_BASE_URL = env.apiBaseUrl;
const API_TIMEOUT = env.apiTimeout;

// Types for API responses
interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

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

interface LoginResponse {
  user: UserProfile;
  isNewUser: boolean;
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

interface AnalysisWithProgress {
  analysis: SkillGapAnalysis;
  progress: AnalysisProgress;
  hasProgress: boolean;
}

// API Service Class
class ApiService {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 30000; // 30 seconds cache

  private getCacheKey(endpoint: string, params?: any): string {
    return `${endpoint}${params ? JSON.stringify(params) : ''}`;
  }

  private getCachedData<T>(cacheKey: string): T | null {
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }

  private setCachedData(cacheKey: string, data: any): void {
    this.cache.set(cacheKey, { data, timestamp: Date.now() });
  }
  private async getAuthHeaders(): Promise<HeadersInit> {
    // Get fresh token from Firebase Auth
    const { FirebaseAuthService } = await import('./firebase');
    
    // Check if user is authenticated first
    if (!FirebaseAuthService.isAuthenticated()) {
      console.log('🔒 User not authenticated, sending request without token');
      throw new Error('User not authenticated - please log in');
    }
    
    const token = await FirebaseAuthService.getCurrentUserToken();
    console.log('🔑 Got token for API request:', token ? `${token.substring(0, 20)}...` : 'null');
    
    if (!token) {
      throw new Error('Failed to get authentication token - please log in again');
    }
    
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  private getPublicHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json'
    };
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {},
    requireAuth: boolean = true
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: requireAuth ? await this.getAuthHeaders() : this.getPublicHeaders(),
      ...options,
    };

    // Add timeout support
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
    config.signal = controller.signal;

    try {
      const response = await fetch(url, config);
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        // Handle 401 errors by attempting token refresh
        if (response.status === 401) {
          console.log('🔄 Token expired, attempting refresh...');
          
          // Try to refresh token and retry the request once
          const { FirebaseAuthService } = await import('./firebase');
          const newToken = await FirebaseAuthService.getCurrentUserToken();
          
          if (newToken) {
            console.log('🔑 Got fresh token, retrying request...');
            // Retry the request with fresh token
            const retryConfig: RequestInit = {
              ...config,
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${newToken}`
              }
            };
            
            const retryResponse = await fetch(url, retryConfig);
            if (retryResponse.ok) {
              console.log('✅ Retry successful');
              return await retryResponse.json();
            } else {
              console.log('❌ Retry failed with status:', retryResponse.status);
            }
          }
          
          // If refresh failed, throw authentication error
          throw new Error('Authentication failed - please log in again');
        }
        
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout - please check your connection');
      }
      if (error instanceof Error && error.message.includes('Failed to fetch')) {
        throw new Error('Network error - please check if the backend is running');
      }
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // Authentication
  async login(idToken: string): Promise<LoginResponse> {
    return this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ idToken })
    });
  }

  async getCurrentUser(): Promise<{ user: UserProfile }> {
    return this.request<{ user: UserProfile }>('/auth/me');
  }

  // Skills
  async getMasterSkills(category?: string): Promise<UserSkill[]> {
    const cacheKey = this.getCacheKey('/skills/master', { category });
    const cached = this.getCachedData<UserSkill[]>(cacheKey);
    
    if (cached) {
      console.log('📚 Using cached master skills');
      return cached;
    }
    
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    
    const result = await this.request<UserSkill[]>(`/skills/master?${params.toString()}`);
    this.setCachedData(cacheKey, result);
    console.log('📖 Loaded fresh master skills');
    return result;
  }

  async getJobRoles(category?: string): Promise<JobRole[]> {
    const cacheKey = this.getCacheKey('/roles', { category });
    const cached = this.getCachedData<JobRole[]>(cacheKey);
    
    if (cached) {
      console.log('💼 Using cached job roles');
      return cached;
    }
    
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    
    const result = await this.request<JobRole[]>(`/roles?${params.toString()}`);
    this.setCachedData(cacheKey, result);
    console.log('🎯 Loaded fresh job roles');
    return result;
  }

  async getUserSkills(): Promise<UserSkill[]> {
    return this.request<UserSkill[]>('/skills');
  }

  async addSkill(skillId: string, level: ProficiencyLevel, confidence: string = 'medium'): Promise<void> {
    // Clear cache when adding skills
    this.cache.clear();
    await this.request('/skills', {
      method: 'POST',
      body: JSON.stringify({ skillId, level, confidence })
    });
  }

  async updateSkill(skillId: string, level?: ProficiencyLevel, confidence?: string): Promise<void> {
    const updates: any = {};
    if (level) updates.level = level;
    if (confidence) updates.confidence = confidence;

    // Clear cache when updating skills
    this.cache.clear();
    await this.request(`/skills/${skillId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  async removeSkill(skillId: string): Promise<void> {
    // Clear cache when removing skills
    this.cache.clear();
    await this.request(`/skills/${skillId}`, {
      method: 'DELETE'
    });
  }

  async getSkillCategories(): Promise<{ categories: string[] }> {
    return this.request<{ categories: string[] }>('/skills/categories');
  }

  async getJobRole(roleId: string): Promise<JobRole> {
    return this.request<JobRole>(`/roles/${roleId}`);
  }

  async selectTargetRole(roleId: string): Promise<{ message: string; targetRole: any }> {
    // Clear cache when selecting a role since this affects skill matching
    this.clearUserDataCache();
    
    return this.request<{ message: string; targetRole: any }>('/roles/select', {
      method: 'POST',
      body: JSON.stringify({ roleId })
    });
  }

  // Skill Gap Analysis
  async analyzeSkillGaps(roleId: string): Promise<AnalysisWithProgress> {
    return this.request<AnalysisWithProgress>(`/skills/analyze/${roleId}`);
  }

  // Roadmap
  async generateRoadmap(targetRole: string, experienceLevel: ProficiencyLevel = 'beginner'): Promise<RoadmapItem[]> {
    return this.request<RoadmapItem[]>('/roadmap/generate', {
      method: 'POST',
      body: JSON.stringify({ targetRole, experienceLevel })
    });
  }

  async getRoadmap(): Promise<{ roadmap: any }> {
    return this.request<{ roadmap: any }>('/roadmap');
  }

  async getRoadmapProgressStats(): Promise<{ hasRoadmap: boolean; progress: any }> {
    const cacheKey = this.getCacheKey('/roadmap/progress/stats');
    const cached = this.getCachedData<{ hasRoadmap: boolean; progress: any }>(cacheKey);
    
    if (cached) {
      console.log('📋 Using cached roadmap progress stats');
      return cached;
    }
    
    const result = await this.request<{ hasRoadmap: boolean; progress: any }>('/roadmap/progress/stats');
    this.setCachedData(cacheKey, result);
    console.log('📊 Loaded fresh roadmap progress stats');
    return result;
  }

  async updateRoadmapProgress(milestoneIndex: number, skillId: string, completed: boolean): Promise<void> {
    // Clear roadmap progress cache when updating
    const cacheKey = this.getCacheKey('/roadmap/progress/stats');
    this.cache.delete(cacheKey);
    
    await this.request('/roadmap/progress', {
      method: 'PUT',
      body: JSON.stringify({ milestoneIndex, skillId, completed })
    });
  }

  // Learning Resources
  async getLearningResources(skillId: string, level?: ProficiencyLevel): Promise<{ resources: LearningResource[] }> {
    const params = new URLSearchParams();
    if (level) params.append('level', level);
    
    return this.request<{ resources: LearningResource[] }>(`/learning/${skillId}?${params.toString()}`);
  }

  async getRecommendedResources(): Promise<{ recommendations: LearningResource[] }> {
    return this.request<{ recommendations: LearningResource[] }>('/learning/recommendations');
  }

  async markResourceCompleted(resourceId: string, skillId: string): Promise<void> {
    await this.request('/learning/complete', {
      method: 'POST',
      body: JSON.stringify({ resourceId, skillId })
    });
  }

  // Jobs
  async searchJobs(role: string, country: string = 'in', limit: number = 20): Promise<any> {
    const params = new URLSearchParams({
      role,
      country,
      limit: limit.toString()
    });
    
    return this.request(`/jobs/search?${params.toString()}`, {}, false); // No auth required
  }

  async getJobRecommendations(): Promise<{ recommendations: any[] }> {
    return this.request<{ recommendations: any[] }>('/jobs/recommendations');
  }

  async getTrendingRoles(country: string = 'in'): Promise<{ trendingRoles: any[] }> {
    return this.request<{ trendingRoles: any[] }>(`/jobs/trending?country=${country}`, {}, false); // No auth required
  }

  // User State Management
  async getUserState(): Promise<{ userState: any; hasData: boolean }> {
    return this.request<{ userState: any; hasData: boolean }>('/user-state');
  }

  async getDashboardData(): Promise<{ dashboardData: any }> {
    return this.request<{ dashboardData: any }>('/user-state/dashboard');
  }

  async updateUserSkillsState(skills: UserSkill[]): Promise<void> {
    await this.request('/user-state/skills', {
      method: 'PUT',
      body: JSON.stringify({ skills })
    });
  }

  async updateTargetRoleState(targetRole: JobRole): Promise<void> {
    await this.request('/user-state/target-role', {
      method: 'PUT',
      body: JSON.stringify({ targetRole })
    });
  }

  async updateAnalysisState(analysis: SkillGapAnalysis): Promise<void> {
    await this.request('/user-state/analysis', {
      method: 'PUT',
      body: JSON.stringify({ analysis })
    });
  }

  async updateRoadmapProgressState(roadmapProgress: any): Promise<void> {
    await this.request('/user-state/roadmap-progress', {
      method: 'PUT',
      body: JSON.stringify({ roadmapProgress })
    });
  }

  // Optimized Data Fetching Methods
  async getInitialLoadData(): Promise<{
    userState: any;
    userSkills: UserSkill[];
    masterSkills: UserSkill[];
    jobRoles: JobRole[];
    skillGapAnalysis: any;
    hasData: boolean;
  }> {
    const cacheKey = this.getCacheKey('/user-state/initial-load');
    const cached = this.getCachedData<any>(cacheKey);
    
    if (cached) {
      console.log('🚀 Using cached initial load data');
      return cached.initialData;
    }
    
    const result = await this.request<{ initialData: any }>('/user-state/initial-load');
    this.setCachedData(cacheKey, result.initialData);
    console.log('⚡ Loaded fresh initial data');
    return result.initialData;
  }

  async getOptimizedDashboardData(): Promise<{ dashboardData: any }> {
    return this.request<{ dashboardData: any }>('/user-state/dashboard');
  }

  async getSkillsWithRoleAnalysis(roleId?: string): Promise<{
    userSkills: UserSkill[];
    skillsCount: number;
    roleAnalysis?: any;
  }> {
    const params = new URLSearchParams();
    if (roleId) params.append('roleId', roleId);
    
    return this.request<{
      userSkills: UserSkill[];
      skillsCount: number;
      roleAnalysis?: any;
    }>(`/skills/with-role-analysis?${params.toString()}`);
  }

  async getMasterSkillsPaginated(options: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    excludeUserSkills?: boolean;
  } = {}): Promise<{
    skills: UserSkill[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    const params = new URLSearchParams();
    if (options.page) params.append('page', options.page.toString());
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.category) params.append('category', options.category);
    if (options.search) params.append('search', options.search);
    if (options.excludeUserSkills !== undefined) {
      params.append('exclude_user_skills', options.excludeUserSkills.toString());
    }
    
    return this.request<{
      skills: UserSkill[];
      pagination: any;
    }>(`/skills/master/paginated?${params.toString()}`);
  }

  async getRolesWithSkillMatch(options: {
    category?: string;
    limit?: number;
  } = {}): Promise<{
    roles: (JobRole & { skillMatch: any })[];
    userSkillsCount: number;
  }> {
    const cacheKey = this.getCacheKey('/roles/with-skill-match', options);
    const cached = this.getCachedData<any>(cacheKey);
    
    if (cached) {
      console.log('🎯 Using cached roles with skill match');
      return cached;
    }
    
    const params = new URLSearchParams();
    if (options.category) params.append('category', options.category);
    if (options.limit) params.append('limit', options.limit.toString());
    
    const result = await this.request<{
      roles: (JobRole & { skillMatch: any })[];
      userSkillsCount: number;
    }>(`/roles/with-skill-match?${params.toString()}`);
    
    this.setCachedData(cacheKey, result);
    console.log('🔥 Loaded fresh roles with skill matching');
    return result;
  }

  async getRoleCategories(): Promise<{ categories: string[] }> {
    const cacheKey = this.getCacheKey('/roles/categories');
    const cached = this.getCachedData<{ categories: string[] }>(cacheKey);
    
    if (cached) {
      console.log('📂 Using cached role categories');
      return cached;
    }
    
    const result = await this.request<{ categories: string[] }>('/roles/categories');
    this.setCachedData(cacheKey, result);
    console.log('📁 Loaded fresh role categories');
    return result;
  }

  // Clear cache when user data changes
  clearUserDataCache(): void {
    const keysToDelete = Array.from(this.cache.keys()).filter(key => 
      key.includes('/user-state/') || 
      key.includes('/skills/with-role-analysis') ||
      key.includes('/roles/with-skill-match')
    );
    
    keysToDelete.forEach(key => this.cache.delete(key));
    console.log('🧹 Cleared user data cache');
  }

  // User Profile
  async updateUserProfile(updates: Partial<UserProfile>): Promise<{ profile: UserProfile }> {
    return this.request<{ profile: UserProfile }>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  async completeOnboarding(onboardingData: {
    name: string;
    education: string;
    experience: string;
    interests: string[];
  }): Promise<{ profile: UserProfile }> {
    return this.request<{ profile: UserProfile }>('/users/onboarding', {
      method: 'POST',
      body: JSON.stringify(onboardingData)
    });
  }

  async getUserStats(): Promise<{ stats: any }> {
    return this.request<{ stats: any }>('/users/stats');
  }

  // Activity
  async getUserActivity(limit: number = 50): Promise<{ activities: any[] }> {
    return this.request<{ activities: any[] }>(`/activity?limit=${limit}`);
  }

  async getActivitySummary(days: number = 30): Promise<{ summary: any }> {
    return this.request<{ summary: any }>(`/activity/summary?days=${days}`);
  }

  // Settings
  async getUserSettings(): Promise<{ settings: any }> {
    return this.request<{ settings: any }>('/settings');
  }

  async updateUserSettings(settings: any): Promise<{ message: string; settings: any }> {
    return this.request<{ message: string; settings: any }>('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    });
  }

  async resetUserSettings(): Promise<{ message: string; settings: any }> {
    return this.request<{ message: string; settings: any }>('/settings/reset', {
      method: 'POST'
    });
  }

  async exportUserSettings(): Promise<any> {
    return this.request<any>('/settings/export');
  }
}

// Export singleton instance
export const apiService = new ApiService();

// Export types
export type { 
  UserProfile, 
  LoginResponse, 
  SkillGapAnalysis,
  AnalysisProgress,
  AnalysisWithProgress,
  ApiResponse 
};