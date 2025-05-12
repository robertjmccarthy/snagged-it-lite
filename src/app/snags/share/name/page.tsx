'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useShare } from '@/contexts/ShareContext';
import Navigation from '@/components/Navigation';
import { debug } from '@/lib/debug';

export default function NamePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnToConfirm = searchParams?.get('returnToConfirm') === 'true';
  const { user, loading } = useAuth();
  const { shareData, updateShareData } = useShare();
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with existing data
  useEffect(() => {
    if (shareData.fullName) {
      setFullName(shareData.fullName);
    }
  }, [shareData.fullName]);

  // Protect the route
  useEffect(() => {
    if (!loading && !user) {
      debug.error('Share Name Page: Not authenticated, redirecting to sign-in');
      router.replace('/signin');
    }
  }, [loading, user, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate input
    if (!fullName.trim()) {
      setError('Please enter your full name');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Save to context
      updateShareData({ fullName: fullName.trim() });
      
      // Navigate based on return parameter
      if (returnToConfirm) {
        router.push('/snags/share/confirm');
      } else {
        router.push('/snags/share/address');
      }
    } catch (error) {
      debug.error('Error saving name:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !user) {
    return (
      <main className="flex min-h-screen flex-col">
        <Navigation isAuthenticated={!!user} />
        <div className="flex flex-1 items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col overflow-x-hidden">
      <Navigation isAuthenticated={!!user} />
      
      <div className="fixed inset-0 bg-[#BBF2D7] -z-10"></div>
      <style jsx global>{`
        body {
          background-color: #BBF2D7;
        }
      `}</style>
      
      <div className="flex flex-1 flex-col p-6 animate-fade-in">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-6 flex items-center">
            <button 
              onClick={() => router.back()} 
              className="font-semibold text-sm text-gray-600 underline border-0 bg-transparent p-0 cursor-pointer font-inter flex items-center"
              aria-label="Back"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Back
            </button>
          </div>
          
          <div className="bg-white shadow-sm rounded-xl p-6 md:p-8 border border-gray-100">
            <header className="mb-8">
              <div className="mb-4">
                <p className="text-gray-dark text-sm mb-2">
                  Share your snag list
                </p>
                <h1 className="text-2xl md:text-3xl font-bold">
                  Your full name
                </h1>
              </div>
            </header>
            
            <div className="mb-8">
              <div className="mb-6">
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    setError('');
                  }}
                  className={`input ${error ? 'input-error' : ''}`}
                  placeholder="Enter your full name"
                  aria-describedby={error ? "name-error" : undefined}
                  disabled={isSubmitting}
                  autoComplete="name"
                  required
                />
                {error && (
                  <p id="name-error" className="form-error">
                    {error}
                  </p>
                )}
              </div>
              
              <div className="flex flex-col md:flex-row md:justify-start gap-3 w-full">
                <button
                  onClick={handleSubmit}
                  className="btn btn-primary text-base py-2 px-4 w-full md:w-auto"
                  disabled={isSubmitting}
                  aria-busy={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Continue'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
