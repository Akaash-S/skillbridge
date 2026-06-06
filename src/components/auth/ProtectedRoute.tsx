import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useAppData } from '@/context/AppDataContext';

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, user, isLoading, mfaRequired } = useAuth();
  const { userSkills, initialLoadDone } = useAppData();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto">
            <Loader2 className="h-8 w-8 animate-spin text-primary-foreground" />
          </div>
          <div className="space-y-2">
            <p className="text-lg font-medium">Checking authentication...</p>
            <p className="text-sm text-muted-foreground">Please wait while we verify your session</p>
          </div>
        </div>
      </div>
    );
  }

  // If MFA is required, redirect to login to handle MFA
  if (mfaRequired) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If not authenticated, redirect to login with return URL
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user hasn't completed onboarding, redirect to onboarding
  if (user && (!user.name || user.name.trim() === '') && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  // Paths that do not require skill checks / redirection
  const isExcludedPath = ['/skills', '/onboarding'].includes(location.pathname);

  // If onboarding is complete, but skills/profile data is still loading, show spinner for non-excluded paths
  if (!initialLoadDone && !isExcludedPath) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto">
            <Loader2 className="h-8 w-8 animate-spin text-primary-foreground" />
          </div>
          <div className="space-y-2">
            <p className="text-lg font-medium">Loading profile...</p>
            <p className="text-sm text-muted-foreground">Please wait while we load your information</p>
          </div>
        </div>
      </div>
    );
  }

  // If user has 0 skills and is not on an excluded page, redirect to skills page
  if (initialLoadDone && userSkills && userSkills.length === 0 && !isExcludedPath) {
    return <Navigate to="/skills" replace />;
  }

  // User is authenticated and ready - render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;