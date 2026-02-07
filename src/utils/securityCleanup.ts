/**
 * Security Cleanup Utility
 * 
 * Removes sensitive data from localStorage that was stored by previous versions
 * of the application. This should be called on app initialization.
 * 
 * IMPORTANT: Auth tokens are now stored in httpOnly cookies (server-side)
 * and are NOT accessible to JavaScript.
 */

// List of sensitive keys that should be removed from localStorage
const SENSITIVE_KEYS = [
  'sb_auth_token',      // Old: Firebase JWT token
  'sb_auth_user',       // Old: User profile with UID
  'sb_mfa_token',       // Old: MFA session token
  // Add any other sensitive keys here
];

// List of safe keys that can remain in localStorage
const SAFE_KEYS = [
  'sb_theme',           // Theme preference (light/dark)
  'sb_session_type',    // Session type tracking (non-sensitive)
  'sb_mfa_verified_temp', // Temporary MFA verification flag
  // Add other non-sensitive keys here
];

/**
 * Remove all sensitive data from localStorage
 * This is safe to call multiple times
 */
export const cleanupSensitiveData = (): void => {
  let removedCount = 0;
  
  SENSITIVE_KEYS.forEach(key => {
    if (localStorage.getItem(key) !== null) {
      localStorage.removeItem(key);
      removedCount++;
    }
  });
  
  if (removedCount > 0 && import.meta.env.DEV) {
    console.info(`🧹 Cleaned up ${removedCount} sensitive item(s) from localStorage`);
  }
};

/**
 * Remove ALL localStorage items except safe ones
 * Use this for a complete cleanup
 */
export const cleanupAllExceptSafe = (): void => {
  const allKeys = Object.keys(localStorage);
  let removedCount = 0;
  
  allKeys.forEach(key => {
    if (!SAFE_KEYS.includes(key)) {
      localStorage.removeItem(key);
      removedCount++;
    }
  });
  
  if (removedCount > 0 && import.meta.env.DEV) {
    console.info(`🧹 Cleaned up ${removedCount} item(s) from localStorage`);
  }
};

/**
 * Check if any sensitive data exists in localStorage
 * Returns true if sensitive data is found
 */
export const hasSensitiveData = (): boolean => {
  return SENSITIVE_KEYS.some(key => localStorage.getItem(key) !== null);
};

/**
 * Get a report of what's in localStorage
 * Useful for debugging (only in development)
 */
export const getStorageReport = (): {
  total: number;
  sensitive: string[];
  safe: string[];
  unknown: string[];
} => {
  const allKeys = Object.keys(localStorage);
  
  const sensitive = allKeys.filter(key => SENSITIVE_KEYS.includes(key));
  const safe = allKeys.filter(key => SAFE_KEYS.includes(key));
  const unknown = allKeys.filter(key => 
    !SENSITIVE_KEYS.includes(key) && !SAFE_KEYS.includes(key)
  );
  
  return {
    total: allKeys.length,
    sensitive,
    safe,
    unknown
  };
};

/**
 * Initialize security cleanup
 * Call this when the app starts
 */
export const initSecurityCleanup = (): void => {
  // Clean up sensitive data
  cleanupSensitiveData();
  
  // In development, show a report
  if (import.meta.env.DEV) {
    const report = getStorageReport();
    if (report.sensitive.length > 0) {
      console.warn('⚠️ Sensitive data found in localStorage:', report.sensitive);
    }
    if (report.unknown.length > 0) {
      console.info('ℹ️ Unknown keys in localStorage:', report.unknown);
    }
  }
};

// Export for use in app initialization
export default {
  cleanupSensitiveData,
  cleanupAllExceptSafe,
  hasSensitiveData,
  getStorageReport,
  initSecurityCleanup
};
