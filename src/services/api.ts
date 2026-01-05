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

// API Service Class
class ApiService {
  private async getAuthHeaders(): Promise<HeadersInit> {
    // Get fresh token from Firebase Auth
    const { FirebaseAuthService } = await import('./firebase');
    
    // Check if user is authenticated first
    if (!FirebaseAuthService.isAuthenticated()) {
      return {
        'Content-Type': 'application/json'
      };
    }
    
    const token = await FirebaseAuthService.getCurrentUserToken();
    
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: await this.getAuthHeaders(),
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
          console.log('Token expired, attempting refresh...');
          
          // Try to refresh token and retry the request once
          const { FirebaseAuthService } = await import('./firebase');
          const newToken = await FirebaseAuthService.getCurrentUserToken();
          
          if (newToken) {
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
              return await retryResponse.json();
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
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    
    return this.request<UserSkill[]>(`/skills/master?${params.toString()}`);
  }

  async getUserSkills(): Promise<UserSkill[]> {
    return this.request<UserSkill[]>('/skills');
  }

  async addSkill(skillId: string, level: ProficiencyLevel, confidence: string = 'medium'): Promise<void> {
    await this.request('/skills', {
      method: 'POST',
      body: JSON.stringify({ skillId, level, confidence })
    });
  }

  async updateSkill(skillId: string, level?: ProficiencyLevel, confidence?: string): Promise<void> {
    const updates: any = {};
    if (level) updates.level = level;
    if (confidence) updates.confidence = confidence;

    await this.request(`/skills/${skillId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  async removeSkill(skillId: string): Promise<void> {
    await this.request(`/skills/${skillId}`, {
      method: 'DELETE'
    });
  }

  async getSkillCategories(): Promise<{ categories: string[] }> {
    return this.request<{ categories: string[] }>('/skills/categories');
  }

  // Job Roles
  async getJobRoles(category?: string): Promise<JobRole[]> {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    
    return this.request<JobRole[]>(`/roles?${params.toString()}`);
  }

  async getJobRole(roleId: string): Promise<JobRole> {
    return this.request<JobRole>(`/roles/${roleId}`);
  }

  async getRoleCategories(): Promise<{ categories: string[] }> {
    return this.request<{ categories: string[] }>('/roles/categories');
  }

  // Skill Gap Analysis
  async analyzeSkillGaps(roleId: string): Promise<{ analysis: SkillGapAnalysis }> {
    return this.request<{ analysis: SkillGapAnalysis }>(`/skills/analyze/${roleId}`);
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
    return this.request<{ hasRoadmap: boolean; progress: any }>('/roadmap/progress/stats');
  }

  async updateRoadmapProgress(milestoneIndex: number, skillId: string, completed: boolean): Promise<void> {
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
    
    return this.request(`/jobs/search?${params.toString()}`);
  }

  async getJobRecommendations(): Promise<{ recommendations: any[] }> {
    return this.request<{ recommendations: any[] }>('/jobs/recommendations');
  }

  async getTrendingRoles(country: string = 'in'): Promise<{ trendingRoles: any[] }> {
    return this.request<{ trendingRoles: any[] }>(`/jobs/trending?country=${country}`);
  }

  // User Profile
  async updateUserProfile(updates: Partial<UserProfile>): Promise<{ profile: UserProfile }> {
    return this.request<{ profile: UserProfile }>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  async getUserStats(): Promise<{ stats: any }> {
    return this.request<{ stats: any }>('/users/stats');
  }

  // Activity
  async getUserActivity(limit: number = 50): Promise<{ activities: any[] }> {
    return this.request<{ activities: any[] }>(`/activity?limit=${limit}`);
  }

  // Settings
  async getUserSettings(): Promise<{ settings: any }> {
    return this.request<{ settings: any }>('/settings');
  }

  async updateUserSettings(settings: any): Promise<{ settings: any }> {
    return this.request<{ settings: any }>('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    });
  }
}

// Export singleton instance
export const apiService = new ApiService();

// Export types
export type { 
  UserProfile, 
  LoginResponse, 
  SkillGapAnalysis,
  ApiResponse 
};