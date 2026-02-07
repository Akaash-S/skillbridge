// Environment configuration and validation

interface EnvConfig {
  // Firebase
  firebaseApiKey: string;
  firebaseAuthDomain: string;
  firebaseProjectId: string;
  firebaseStorageBucket: string;
  firebaseMessagingSenderId: string;
  firebaseAppId: string;
  
  // API
  apiBaseUrl: string;
  apiTimeout: number;
  
  // App
  appEnv: string;
  appName: string;
  appVersion: string;
  debugMode: boolean;
  
  // Features
  enableAiRoadmap: boolean;
  enableJobSearch: boolean;
  enableSkillAssessments: boolean;
  enableResumeAnalysis: boolean;
}

// Required environment variables
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
] as const;

// Validate required environment variables
function validateEnv(): void {
  const missing = requiredEnvVars.filter(
    (envVar) => !import.meta.env[envVar]
  );

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env file and ensure all required variables are set.\n' +
      'See .env.example for reference.'
    );
  }
}

// Parse boolean environment variable
function parseBoolean(value: string | undefined, defaultValue: boolean = false): boolean {
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true';
}

// Parse number environment variable
function parseNumber(value: string | undefined, defaultValue: number): number {
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

// Validate and create configuration
function createConfig(): EnvConfig {
  validateEnv();

  return {
    // Firebase
    firebaseApiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    firebaseAuthDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    firebaseProjectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    firebaseStorageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    firebaseMessagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    firebaseAppId: import.meta.env.VITE_FIREBASE_APP_ID,
    
    // API
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
    apiTimeout: parseNumber(import.meta.env.VITE_API_TIMEOUT, 30000),
    
    // App
    appEnv: import.meta.env.VITE_APP_ENV || 'development',
    appName: import.meta.env.VITE_APP_NAME || 'SkillBridge Suite',
    appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
    debugMode: parseBoolean(import.meta.env.VITE_DEBUG_MODE, true),
    
    // Features
    enableAiRoadmap: parseBoolean(import.meta.env.VITE_ENABLE_AI_ROADMAP, true),
    enableJobSearch: parseBoolean(import.meta.env.VITE_ENABLE_JOB_SEARCH, true),
    enableSkillAssessments: parseBoolean(import.meta.env.VITE_ENABLE_SKILL_ASSESSMENTS, true),
    enableResumeAnalysis: parseBoolean(import.meta.env.VITE_ENABLE_RESUME_ANALYSIS, true),
  };
}

// Export the configuration
export const env = createConfig();

// Export types
export type { EnvConfig };

