import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  signOut, 
  onAuthStateChanged,
  User,
  AuthError
} from 'firebase/auth';
import { env } from '@/config/env';

// Firebase configuration
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

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');

// Storage keys - ONLY for non-sensitive data
// Auth tokens and user data are now in httpOnly cookies (server-side)
const SESSION_TYPE_KEY = 'sb_session_type'; // Safe: only tracks session type
const MFA_VERIFIED_KEY = 'sb_mfa_verified_temp'; // Temporary MFA verification flag

// Types
export interface AuthUser {
  uid: string;
  email: string;
  name: string;
  avatar: string;
  emailVerified: boolean;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  mfaRequired: boolean;
  mfaToken: string | null;
}

export interface LoginResponse {
  user: AuthUser;
  isNewUser: boolean;
  mfa_required?: boolean;
  mfa_token?: string;
}

// Session types
export enum SessionType {
  EXPLICIT_LOGIN = 'explicit_login',
  SESSION_RESTORE = 'session_restore',
  REDIRECT_COMPLETE = 'redirect_complete'
}

class AuthService {
  private static instance: AuthService;
  private authStateListeners: ((state: AuthState) => void)[] = [];
  private currentState: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
    mfaRequired: false,
    mfaToken: null
  };

  private constructor() {
    this.initializeAuthListener();
    this.handleRedirectResult();
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Initialize Firebase auth state listener
  private initializeAuthListener(): void {
    onAuthStateChanged(auth, async (firebaseUser) => {
      
      if (firebaseUser) {
        await this.handleAuthenticatedUser(firebaseUser);
      } else {
        this.updateState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
          mfaRequired: false,
          mfaToken: null
        });
        this.clearStoredAuth();
      }
    });
  }

  // Handle authenticated Firebase user
  private async handleAuthenticatedUser(firebaseUser: User): Promise<void> {
    try {
      this.updateState({ isLoading: true, error: null });

      // Get fresh ID token
      const idToken = await firebaseUser.getIdToken(true);
      
      // Determine session type
      const sessionType = this.getSessionType();

      // Call backend login
      const response = await this.callBackendLogin(idToken, sessionType);
      
      if (response.mfa_required) {
        this.updateState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          mfaRequired: true,
          mfaToken: response.mfa_token || null,
          error: null
        });
        return;
      }

      // Success - user is authenticated
      const authUser: AuthUser = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        name: response.user.name || firebaseUser.displayName || '',
        avatar: response.user.avatar || firebaseUser.photoURL || '',
        emailVerified: firebaseUser.emailVerified
      };

      this.updateState({
        user: authUser,
        isAuthenticated: true,
        isLoading: false,
        mfaRequired: false,
        mfaToken: null,
        error: null
      });

      // Store session type for future reference
      if (sessionType === SessionType.SESSION_RESTORE) {
        localStorage.setItem(SESSION_TYPE_KEY, SessionType.SESSION_RESTORE);
      }

    } catch (error: any) {
      if (env.debugMode) {
        console.error('Auth error:', error);
      }
      this.updateState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: error.message || 'Authentication failed',
        mfaRequired: false,
        mfaToken: null
      });
    }
  }

  // Determine session type
  private getSessionType(): SessionType {
    const sessionType = localStorage.getItem(SESSION_TYPE_KEY);
    
    // Check if this is a session restoration
    if (sessionType === SessionType.SESSION_RESTORE) {
      return SessionType.SESSION_RESTORE;
    }
    
    // Otherwise, it's explicit login
    return SessionType.EXPLICIT_LOGIN;
  }

  // Call backend login API
  private async callBackendLogin(idToken: string, sessionType: SessionType): Promise<LoginResponse> {
    const response = await fetch(`${env.apiBaseUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Send cookies with request
      body: JSON.stringify({ 
        idToken,
        sessionType,
        skipMFA: sessionType === SessionType.SESSION_RESTORE
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // Handle redirect result on app initialization
  private async handleRedirectResult(): Promise<void> {
    try {
      const result = await getRedirectResult(auth);
      if (result?.user) {
        localStorage.setItem(SESSION_TYPE_KEY, SessionType.REDIRECT_COMPLETE);
      }
    } catch (error: any) {
    }
  }

  // Sign in with Google (popup method)
  public async signInWithPopup(): Promise<void> {
    try {
      localStorage.setItem(SESSION_TYPE_KEY, SessionType.EXPLICIT_LOGIN);
      
      await signInWithPopup(auth, googleProvider);
      
      // Auth state listener will handle the rest
    } catch (error: any) {
      if (env.debugMode) {
        console.error('Popup authentication failed:', error);
      }
      
      // Check if we should fallback to redirect
      if (this.shouldFallbackToRedirect(error)) {
        await this.signInWithRedirect();
        return;
      }
      
      throw error;
    }
  }

  // Sign in with redirect (fallback method)
  public async signInWithRedirect(): Promise<void> {
    try {
      localStorage.setItem(SESSION_TYPE_KEY, SessionType.EXPLICIT_LOGIN);
      await signInWithRedirect(auth, googleProvider);
    } catch (error: any) {
      if (env.debugMode) {
        console.error('Redirect authentication failed:', error);
      }
      throw error;
    }
  }

  // Check if should fallback to redirect
  private shouldFallbackToRedirect(error: AuthError): boolean {
    const fallbackCodes = [
      'auth/popup-blocked',
      'auth/popup-closed-by-user',
      'auth/cancelled-popup-request',
      'auth/web-storage-unsupported'
    ];
    
    const fallbackMessages = [
      'Cross-Origin-Opener-Policy',
      'Cross-Origin-Embedder-Policy',
      'Cross-Origin-Resource-Policy',
      'window.close',
      'COEP',
      'CORP'
    ];
    
    return fallbackCodes.includes(error.code) || 
           fallbackMessages.some(msg => error.message?.includes(msg));
  }

  // Complete MFA login
  public async completeMFALogin(mfaToken: string, code: string, isRecoveryCode: boolean = false): Promise<void> {
    try {
      // Get current Firebase user's ID token
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) {
        throw new Error('No Firebase user found');
      }
      
      const idToken = await firebaseUser.getIdToken();
      
      const response = await fetch(`${env.apiBaseUrl}/auth/login/mfa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Send cookies with request
        body: JSON.stringify({
          mfa_token: mfaToken,
          code,
          is_recovery_code: isRecoveryCode,
          idToken // Required for backend to set cookie
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'MFA verification failed');
      }

      const result = await response.json();
      
      // Mark MFA as verified
      this.markMFAVerified();
      
      // Update state with authenticated user
      const authUser: AuthUser = {
        uid: result.user.uid,
        email: result.user.email,
        name: result.user.name,
        avatar: result.user.avatar,
        emailVerified: true
      };

      this.updateState({
        user: authUser,
        isAuthenticated: true,
        isLoading: false,
        mfaRequired: false,
        mfaToken: null,
        error: null
      });

    } catch (error: any) {
      if (env.debugMode) {
        console.error('MFA login failed:', error);
      }
      throw error;
    }
  }

  // Sign out
  public async signOut(): Promise<void> {
    try {
      // Call backend logout to clear httpOnly cookie
      await fetch(`${env.apiBaseUrl}/auth/logout`, {
        method: 'POST',
        credentials: 'include' // Send cookie to be cleared
      }).catch(() => {
        // Ignore errors - proceed with local logout anyway
      });
      
      // Sign out from Firebase
      await signOut(auth);
      
      // Clear local storage
      this.clearStoredAuth();
      this.clearMFAVerified();
      
      this.updateState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        mfaRequired: false,
        mfaToken: null
      });
      
    } catch (error: any) {
      if (env.debugMode) {
        console.error('Sign out failed:', error);
      }
      throw error;
    }
  }

  // Get current auth token
  public async getCurrentToken(): Promise<string | null> {
    const user = auth.currentUser;
    if (!user) return null;
    
    try {
      return await user.getIdToken(true);
    } catch (error) {
      if (env.debugMode) {
        console.error('Failed to get current token:', error);
      }
      return null;
    }
  }

  // Clear stored auth data (only non-sensitive session info)
  private clearStoredAuth(): void {
    localStorage.removeItem(SESSION_TYPE_KEY);
  }

  // Mark MFA as verified
  private markMFAVerified(): void {
    const expiryTime = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
    localStorage.setItem(MFA_VERIFIED_KEY, expiryTime.toString());
  }

  // Clear MFA verified status
  private clearMFAVerified(): void {
    localStorage.removeItem(MFA_VERIFIED_KEY);
  }

  // Check if MFA is verified
  public isMFAVerified(): boolean {
    const expiryTime = localStorage.getItem(MFA_VERIFIED_KEY);
    if (!expiryTime) return false;
    
    return Date.now() < parseInt(expiryTime);
  }

  // Update state and notify listeners
  private updateState(updates: Partial<AuthState>): void {
    this.currentState = { ...this.currentState, ...updates };
    this.authStateListeners.forEach(listener => listener(this.currentState));
  }

  // Subscribe to auth state changes
  public onAuthStateChange(listener: (state: AuthState) => void): () => void {
    this.authStateListeners.push(listener);
    
    // Immediately call with current state
    listener(this.currentState);
    
    // Return unsubscribe function
    return () => {
      const index = this.authStateListeners.indexOf(listener);
      if (index > -1) {
        this.authStateListeners.splice(index, 1);
      }
    };
  }

  // Get current state
  public getCurrentState(): AuthState {
    return { ...this.currentState };
  }

  // Clear error
  public clearError(): void {
    this.updateState({ error: null });
  }
}

// Export singleton instance
export const authService = AuthService.getInstance();
export default authService;