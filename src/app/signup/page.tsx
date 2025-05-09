'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import AuthForm, { SignUpFormData } from '@/components/AuthForm';
import Navigation from '@/components/Navigation';

export default function SignUp() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    <main className="flex min-h-screen flex-col">
      <Navigation isAuthenticated={false} />
      
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <AuthForm
          type="signup"
          onSubmit={handleSignUp}
          isLoading={isLoading}
          error={error}
        />
      </div>
    </main>
  );
}
