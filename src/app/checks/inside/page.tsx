'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { 
  getChecklistItemCount,
  getUserProgress,
  getSnagCountForCategory,
  updateUserProgress
} from '@/lib/api/checklist';
import { debug } from '@/lib/debug';
import { Layout, Section, Card, Button } from '@/components';

export default function InsideChecksPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState<any>(null);
  const [totalSteps, setTotalSteps] = useState(0);
  const [snagCount, setSnagCount] = useState(0);
  const [isStarting, setIsStarting] = useState(false);

  // Protect the route and load user progress
  useEffect(() => {
    async function initializePage() {
      if (!loading) {
        if (!user) {
          debug.error('Inside Checks: Not authenticated, redirecting to sign-in');
          router.replace('/signin');
          return;
        }

        try {
          // Get total number of steps
          const count = await getChecklistItemCount('inside');
          debug.log(`Total steps for inside checks: ${count}`);
          setTotalSteps(count);

          // Get user progress
          const userProgress = await getUserProgress(user.id, 'inside');
          debug.log('User progress for inside checks:', userProgress);
          setProgress(userProgress);

          // Get snag count
          const snagsCount = await getSnagCountForCategory(user.id, 'inside');
          debug.log(`Snag count for inside checks: ${snagsCount}`);
          setSnagCount(snagsCount);

          setIsLoading(false);
        } catch (error) {
          debug.error('Error initializing inside checks page:', error);
          setIsLoading(false);
        }
      }
    }

    initializePage();
  }, [user, loading, router]);

  const handleStart = async () => {
    if (!user || isStarting) return;
    
    setIsStarting(true);
    try {
      // If user has progress, navigate to their current step
      if (progress && !progress.is_complete) {
        debug.log(`Resuming inside checks at step ${progress.current_step}`);
        router.push(`/checks/inside/${progress.current_step}`);
      } else {
        // Otherwise, start from step 1
        debug.log('Starting inside checks from step 1');
        router.push('/checks/inside/1');
      }
    } catch (error) {
      debug.error('Error starting inside checks:', error);
      setIsStarting(false);
    }
  };

  if (loading || isLoading) {
    return (
      <Layout>
        <div className="flex flex-1 items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Section background="light" spacing="md" className="animate-fade-in">
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
          
          <Card className="p-6 md:p-8">
            <header className="mb-8">
              <div className="flex items-center mb-4">
                <div className="bg-primary/10 p-2 rounded-full mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-primary">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                  </svg>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold">Inside Checks</h1>
              </div>
              <p className="text-gray-dark">
                Inspect the interior of your home and document any issues you find. You'll go through a series of {totalSteps} checks, one by one, and can record any problems along the way.
              </p>
            </header>

            <div className="space-y-6">
              {progress && !progress.is_complete ? (
                <div className="bg-primary/10 p-4 rounded-lg border border-primary/20 mb-6">
                  <h2 className="font-semibold mb-2 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-primary">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                    </svg>
                    Continue your inspection
                  </h2>
                  <p>
                    You're on step {progress.current_step} of {totalSteps}.
                    {snagCount > 0 && ` You've recorded ${snagCount} ${snagCount === 1 ? 'snag' : 'snags'} so far.`}
                  </p>
                  <Button
                    variant="primary"
                    onClick={handleStart}
                    disabled={isStarting}
                    fullWidth
                    size="lg"
                    className="mt-4"
                    aria-label="Continue checking the inside"
                  >
                    {isStarting ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Loading...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        Continue checking the inside
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 ml-2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                      </span>
                    )}
                  </Button>
                </div>
              ) : progress && progress.is_complete ? (
                <div className="bg-success/10 p-4 rounded-lg border border-success/20 mb-6">
                  <h2 className="font-semibold mb-2 flex items-center text-success">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Inspection complete!
                  </h2>
                  <p>
                    You've completed all {totalSteps} steps.
                    {snagCount > 0 ? ` You've recorded ${snagCount} ${snagCount === 1 ? 'snag' : 'snags'}.` : ' No snags were recorded.'}
                  </p>
                  <div className="mt-4 space-y-3">
                    <Link href="/snags/summary">
                      <Button
                        variant="primary"
                        fullWidth
                        size="lg"
                        className="flex items-center justify-center"
                      >
                      <span className="flex items-center">
                        View all snags
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 ml-2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                        </svg>
                      </span>
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      onClick={handleStart}
                      fullWidth
                      size="lg"
                    >
                      Start again
                    </Button>
                  </div>
                </div>
              ) : null}
              
              <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 mb-6">
                <h2 className="font-semibold mb-2 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-primary">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                  </svg>
                  What you'll check inside:
                </h2>
                <ul className="list-disc pl-8 space-y-1 text-gray-dark">
                  <li>Walls, ceilings, and paintwork</li>
                  <li>Windows and doors</li>
                  <li>Floors and skirting boards</li>
                  <li>Plumbing and fixtures</li>
                  <li>Kitchen and bathroom fittings</li>
                  <li>Loft insulation and access</li>
                </ul>
              </div>
              
              {/* Start checking button */}
              {!progress && (
                <div className="bg-gray-50 border border-gray-100 rounded-lg p-8 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-primary">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-lg font-medium mb-2">Ready to start your inside inspection?</h3>
                  <p className="text-gray-dark mb-6">We'll guide you through each check step-by-step</p>
                  <Button 
                    variant="primary"
                    onClick={handleStart}
                    disabled={isStarting}
                    size="lg"
                    aria-label="Start checking the inside"
                  >
                    {isStarting ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Loading...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        Start checking the inside
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 ml-2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                      </span>
                    )}
                  </Button>
                </div>
              )}
            </div>
            
            <div className="flex justify-between">
              <Link href="/dashboard">
                <Button 
                  variant="outline"
                  aria-label="Go back to dashboard"
                >
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                  </svg>
                  Back to dashboard
                </span>
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </Section>
    </Layout>
  );
}
