'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Layout, Section, Card } from '@/components';

export default function CheckYourEmail() {
  const router = useRouter();
  const { user } = useAuth();
  
  // Redirect to dashboard if user is already authenticated
  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  return (
    <Layout>
      <Section background="light" spacing="lg" className="flex-1 flex items-center justify-center animate-fade-in">
        <div className="container max-w-md">
          <Card className="p-8 text-center">
            <div className="mb-8">
              {/* Email icon */}
              <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-gray-900">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>
              
              <h1 className="text-2xl md:text-3xl font-bold mb-4">Almost there! Check your email to confirm your account.</h1>
              
              <p className="text-gray-700 mb-6">
                We've just sent a confirmation link to your inbox. Click that link to verify your email and complete sign-up.
              </p>
              
              <div className="mt-8">
                <Link 
                  href="/signin" 
                  className="text-primary hover:text-primary-dark font-medium underline transition-colors"
                >
                  Already confirmed? Sign in
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </Section>
    </Layout>
  );
}
