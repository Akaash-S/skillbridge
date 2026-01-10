import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  signOut, 
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { env } from '@/config/env';
import { logBrowserDiagnostics } from '@/utils/browserDiagnostics';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: env.firebaseApiKey,
  authDomain: env.firebaseAuthDomain,
  projectId: env.firebaseProjectId,
  storageBucket: env.firebaseStorageBucket,
  messagingSenderId: env.firebaseMessagingSenderId,
  appId: env.firebaseAppId
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Run browser diagnostics on initialization
if (typeof window !== 'undefined') {
  logBrowserDiagnostics();
}

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');

// Token storage keys
const TOKEN_STORAGE_KEY = 'skillbridge_auth_token';
const REFRESH_TOKEN_KEY = 'skillbridge_refresh_token';
const MFA_VERIFIED_KEY = 'skillbridge_mfa_verified';
const MANUAL_LOGOUT_KEY = 'skillbridge_manual_logout';

// Utility to detect browser extension interference
const detectExtensionInterference = () => {
  // Check for common auth extension indicators
  const hasAuthExtension = !!(
    window.chrome?.runtime ||
    document.querySelector('[data-extension-id]') ||
    window.navigator.userAgent.includes('Extension')
  );
  
  if (hasAuthExtension) {
    console.log('🔍 Browser extension detected - may affect authentication flow');
  }
  
  return hasAuthExtension;
};

// Firebase Auth Service
export class FirebaseAuthService {
  // Sign in with Google - try popup first, fallback to redirect
  static async signInWithGoogle(): Promise<User> {
    try {
      // Mark this as an explicit login (not session restoration)
      localStorage.setItem(MANUAL_LOGOUT_KEY, 'false');
      
      // Configure popup with better error handling for COOP issues
      const popupOptions = {
        width: 500,
        height: 600,
        scrollbars: 'yes',
        resizable: 'yes'
      };
      
      // Try popup first with enhanced error handling
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Store the ID token for API requests
      const idToken = await user.getIdToken();
      this.storeTokens(idToken);
      
      console.log('✅ Google sign-in successful via popup');
      return user;
    } catch (error: any) {
      console.error('Google sign-in popup error:', error);
      
      // Enhanced error handling for COOP and popup issues
      if (error.code === 'auth/popup-blocked' || 
          error.code === 'auth/popup-closed-by-user' ||
          error.code === 'auth/cancelled-popup-request' ||
          error.code === 'auth/web-storage-unsupported' ||
          error.message?.includes('Cross-Origin-Opener-Policy') ||
          error.message?.includes('Cross-Origin-Embedder-Policy') ||
          error.message?.includes('Cross-Origin-Resource-Policy') ||
          error.message?.includes('COEP') ||
          error.message?.includes('CORP') ||
          error.message?.includes('window.close')) {
        
        console.log('🔄 Popup authentication failed due to browser security policies');
        console.log('💡 This might be due to COEP/CORP restrictions or browser extensions');
        
        try {
          // Clear any existing redirect state
          await getRedirectResult(auth);
          
          await signInWithRedirect(auth, googleProvider);
          // The redirect will handle the rest
          throw new Error('REDIRECT_IN_PROGRESS');
        } catch (redirectError) {
          console.error('Redirect sign-in error:', redirectError);
          throw redirectError;
        }
      }
      
      throw error;
    }
  }

  // Handle redirect result (call this on app initialization)
  static async handleRedirectResult(): Promise<User | null> {
    try {
      const result = await getRedirectResult(auth);
      if (result?.user) {
        // Mark this as an explicit login (not session restoration)
        localStorage.setItem(MANUAL_LOGOUT_KEY, 'false');
        
        const idToken = await result.user.getIdToken();
        this.storeTokens(idToken);
        console.log('✅ Redirect sign-in successful');
        return result.user;
      }
      return null;
    } catch (error: any) {
      // Enhanced error suppression for browser extension interference
      if (error.message?.includes('Cross-Origin-Opener-Policy') || 
          error.message?.includes('Cross-Origin-Embedder-Policy') ||
          error.message?.includes('Cross-Origin-Resource-Policy') ||
          error.message?.includes('COEP') ||
          error.message?.includes('CORP') ||
          error.message?.includes('window.close') ||
          error.code === 'auth/popup-closed-by-user' ||
          error.code === 'auth/web-storage-unsupported') {
        console.log('ℹ️ Redirect result: Browser security policy interference detected');
        console.log('💡 COEP/CORP restrictions may be blocking Firebase auth iframe');
        return null;
      }
      
      // Only log actual errors, not browser policy warnings
      if (!error.message?.includes('No redirect operation')) {
        console.error('Redirect result error:', error);
      }
      return null;
    }
  }

  // Sign out with manual logout flag
  static async signOut(isManualLogout: boolean = true): Promise<void> {
    try {
      // Set manual logout flag
      if (isManualLogout) {
        localStorage.setItem(MANUAL_LOGOUT_KEY, 'true');
        console.log('🔐 Manual logout - MFA will be required on next login');
      } else {
        localStorage.removeItem(MANUAL_LOGOUT_KEY);
        console.log('🔓 Automatic logout - no MFA required on next login');
      }
      
      // Clear all auth tokens and MFA state
      this.clearTokens();
      
      await signOut(auth);
    } catch (error) {
      console.error('Sign-out error:', error);
      throw error;
    }
  }

  // Get current user's ID token
  static async getCurrentUserToken(): Promise<string | null> {
    const user = auth.currentUser;
    if (!user) {
      console.log('🔒 No authenticated user found');
      return null;
    }
    
    try {
      // Check if user is still valid
      await user.reload();
      
      // Force refresh to ensure we get a valid token
      const idToken = await user.getIdToken(true);
      this.storeTokens(idToken);
      console.log('🔑 Token refreshed successfully');
      return idToken;
    } catch (error) {
      console.error('❌ Error getting ID token:', error);
      // Clear invalid tokens from storage
      this.clearTokens();
      return null;
    }
  }

  // Store authentication tokens securely
  static storeTokens(idToken: string): void {
    localStorage.setItem(TOKEN_STORAGE_KEY, idToken);
    // Store timestamp for token expiry tracking
    localStorage.setItem(`${TOKEN_STORAGE_KEY}_timestamp`, Date.now().toString());
  }

  // Get stored token if valid
  static getStoredToken(): string | null {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    const timestamp = localStorage.getItem(`${TOKEN_STORAGE_KEY}_timestamp`);
    
    if (!token || !timestamp) {
      return null;
    }
    
    // Check if token is older than 50 minutes (Firebase tokens expire in 1 hour)
    const tokenAge = Date.now() - parseInt(timestamp);
    const maxAge = 50 * 60 * 1000; // 50 minutes
    
    if (tokenAge > maxAge) {
      console.log('🕐 Stored token expired, clearing...');
      this.clearTokens();
      return null;
    }
    
    return token;
  }

  // Clear all stored tokens and MFA state
  static clearTokens(): void {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(`${TOKEN_STORAGE_KEY}_timestamp`);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(MFA_VERIFIED_KEY);
  }

  // Check if this is a session restoration (not explicit login)
  static isSessionRestoration(): boolean {
    const hasStoredToken = !!this.getStoredToken();
    const wasManualLogout = localStorage.getItem(MANUAL_LOGOUT_KEY) === 'true';
    
    console.log('🔍 Session restoration check:', {
      hasStoredToken,
      wasManualLogout,
      isSessionRestoration: hasStoredToken && !wasManualLogout
    });
    
    // It's session restoration if we have a valid token and it wasn't a manual logout
    return hasStoredToken && !wasManualLogout;
  }

  // Mark MFA as verified for this session
  static markMFAVerified(): void {
    localStorage.setItem(MFA_VERIFIED_KEY, 'true');
    localStorage.setItem(`${MFA_VERIFIED_KEY}_timestamp`, Date.now().toString());
    // Clear manual logout flag since MFA is now verified
    localStorage.removeItem(MANUAL_LOGOUT_KEY);
  }

  // Check if MFA is already verified for this session
  static isMFAVerified(): boolean {
    const verified = localStorage.getItem(MFA_VERIFIED_KEY);
    const timestamp = localStorage.getItem(`${MFA_VERIFIED_KEY}_timestamp`);
    
    if (!verified || !timestamp) {
      return false;
    }
    
    // MFA verification is valid for 24 hours
    const verificationAge = Date.now() - parseInt(timestamp);
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    
    if (verificationAge > maxAge) {
      console.log('🕐 MFA verification expired');
      localStorage.removeItem(MFA_VERIFIED_KEY);
      localStorage.removeItem(`${MFA_VERIFIED_KEY}_timestamp`);
      return false;
    }
    
    return true;
  }

  // Force redirect authentication (for when popup fails)
  static async signInWithRedirect(): Promise<void> {
    try {
      // Mark this as an explicit login (not session restoration)
      localStorage.setItem(MANUAL_LOGOUT_KEY, 'false');
      
      console.log('🔄 Starting redirect authentication...');
      await signInWithRedirect(auth, googleProvider);
      // The redirect will complete on page reload
    } catch (error: any) {
      console.error('Redirect sign-in error:', error);
      throw error;
    }
  }

  // Handle session restoration - clear manual logout flag if this is session restoration
  static handleSessionRestoration(): void {
    const isSessionRestoration = this.isSessionRestoration();
    if (isSessionRestoration) {
      console.log('🔄 Session restoration detected - clearing manual logout flag');
      localStorage.setItem(MANUAL_LOGOUT_KEY, 'false');
    }
  }

  // Check if MFA should be required
  static shouldRequireMFA(): boolean {
    const wasManualLogout = localStorage.getItem(MANUAL_LOGOUT_KEY) === 'true';
    const isMFAVerified = this.isMFAVerified();
    const isSessionRestoration = this.isSessionRestoration();
    
    console.log('🔐 MFA requirement check:', {
      wasManualLogout,
      isMFAVerified,
      isSessionRestoration,
      shouldRequire: wasManualLogout && !isMFAVerified && !isSessionRestoration
    });
    
    // If this is session restoration, don't require MFA regardless of manual logout flag
    if (isSessionRestoration) {
      console.log('🔄 Session restoration - clearing manual logout flag and skipping MFA');
      localStorage.setItem(MANUAL_LOGOUT_KEY, 'false');
      return false;
    }
    
    // Require MFA if it was a manual logout and MFA is not already verified
    return wasManualLogout && !isMFAVerified;
  }

  // Listen to auth state changes with debouncing to reduce polling
  static onAuthStateChanged(callback: (user: User | null) => void) {
    let lastCallTime = 0;
    const debounceDelay = 100; // 100ms debounce
    
    return onAuthStateChanged(auth, (user) => {
      const now = Date.now();
      
      // Debounce rapid auth state changes (likely from extensions)
      if (now - lastCallTime < debounceDelay) {
        console.log('🔄 Auth state change debounced (likely extension polling)');
        return;
      }
      
      lastCallTime = now;
      
      // Detect extension interference
      if (detectExtensionInterference()) {
        console.log('⚠️ Extension interference detected during auth state change');
      }
      
      callback(user);
    });
  }

  // Get current user
  static getCurrentUser(): User | null {
    return auth.currentUser;
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    return !!auth.currentUser;
  }
}

export default FirebaseAuthService;