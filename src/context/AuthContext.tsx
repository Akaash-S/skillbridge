import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authService } from '@/services/auth';
import { AuthState, AuthContextType } from '@/services/auth.types';
import { env } from '@/config/env';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
    mfaRequired: false,
    mfaToken: null
  });

  useEffect(() => {
    // Set initial state from service
    const initialState = authService.getCurrentState();
    
    // Bypass auth in development if configured
    if (!initialState.isAuthenticated && import.meta.env.VITE_BYPASS_AUTH === 'true') {
      setAuthState({
        user: {
          uid: 'dev-user-123',
          email: 'dev@example.com',
          name: 'Development User',
          avatar: '',
          emailVerified: true
        },
        isAuthenticated: true,
        isLoading: false,
        error: null,
        mfaRequired: false,
        mfaToken: null
      });
    } else {
      setAuthState(initialState);
    }

    // Subscribe to auth state changes
    const unsubscribe = authService.onAuthStateChange((state) => {
      // Bypass auth in development if configured
      if (!state.isAuthenticated && import.meta.env.VITE_BYPASS_AUTH === 'true') {
        // Already handled by initial state check or will be handled by future updates
      } else {
        setAuthState(state);
      }
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