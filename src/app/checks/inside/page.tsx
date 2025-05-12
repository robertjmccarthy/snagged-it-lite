'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { 
  getChecklistItemCount,
  getUserProgress,
  getSnagCountForCategory
} from '@/lib/api/checklist';
import { debug } from '@/lib/debug';
import { Layout, Section, Card, Button } from '@/components';

function InsideChecksContent() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState<any>(null);
  const [totalSteps, setTotalSteps] = useState(0);
  const [snagCount, setSnagCount] = useState(0);
  const [isStarting, setIsStarting] = useState(false);

  // Protect the route and load user progress
  useEffect(() => {
    async function initializeChecklist() {
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

    initializeChecklist();
  }, [user, loading, router]);

  const handleStartChecking = async () => {
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
      <div className="flex flex-1 items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="py-12 animate-fade-in">
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
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
        
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <header className="mb-8">
              <h1 className="text-2xl md:text-3xl font-bold mb-4">Snag inside your home</h1>
              
              <p className="text-gray-dark mb-4">
                As you check the inside of your home, add photos and notes to any snags you find.
              </p>
              
              <p className="text-gray-dark mb-6">
                There are {totalSteps} checks to complete.
              </p>
              
              <div className="bg-gray-100 p-4 rounded-lg mb-6">
                <h2 className="text-lg font-medium mb-2">
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
            </header>
            
            <div className="flex">
              <button 
                onClick={handleStartChecking}
                disabled={isStarting}
                className="menu-item bg-primary hover:bg-primary-hover text-foreground"
                aria-label="Continue to inside checks"
              >
                {isStarting ? "Loading..." : "Continue"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main component with Suspense boundary
export default function InsideChecks() {
  return (
    <Layout>
      <div className="fixed inset-0 bg-[#BBF2D7] -z-10"></div>
      <style jsx global>{`
        body {
          background-color: #BBF2D7;
        }
      `}</style>
      <Suspense fallback={
        <div className="flex flex-1 items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      }>
        <InsideChecksContent />
      </Suspense>
    </Layout>
  );
}
