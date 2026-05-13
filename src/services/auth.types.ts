/**
 * Auth Types and Enums
 * Extracted to a separate file to prevent circular dependencies
 */

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

export enum SessionType {
  EXPLICIT_LOGIN = 'explicit_login',
  SESSION_RESTORE = 'session_restore',
  REDIRECT_COMPLETE = 'redirect_complete'
}

export interface AuthContextType extends AuthState {
  // Auth methods
  signInWithPopup: () => Promise<void>;
  signInWithRedirect: () => Promise<void>;
  completeMFALogin: (mfaToken: string, code: string, isRecoveryCode?: boolean) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
  
  // Utility methods
  getCurrentToken: () => Promise<string | null>;
  isMFAVerified: () => boolean;
}
