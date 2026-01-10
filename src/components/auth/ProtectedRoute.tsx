import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, user, isLoading, mfaRequired } = useAuth();
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
    console.log('🔐 MFA required, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If not authenticated, redirect to login with return URL
  if (!isAuthenticated || !user) {
    console.log('🔒 Not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user hasn't completed onboarding, redirect to onboarding
  if (user && (!user.name || user.name.trim() === '') && location.pathname !== '/onboarding') {
    console.log('👋 User needs onboarding, redirecting');
    return <Navigate to="/onboarding" replace />;
  }

  // User is authenticated and ready - render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;