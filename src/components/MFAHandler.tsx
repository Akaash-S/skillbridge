import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { MFAVerification } from './MFAVerification';

export const MFAHandler = () => {
  const { mfaRequired, mfaToken, isAuthenticated, user, logout } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the intended destination from location state
  const from = location.state?.from?.pathname || "/dashboard";

  // Handle navigation after MFA completion
  useEffect(() => {
    if (isAuthenticated && user && !mfaRequired) {
      // Check if user has completed onboarding
      if (!user.name || user.name === '') {
        navigate("/onboarding", { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    }
  }, [isAuthenticated, user, mfaRequired, navigate, from]);

  // Handle MFA cancellation
  const handleCancel = async () => {
    try {
      // Clear all auth tokens and MFA state
      await logout(false); // Logout without requiring MFA again
      navigate("/login", { replace: true });
    } catch (error) {
      console.error('Logout error during MFA cancel:', error);
      navigate("/login", { replace: true });
    }
  };

  // Only render MFA verification if MFA is required
  if (!mfaRequired || !mfaToken) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <MFAVerification
        mfaToken={mfaToken}
        onVerificationComplete={() => {
          // Navigation will be handled by the useEffect above
        }}
        onCancel={handleCancel}
      />
    </div>
  );
};