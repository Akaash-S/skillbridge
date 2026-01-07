// Debug authentication flow
import { FirebaseAuthService } from './services/firebase';

export const debugAuth = async () => {
  console.log('🔍 Debug Authentication Status');
  console.log('================================');
  
  // Check if user is authenticated
  const isAuth = FirebaseAuthService.isAuthenticated();
  console.log('Is Authenticated:', isAuth);
  
  // Get current user
  const user = FirebaseAuthService.getCurrentUser();
  console.log('Current User:', user ? {
    uid: user.uid,
    email: user.email,
    emailVerified: user.emailVerified
  } : null);
  
  // Try to get token
  try {
    const token = await FirebaseAuthService.getCurrentUserToken();
    console.log('Token:', token ? `${token.substring(0, 50)}...` : null);
    
    if (token) {
      // Test API call with token
      const response = await fetch('http://localhost:8000/skills/master', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('API Test Response:', response.status, response.statusText);
      
      if (response.ok) {
        const data = await response.json();
        console.log('API Data:', data.length, 'skills loaded');
      } else {
        const error = await response.json();
        console.log('API Error:', error);
      }
    }
  } catch (error) {
    console.error('Token Error:', error);
  }
};

// Add to window for easy access in browser console
(window as any).debugAuth = debugAuth;