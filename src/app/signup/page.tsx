'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import AuthForm from '@/components/AuthForm';
import Navigation from '@/components/Navigation';
import { SignUpFormData } from '@/types/auth';

export default function SignUp() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignUp = async (data: SignUpFormData) => {
    try {
      setIsLoading(true);
      setError(null);

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
