'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AuthForm, { SignInFormData } from '@/components/AuthForm';
import Navigation from '@/components/Navigation';

// Component to handle the actual sign-in logic with searchParams
function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectedFrom = searchParams ? searchParams.get('redirectedFrom') : null;
  const { user, loading, error: authError, signIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Check if user is already authenticated
  useEffect(() => {
    if (user) {
      // User is already signed in, redirect to dashboard or the original destination
      console.log('User already authenticated, redirecting');
      window.location.href = redirectedFrom || '/dashboard';
    }
  }, [user, redirectedFrom]);

  const handleSignIn = async (data: SignInFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('Attempting to sign in with:', { email: data.email });

      // Use the signIn function from AuthContext
      const result = await signIn(data.email, data.password);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to sign in');
      }

      console.log('Sign in successful, redirecting');

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
    <div className="flex flex-1 flex-col items-center justify-center py-12 animate-fade-in">
      <div className="container max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Welcome back</h1>
          <p className="text-gray-dark">Sign in to continue documenting and tracking your home build issues.</p>
        </div>
        
        <AuthForm
          type="signin"
          onSubmit={handleSignIn}
          isLoading={isLoading}
          error={error}
        />
      </div>
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
