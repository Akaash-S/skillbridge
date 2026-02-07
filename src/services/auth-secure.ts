// Secure Auth Service - No sensitive data in localStorage
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

const firebaseConfig = {
  apiKey: env.firebaseApiKey,
  authDomain: env.firebaseAuthDomain,
  projectId: env.firebaseProjectId,
  storageBucket: env.firebaseStorageBucket,
  messagingSenderId: env.firebaseMessagingSenderId,
  appId: env.firebaseAppId
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');

// SECURITY: Only store non-sensitive session type
const SESSION_TYPE_KEY = 'sb_session_type';

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

  // SECURITY: Store user data in memory only, not localStorage
  private currentUser: AuthUser | null = null;
  private currentToken: string | null = null;

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

  private initializeAuthListener(): void {
    onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await this.handleAuthenticatedUser(firebaseUser);
      } else {
        this.clearAuthData();
        this.updateState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
          mfaRequired: false,
          mfaToken: null
        });
      }
    });
  }

  private async handleAuthenticatedUser(firebaseUser: User): Promise<void> {
    try {
      const token = await firebaseUser.getIdToken();
      const sessionType = this.getSessionType();

      const response = await this.callBackendLogin(token, sessionType);
      
      if (response.mfa_required) {
        this.updateState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
          mfaRequired: true,
          mfaToken: response.mfa_token || null
        });
        return;
      }

      // SECURITY: Store in memory only
      this.currentUser = response.user;
      this.currentToken = token;

      this.updateState({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        mfaRequired: false,
        mfaToken: null
      });

      if (sessionType === SessionType.SESSION_RESTORE) {
        localStorage.setItem(SESSION_TYPE_KEY, SessionType.SESSION_RESTORE);
      }

    } catch (error: any) {
      if (import.meta.env.DEV) {
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

  private async callBackendLogin(token: string, sessionType: SessionType): Promise<any> {
    const response = await fetch(`${env.apiBaseUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include', // SECURITY: Enable httpOnly cookies
      body: JSON.stringify({ session_type: sessionType })
    });

    if (!response.ok) {
      throw new Error('Backend login failed');
    }

    return response.json();
  }

  private getSessionType(): SessionType {
    // Check if this is session restoration (page refresh)
    const sessionType = localStorage.getItem(SESSION_TYPE_KEY);
    if (sessionType === SessionType.SESSION_RESTORE) {
      return SessionType.SESSION_RESTORE;
    }
    return SessionType.EXPLICIT_LOGIN;
  }

  private async handleRedirectResult(): Promise<void> {
    try {
      const result = await getRedirectResult(auth);
      if (result?.user) {
        localStorage.setItem(SESSION_TYPE_KEY, SessionType.REDIRECT_COMPLETE);
      }
    } catch (error: any) {
      // Silent fail for redirect result
    }
  }

  public async signInWithPopup(): Promise<void> {
    try {
      localStorage.setItem(SESSION_TYPE_KEY, SessionType.EXPLICIT_LOGIN);
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      if (this.shouldFallbackToRedirect(error)) {
        await this.signInWithRedirect();
        return;
      }
      throw error;
    }
  }

  public async signInWithRedirect(): Promise<void> {
    try {
      localStorage.setItem(SESSION_TYPE_KEY, SessionType.EXPLICIT_LOGIN);
      await signInWithRedirect(auth, googleProvider);
    } catch (error: any) {
      throw error;
    }
  }

  private shouldFallbackToRedirect(error: any): boolean {
    return error.code === 'auth/popup-blocked' || 
           error.code === 'auth/popup-closed-by-user' ||
           error.code === 'auth/cancelled-popup-request';
  }

  public async completeMFALogin(mfaToken: string, code: string, isRecoveryCode: boolean = false): Promise<void> {
    try {
      const response = await fetch(`${env.apiBaseUrl}/auth/login/mfa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          mfa_token: mfaToken,
          code,
          is_recovery_code: isRecoveryCode
        })
      });

      if (!response.ok) {
        throw new Error('MFA verification failed');
      }

      const data = await response.json();
      
      // SECURITY: Store in memory only
      this.currentUser = data.user;
      this.currentToken = await auth.currentUser?.getIdToken() || null;

      this.updateState({
        user: data.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        mfaRequired: false,
        mfaToken: null
      });

    } catch (error: any) {
      throw error;
    }
  }

  public async signOut(): Promise<void> {
    try {
      await signOut(auth);
      this.clearAuthData();
      
      // Call backend logout
      await fetch(`${env.apiBaseUrl}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });

    } catch (error: any) {
      throw error;
    }
  }

  // SECURITY: Clear all auth data from memory
  private clearAuthData(): void {
    this.currentUser = null;
    this.currentToken = null;
    localStorage.removeItem(SESSION_TYPE_KEY);
  }

  public async getCurrentToken(): Promise<string | null> {
    try {
      const user = auth.currentUser;
      if (!user) return null;
      return await user.getIdToken(true);
    } catch (error) {
      return null;
    }
  }

  public subscribe(listener: (state: AuthState) => void): () => void {
    this.authStateListeners.push(listener);
    listener(this.currentState);
    return () => {
      this.authStateListeners = this.authStateListeners.filter(l => l !== listener);
    };
  }

  private updateState(newState: Partial<AuthState>): void {
    this.currentState = { ...this.currentState, ...newState };
    this.authStateListeners.forEach(listener => listener(this.currentState));
  }

  public getState(): AuthState {
    return this.currentState;
  }
}

export const authService = AuthService.getInstance();
