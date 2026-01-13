import { env } from '@/config/env';
import { authService } from '@/services/auth';

// API Configuration
const API_BASE_URL = env.apiBaseUrl;
const API_TIMEOUT = env.apiTimeout;

// Types
interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  requireAuth?: boolean;
}

class ApiClient {
  private static instance: ApiClient;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 30000; // 30 seconds

  private constructor() {}

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  // Make authenticated API request
  public async request<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = API_TIMEOUT,
      requireAuth = true
    } = config;

    // Build full URL
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Debug logging
    if (env.debugMode) {
      console.log(`🌐 API Request: ${method} ${url}`);
      console.log(`🔧 API Base URL: ${API_BASE_URL}`);
      console.log(`🔧 Endpoint: ${endpoint}`);
    }
    
    // Prepare headers
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers
    };

    // Add auth header if required
    if (requireAuth) {
      const token = await authService.getCurrentToken();
      if (!token) {
        throw new Error('Authentication required - please log in');
      }
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }

    // Prepare request options
    const requestOptions: RequestInit = {
      method,
      headers: requestHeaders,
      ...(body && { body: JSON.stringify(body) })
    };

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      console.log(`🌐 API ${method} ${endpoint}`, body ? { body } : '');
      
      const response = await fetch(url, {
        ...requestOptions,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Handle non-200 responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Handle 401 - token expired or invalid
        if (response.status === 401) {
          console.log('🔒 401 Unauthorized - token may be expired');
          // Auth service will handle token refresh automatically
          throw new Error('Authentication expired - please log in again');
        }
        
        const errorMessage = errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
      }

      // Parse response
      const data = await response.json();
      console.log(`✅ API ${method} ${endpoint} success`);
      
      return data;

    } catch (error: any) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error(`Request timeout after ${timeout}ms`);
      }
      
      console.error(`❌ API ${method} ${endpoint} failed:`, error.message);
      throw error;
    }
  }

  // GET request with caching
  public async get<T>(endpoint: string, useCache: boolean = true): Promise<T> {
    const cacheKey = `GET:${endpoint}`;
    
    // Check cache first
    if (useCache) {
      const cached = this.getCachedData<T>(cacheKey);
      if (cached) {
        console.log(`📦 Cache hit for ${endpoint}`);
        return cached;
      }
    }

    const data = await this.request<T>(endpoint, { method: 'GET' });
    
    // Cache the result
    if (useCache) {
      this.setCachedData(cacheKey, data);
    }
    
    return data;
  }

  // POST request
  public async post<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, { method: 'POST', body });
  }

  // PUT request
  public async put<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, { method: 'PUT', body });
  }

  // DELETE request
  public async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // PATCH request
  public async patch<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, { method: 'PATCH', body });
  }

  // Public request (no auth required)
  public async publicRequest<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    return this.request<T>(endpoint, { ...config, requireAuth: false });
  }

  // Cache management
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

  // Clear cache
  public clearCache(pattern?: string): void {
    if (pattern) {
      const keysToDelete = Array.from(this.cache.keys()).filter(key => key.includes(pattern));
      keysToDelete.forEach(key => this.cache.delete(key));
      console.log(`🧹 Cleared cache for pattern: ${pattern}`);
    } else {
      this.cache.clear();
      console.log('🧹 Cleared all cache');
    }
  }

  // Get cache stats
  public getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Export singleton instance
export const apiClient = ApiClient.getInstance();
export default apiClient;