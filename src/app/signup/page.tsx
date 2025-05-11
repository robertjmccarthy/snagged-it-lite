'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AuthForm, { SignUpFormData } from '@/components/AuthForm';
import { Layout, Section, Card } from '@/components';

// Component to handle the actual sign-up logic with searchParams
function SignUpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectedFrom = searchParams?.get('redirectedFrom') || null;
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
      const result = await signUp(data.email, data.password);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to sign up');
      }

      console.log('Sign up successful, redirecting to email confirmation page');

      // Redirect to the email confirmation page
      router.push('/check-your-email');
    } catch (err) {
      console.error('Sign up error:', err);
      setError(err instanceof Error ? err.message : 'Failed to sign up. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Section background="light" spacing="lg" className="flex-1 flex items-center justify-center animate-fade-in">
      <div className="container max-w-md">
        <Card className="p-8">
          <div className="text-left mb-4">
            <h1 className="text-3xl font-bold mb-2">Create your account</h1>
          </div>
          
          <AuthForm
            type="signup"
            onSubmit={handleSignUp}
            isLoading={isLoading}
            error={error}
          />
        </Card>
      </div>
    </Section>
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
    <Layout>
      <Suspense fallback={<SignUpLoading />}>
        <SignUpContent />
      </Suspense>
    </Layout>
  );
}
