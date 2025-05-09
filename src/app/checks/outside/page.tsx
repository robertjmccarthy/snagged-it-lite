'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import Link from 'next/link';
import { updateUserProgress, getChecklistItemCount } from '@/lib/api/checklist';

export default function OutsideChecks() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [totalSteps, setTotalSteps] = useState(0);
  const [startingCheck, setStartingCheck] = useState(false);

  // Protect the route - redirect to sign in if not authenticated
  useEffect(() => {
    async function initializeChecklist() {
      if (!loading && user) {
        try {
          // Get the total number of steps in the outside category
          const count = await getChecklistItemCount('outside');
          setTotalSteps(count);
          setIsLoading(false);
        } catch (error) {
          console.error('Error initializing checklist:', error);
          setIsLoading(false);
        }
      } else if (!loading && !user) {
        console.log('Outside Checks: Not authenticated, redirecting to sign-in');
        router.replace('/signin');
      }
    }

    initializeChecklist();
  }, [user, loading, router]);

  const handleStartChecking = async () => {
    if (!user) return;
    
    setStartingCheck(true);
    try {
      // Initialize or reset user progress for outside checks
      await updateUserProgress(user.id, 'outside', 1, false);
      // Navigate to the first step
      router.push('/checks/outside/1');
    } catch (error) {
      console.error('Error starting outside checks:', error);
      setStartingCheck(false);
    }
  };

  if (loading || isLoading) {
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
    <main className="flex min-h-screen flex-col">
      <Navigation isAuthenticated={!!user} />
      
      <div className="flex flex-1 flex-col p-6 animate-fade-in">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-6 flex items-center">
            <Link 
              href="/dashboard" 
              className="text-gray-dark hover:text-primary transition-colors flex items-center"
              aria-label="Back to dashboard"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Back
            </Link>
          </div>
          
          <div className="bg-white shadow-sm rounded-xl p-6 md:p-8 border border-gray-100">
            <header className="mb-8">
              <div className="flex items-center mb-4">
                <div className="bg-primary/10 p-2 rounded-full mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-primary">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                  </svg>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold">Outside Checks</h1>
              </div>
              <p className="text-gray-dark">
                Inspect the exterior of your home and document any issues you find. You'll go through a series of {totalSteps} checks, one by one, and can record any problems along the way.
              </p>
            </header>
            
            <div className="mb-8">
              <div className="bg-accent p-4 rounded-lg border border-primary/10 mb-6">
                <h2 className="font-semibold mb-2 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-primary">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                  </svg>
                  What you'll check outside:
                </h2>
                <ul className="list-disc pl-8 space-y-1 text-gray-dark">
                  <li>Walls and brickwork</li>
                  <li>Roof, gutters, and downpipes</li>
                  <li>Windows and doors</li>
                  <li>Garden and landscaping</li>
                  <li>Driveways and paths</li>
                  <li>External fixtures and fittings</li>
                </ul>
              </div>
              
              {/* Start checking button */}
              <div className="bg-gray-50 border border-gray-100 rounded-lg p-8 text-center">
                <div className="flex justify-center mb-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-primary">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-lg font-medium mb-2">Ready to start your outside inspection?</h3>
                <p className="text-gray-dark mb-6">We'll guide you through each check step-by-step</p>
                <button 
                  onClick={handleStartChecking}
                  disabled={startingCheck}
                  className="btn btn-primary rounded-pill px-8 py-3 text-lg"
                  aria-label="Start checking the outside"
                >
                  {startingCheck ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      Start checking the outside
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 ml-2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </span>
                  )}
                </button>
              </div>
            </div>
            
            <div className="flex justify-between">
              <Link 
                href="/dashboard" 
                className="btn btn-outline rounded-pill px-6 py-2"
                aria-label="Go back to dashboard"
              >
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                  </svg>
                  Back to dashboard
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
