import React from 'react';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { SimpleLanding } from '@/pages/SimpleLanding';

/**
 * AuthRedirect component handles automatic redirection for authenticated users
 * - If user is authenticated, redirects to dashboard
 * - If user is not authenticated, shows the landing page
 * - Shows loading state while checking authentication
 */
export const AuthRedirect: React.FC = () => {
  const { isAuthenticated, user, isLoading, mfaRequired } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto">
            <Loader2 className="h-8 w-8 animate-spin text-primary-foreground" />
          </div>
          <div className="space-y-2">
            <p className="text-lg font-medium">Loading...</p>
            <p className="text-sm text-muted-foreground">Please wait while we check your authentication</p>
          </div>
        </div>
      </div>
    );
  }

  // If MFA is required, redirect to login to handle MFA
  if (mfaRequired) {
    return <Navigate to="/login" replace />;
  }

  // If user is authenticated, redirect to dashboard
  if (isAuthenticated && user) {
    // If user hasn't completed onboarding, redirect to onboarding first
    if (!user.name || user.name.trim() === '') {
      return <Navigate to="/onboarding" replace />;
    }
    
    return <Navigate to="/dashboard" replace />;
  }

  // User is not authenticated - show the landing page
  return <SimpleLanding />;
};

export default AuthRedirect;