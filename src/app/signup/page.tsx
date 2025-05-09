'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import AuthForm, { SignUpFormData } from '@/components/AuthForm';
import Navigation from '@/components/Navigation';

// Component to handle the actual sign-up logic with searchParams
function SignUpContent() {
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
          // User is already signed in, redirect to dashboard
          router.push('/dashboard');
        }
      } catch (err) {
        console.error('Error checking session:', err);
        // Don't set error here, just continue with the sign-up page
      }
    };
    
    checkSession();
  }, [router]);

  const handleSignUp = async (data: SignUpFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if Supabase is properly configured
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        throw new Error('Authentication is not available. The application is not properly configured.');
      }

      // Create the user account
      const { error: signUpError, data: signUpData } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName || null,
          },
        },
      });

      if (signUpError) {
        throw new Error(signUpError.message);
      }

      // Create a profile record in the profiles table
      if (signUpData.user) {
        try {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: signUpData.user.id,
              email: data.email,
              full_name: data.fullName || null,
            });

          if (profileError) {
            console.error('Error creating profile:', profileError);
            // We don't throw here to avoid blocking the signup process
            // The profile can be created later when the user logs in
          }
        } catch (profileErr) {
          console.error('Error creating profile:', profileErr);
          // Continue with the signup process even if profile creation fails
        }
      }

      // Redirect to dashboard on successful sign up
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      console.error('Sign up error:', err);
      setError(err instanceof Error ? err.message : 'Failed to sign up. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <AuthForm
        type="signup"
        onSubmit={handleSignUp}
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
}

// Loading fallback for the Suspense boundary
function SignUpLoading() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
    </div>
  );
}

// Main component with Suspense boundary
export default function SignUp() {
  return (
    <main className="flex min-h-screen flex-col">
      <Navigation isAuthenticated={false} />
      
      <Suspense fallback={<SignUpLoading />}>
        <SignUpContent />
      </Suspense>
    </main>
  );
}
