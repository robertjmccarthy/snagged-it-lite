'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useShare } from '@/contexts/ShareContext';
import Navigation from '@/components/Navigation';
import { debug } from '@/lib/debug';
import { TOP_BUILDERS } from '@/constants/builders';

export default function BuilderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnToConfirm = searchParams?.get('returnToConfirm') === 'true';
  const { user, loading } = useAuth();
  const { shareData, updateShareData } = useShare();
  const [builderType, setBuilderType] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with existing data
  useEffect(() => {
    if (shareData.builderType) {
      setBuilderType(shareData.builderType);
    }
  }, [shareData.builderType]);

  // Protect the route
  useEffect(() => {
    if (!loading && !user) {
      debug.error('Share Builder Page: Not authenticated, redirecting to sign-in');
      router.replace('/signin');
    }
  }, [loading, user, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate input
    if (!builderType) {
      setError('Please select your builder');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Save to context
      updateShareData({ builderType });
      
      // Navigate based on return parameter and selection
      if (returnToConfirm) {
        router.push('/snags/share/confirm');
      } else if (builderType === 'other') {
        router.push('/snags/share/builder-name');
      } else {
        router.push('/snags/share/builder-email');
      }
    } catch (error) {
      debug.error('Error saving builder selection:', error);
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
                  Your builder
                </h1>
              </div>
            </header>
            
            <div className="mb-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <fieldset>
                    <legend className="sr-only">Select your builder</legend>
                    
                    <div className="space-y-3 pr-2 pb-2">
                      {TOP_BUILDERS.map((builder, index) => (
                        <div key={index} className="relative flex items-center py-1">
                          <div className="flex items-center">
                            <input
                              id={`builder-${index}`}
                              name="builder"
                              type="radio"
                              value={builder}
                              checked={builderType === builder}
                              onChange={() => {
                                setBuilderType(builder);
                                setError('');
                              }}
                              className="h-7 w-7 text-primary border-gray-300 focus:ring-primary"
                              disabled={isSubmitting}
                              required
                              aria-labelledby={`builder-label-${index}`}
                            />
                          </div>
                          <div className="ml-3">
                            <label 
                              id={`builder-label-${index}`} 
                              htmlFor={`builder-${index}`} 
                              className="font-medium text-gray-700"
                            >
                              {builder}
                            </label>
                          </div>
                        </div>
                      ))}
                      
                      {/* None of these option */}
                      <div className="relative flex items-center py-1 mt-4">
                        <div className="flex items-center">
                          <input
                            id="builder-other"
                            name="builder"
                            type="radio"
                            value="other"
                            checked={builderType === 'other'}
                            onChange={() => {
                              setBuilderType('other');
                              setError('');
                            }}
                            className="h-7 w-7 text-primary border-gray-300 focus:ring-primary"
                            disabled={isSubmitting}
                            aria-labelledby="builder-other-label"
                          />
                        </div>
                        <div className="ml-3">
                          <label 
                            id="builder-other-label"
                            htmlFor="builder-other" 
                            className="font-medium text-gray-700"
                          >
                            None of these
                          </label>
                        </div>
                      </div>
                    </div>
                  </fieldset>
                  
                  {error && (
                    <p id="builder-error" className="form-error">
                      {error}
                    </p>
                  )}
                </div>
                
                <div className="flex flex-col md:flex-row md:justify-start gap-3 w-full pt-4">
                  <button
                    type="submit"
                    className="btn btn-primary text-base py-2 px-4 w-full md:w-auto"
                    disabled={isSubmitting || !builderType}
                    aria-busy={isSubmitting}
                  >
                    {isSubmitting ? 'Saving...' : 'Continue'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
