import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authService, AuthState, AuthUser } from '@/services/auth';
import { env } from '@/config/env';

interface AuthContextType extends AuthState {
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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>(authService.getCurrentState());

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = authService.onAuthStateChange((state) => {
      setAuthState(state);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Auth methods
  const signInWithPopup = async (): Promise<void> => {
    try {
      await authService.signInWithPopup();
    } catch (error: any) {
      if (env.debugMode) {
        console.error('AuthProvider: Popup sign-in failed:', error);
      }
      throw error;
    }
  };

  const signInWithRedirect = async (): Promise<void> => {
    try {
      await authService.signInWithRedirect();
    } catch (error: any) {
      if (env.debugMode) {
        console.error('AuthProvider: Redirect sign-in failed:', error);
      }
      throw error;
    }
  };

  const completeMFALogin = async (mfaToken: string, code: string, isRecoveryCode: boolean = false): Promise<void> => {
    try {
      await authService.completeMFALogin(mfaToken, code, isRecoveryCode);
    } catch (error: any) {
      if (env.debugMode) {
        console.error('AuthProvider: MFA login failed:', error);
      }
      throw error;
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      await authService.signOut();
    } catch (error: any) {
      if (env.debugMode) {
        console.error('AuthProvider: Sign out failed:', error);
      }
      throw error;
    }
  };

  const clearError = (): void => {
    authService.clearError();
  };

  const getCurrentToken = async (): Promise<string | null> => {
    return authService.getCurrentToken();
  };

  const isMFAVerified = (): boolean => {
    return authService.isMFAVerified();
  };

  const contextValue: AuthContextType = {
    // Auth state
    ...authState,
    
    // Auth methods
    signInWithPopup,
    signInWithRedirect,
    completeMFALogin,
    signOut,
    clearError,
    
    // Utility methods
    getCurrentToken,
    isMFAVerified
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;