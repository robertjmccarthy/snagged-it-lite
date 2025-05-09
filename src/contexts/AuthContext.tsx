'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, isAuthenticated, getCurrentUser } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

// Define the shape of the auth context
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
}

// Create the auth context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  signIn: async () => ({ success: false }),
  signUp: async () => ({ success: false }),
  signOut: async () => {},
  checkAuth: async () => false,
});

// Hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Provider component to wrap the app with
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to check if user is authenticated
  const checkAuth = async (): Promise<boolean> => {
    try {
      const authenticated = await isAuthenticated();
      if (authenticated) {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        return true;
      } else {
        setUser(null);
        return false;
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  };

  // Check authentication status on mount
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      await checkAuth();
      setLoading(false);
    };

    initAuth();

    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      if (session) {
        setUser(session.user);
      } else {
        setUser(null);
      }
    });

    // Clean up the subscription
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Sign in function
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      console.log('Signing in with:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        setError(error.message);
        return { success: false, error: error.message };
      }

      if (!data.session) {
        const errorMsg = 'No session created after sign in';
        console.error(errorMsg);
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }

      console.log('Sign in successful');
      setUser(data.session.user);
      return { success: true };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An unknown error occurred';
      console.error('Sign in exception:', errorMsg);
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Sign up function
  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName || null,
          },
        },
      });

      if (error) {
        console.error('Sign up error:', error);
        setError(error.message);
        return { success: false, error: error.message };
      }

      if (!data.user) {
        const errorMsg = 'No user created after sign up';
        console.error(errorMsg);
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }

      // Create a profile record
      if (data.user) {
        try {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              email: email,
              full_name: fullName || null,
            });

          if (profileError) {
            console.error('Error creating profile:', profileError);
            // Don't fail the sign-up process if profile creation fails
          }
        } catch (profileErr) {
          console.error('Exception creating profile:', profileErr);
        }
      }

      console.log('Sign up successful');
      return { success: true };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An unknown error occurred';
      console.error('Sign up exception:', errorMsg);
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      setLoading(true);
      console.log('AuthContext: Starting sign out process');
      
      // First set user to null in our local state
      setUser(null);
      
      // Then sign out from Supabase (without global scope which causes 403 errors)
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        setError(error.message);
        return;
      }
      
      console.log('AuthContext: Successfully signed out');
      
      // Clear any localStorage items that might be related to auth
      try {
        localStorage.removeItem('supabase.auth.token');
      } catch (e) {
        console.log('No localStorage access or item not found');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An unknown error occurred';
      console.error('Sign out exception:', errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Provide the auth context to children
  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        signIn,
        signUp,
        signOut,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
