'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AuthForm, { SignUpFormData } from '@/components/AuthForm';
import Navigation from '@/components/Navigation';

// Component to handle the actual sign-up logic with searchParams
function SignUpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectedFrom = searchParams.get('redirectedFrom');
  const { user, loading, error: authError, signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Check if user is already authenticated
  useEffect(() => {
    if (user) {
      // User is already signed in, redirect to dashboard
      console.log('User already authenticated, redirecting to dashboard');
      window.location.href = '/dashboard';
    }
  }, [user]);

  const handleSignUp = async (data: SignUpFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('Attempting to sign up with:', { email: data.email });

      // Use the signUp function from AuthContext
      const result = await signUp(data.email, data.password, data.fullName);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to sign up');
      }

      console.log('Sign up successful, redirecting');

      // Force a hard navigation to ensure cookies are properly set
      window.location.href = '/dashboard';
    } catch (err) {
      console.error('Sign up error:', err);
      setError(err instanceof Error ? err.message : 'Failed to sign up. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center py-12 animate-fade-in">
      <div className="container max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Create your account</h1>
          <p className="text-gray-dark">Sign up to start documenting and tracking your home build issues.</p>
        </div>
        
        <AuthForm
          type="signup"
          onSubmit={handleSignUp}
          isLoading={isLoading}
          error={error}
        />
      </div>
    </div>
  );
}

// Loading fallback for the Suspense boundary
function SignUpLoading() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
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
