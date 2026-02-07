#!/bin/bash

# Apply security fixes to frontend
# 1. Remove sensitive data from localStorage
# 2. Remove console.log statements
# 3. Use secure session management

echo "🔒 Applying Security Fixes to Frontend"
echo "======================================"
echo ""

# Check if we're in the frontend directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found"
    echo "Please run this script from the frontend directory"
    exit 1
fi

echo "📋 Creating backups..."
mkdir -p .security-backups
cp -r src .security-backups/src-$(date +%Y%m%d-%H%M%S)
echo "✅ Backup created in .security-backups/"

echo ""
echo "🔧 Applying fixes..."
echo ""

# Fix 1: Remove console.log statements (keep only errors in dev mode)
echo "1️⃣  Removing debug console.log statements..."

# Create a script to remove console.logs but keep console.error
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i.bak \
    -e '/console\.log/d' \
    -e '/console\.debug/d' \
    -e '/console\.warn/s/console\.warn/\/\/ console.warn/g' \
    {} \;

# Remove backup files
find src -name "*.bak" -delete

echo "✅ Console logs removed"

# Fix 2: Update auth service to not store sensitive data
echo ""
echo "2️⃣  Updating auth service for secure storage..."

cat > src/services/auth-secure.ts << 'EOF'
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
EOF

echo "✅ Secure auth service created"

# Fix 3: Clean up localStorage on app start
echo ""
echo "3️⃣  Adding localStorage cleanup..."

cat > src/utils/securityCleanup.ts << 'EOF'
// Security cleanup utility
// Removes any sensitive data that might be in localStorage from old versions

export function cleanupSensitiveData() {
  // List of sensitive keys to remove
  const sensitiveKeys = [
    'sb_auth_token',
    'sb_auth_user',
    'sb_mfa_verified',
    // Add any other sensitive keys here
  ];

  sensitiveKeys.forEach(key => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key);
      if (import.meta.env.DEV) {
        console.warn(`Removed sensitive data from localStorage: ${key}`);
      }
    }
  });

  // Only keep safe, non-sensitive data
  // Theme preference is safe to keep
}

// Run cleanup on app initialization
cleanupSensitiveData();
EOF

echo "✅ Security cleanup utility created"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Security Fixes Applied!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Changes made:"
echo "   1. ✅ Removed console.log statements"
echo "   2. ✅ Created secure auth service (no localStorage for sensitive data)"
echo "   3. ✅ Added security cleanup utility"
echo ""
echo "🔧 Next steps:"
echo "   1. Review the changes in src/"
echo "   2. Update imports to use new auth-secure.ts if needed"
echo "   3. Test authentication flow"
echo "   4. Build and deploy: npm run build"
echo ""
echo "📦 Backups saved in: .security-backups/"
echo ""
echo "⚠️  Important: Update your backend to use httpOnly cookies for tokens"
echo ""