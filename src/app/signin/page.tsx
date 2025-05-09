'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import AuthForm, { SignInFormData } from '@/components/AuthForm';
import Navigation from '@/components/Navigation';

export default function SignIn() {
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

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (signInError) {
        throw new Error(signInError.message);
      }

      // Redirect to the original destination or dashboard on successful sign in
      router.push(redirectedFrom || '/dashboard');
      router.refresh();
    } catch (err) {
      console.error('Sign in error:', err);
      setError(err instanceof Error ? err.message : 'Failed to sign in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col">
      <Navigation isAuthenticated={false} />
      
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <AuthForm
          type="signin"
          onSubmit={handleSignIn}
          isLoading={isLoading}
          error={error}
        />
      </div>
    </main>
  );
}
