'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import AuthForm, { SignInFormData } from '@/components/AuthForm';
import Navigation from '@/components/Navigation';

// Component to handle the actual sign-in logic with searchParams
function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectedFrom = searchParams.get('redirectedFrom');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Check if user is already authenticated
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          // User is already signed in, redirect to dashboard or the original destination
          router.push(redirectedFrom || '/dashboard');
        }
      } catch (err) {
        console.error('Error checking session:', err);
        // Don't set error here, just continue with the sign-in page
      }
    };
    
    checkSession();
  }, [router, redirectedFrom]);

  const handleSignIn = async (data: SignInFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if Supabase is properly configured
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        throw new Error('Authentication is not available. The application is not properly configured.');
      }

      // Sign in with password and set session cookie
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (signInError) {
        throw new Error(signInError.message);
      }

      if (!authData.session) {
        throw new Error('Failed to create session. Please try again.');
      }

      // Force a hard navigation to ensure cookies are properly set
      window.location.href = redirectedFrom || '/dashboard';
    } catch (err) {
      console.error('Sign in error:', err);
      setError(err instanceof Error ? err.message : 'Failed to sign in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <AuthForm
        type="signin"
        onSubmit={handleSignIn}
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
}

// Loading fallback for the Suspense boundary
function SignInLoading() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
    </div>
  );
}

// Main component with Suspense boundary
export default function SignIn() {
  return (
    <main className="flex min-h-screen flex-col">
      <Navigation isAuthenticated={false} />
      
      <Suspense fallback={<SignInLoading />}>
        <SignInContent />
      </Suspense>
    </main>
  );
}
