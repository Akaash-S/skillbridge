import { useApp } from '@/context/AppContext';
import { FirebaseAuthService } from '@/services/firebase';

export const AuthDebug = () => {
  const { isAuthenticated, user, loading, mfaRequired, mfaToken, firebaseUser } = useApp();
  
  const debugInfo = {
    // App Context State
    isAuthenticated,
    hasUser: !!user,
    userName: user?.name,
    userEmail: user?.email,
    loading,
    mfaRequired,
    hasMfaToken: !!mfaToken,
    hasFirebaseUser: !!firebaseUser,
    firebaseUserEmail: firebaseUser?.email,
    
    // Firebase Service State
    firebaseCurrentUser: !!FirebaseAuthService.getCurrentUser(),
    firebaseIsAuthenticated: FirebaseAuthService.isAuthenticated(),
    storedToken: !!FirebaseAuthService.getStoredToken(),
    isSessionRestoration: FirebaseAuthService.isSessionRestoration(),
    shouldRequireMFA: FirebaseAuthService.shouldRequireMFA(),
    isMFAVerified: FirebaseAuthService.isMFAVerified(),
    
    // Local Storage State
    manualLogout: localStorage.getItem('skillbridge_manual_logout'),
    mfaVerified: localStorage.getItem('skillbridge_mfa_verified'),
    authToken: !!localStorage.getItem('skillbridge_auth_token'),
  };

  return (
    <div className="fixed bottom-4 right-4 bg-black/90 text-white p-4 rounded-lg text-xs max-w-md z-50">
      <h3 className="font-bold mb-2">Auth Debug Info</h3>
      <pre className="whitespace-pre-wrap">
        {JSON.stringify(debugInfo, null, 2)}
      </pre>
    </div>
  );
};