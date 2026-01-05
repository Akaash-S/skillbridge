import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { env } from '@/config/env';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: env.firebaseApiKey,
  authDomain: env.firebaseAuthDomain,
  projectId: env.firebaseProjectId,
  storageBucket: env.firebaseStorageBucket,
  messagingSenderId: env.firebaseMessagingSenderId,
  appId: env.firebaseAppId
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');

// Firebase Auth Service
export class FirebaseAuthService {
  // Sign in with Google
  static async signInWithGoogle(): Promise<User> {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Store the ID token for API requests
      const idToken = await user.getIdToken();
      localStorage.setItem('firebase_token', idToken);
      
      return user;
    } catch (error) {
      console.error('Google sign-in error:', error);
      throw error;
    }
  }

  // Sign out
  static async signOut(): Promise<void> {
    try {
      await signOut(auth);
      localStorage.removeItem('firebase_token');
    } catch (error) {
      console.error('Sign-out error:', error);
      throw error;
    }
  }

  // Get current user's ID token
  static async getCurrentUserToken(): Promise<string | null> {
    const user = auth.currentUser;
    if (!user) {
      console.log('No authenticated user found');
      return null;
    }
    
    try {
      // Force refresh to ensure we get a valid token
      const idToken = await user.getIdToken(true);
      localStorage.setItem('firebase_token', idToken);
      console.log('Token refreshed successfully');
      return idToken;
    } catch (error) {
      console.error('Error getting ID token:', error);
      // Clear invalid token from storage
      localStorage.removeItem('firebase_token');
      return null;
    }
  }

  // Listen to auth state changes
  static onAuthStateChanged(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  }

  // Get current user
  static getCurrentUser(): User | null {
    return auth.currentUser;
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    return !!auth.currentUser;
  }
}

export default FirebaseAuthService;