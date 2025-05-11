'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Layout, Section, Card, Button } from '@/components';

export default function ConfirmEmail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Clear any temporary session state on mount
  useEffect(() => {
    const clearSession = async () => {
      try {
        // If there's an access token, we need to clear it
        if (searchParams?.has('access_token')) {
          console.log('Clearing temporary session state');
          
          // Clear any session data without setting it
          await supabase.auth.signOut({ scope: 'local' });
          
          // Clear any localStorage items that might be related to auth
          try {
            localStorage.removeItem('supabase.auth.token');
          } catch (e) {
            console.log('No localStorage access or item not found');
          }
        }
      } catch (error) {
        console.error('Error clearing session:', error);
      }
    };
    
    clearSession();
  }, [searchParams]);

  return (
    <Layout>
      <Section background="light" spacing="lg" className="flex-1 flex items-center justify-center animate-fade-in">
        <div className="container max-w-md">
          <Card className="p-8 text-center">
            <div className="mb-8">
              {/* Success icon */}
              <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-gray-900">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              
              <h1 className="text-2xl md:text-3xl font-bold mb-4">Email Confirmed!</h1>
              
              <p className="text-gray-700 mb-6">
                Your email has been verified. Please sign in to continue.
              </p>
              
              <div className="mt-8">
                <Link href="/signin">
                  <Button variant="primary" size="md">
                    Go to Sign In
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </Section>
    </Layout>
  );
}
