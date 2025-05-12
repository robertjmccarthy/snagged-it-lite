'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import Link from 'next/link';
import { debug } from '@/lib/debug';
import { 
  getChecklistItemByOrder, 
  getChecklistItemCount, 
  getUserProgress, 
  updateUserProgress,
  getSnags
} from '@/lib/api/checklist';

interface StepPageProps {
  params: {
    stepIndex: string;
  };
}

export default function OutsideCheckStep({ params }: StepPageProps) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [checklistItem, setChecklistItem] = useState<any>(null);
  const [totalSteps, setTotalSteps] = useState(0);
  const [snags, setSnags] = useState<any[]>([]);
  const [isNavigating, setIsNavigating] = useState(false);
  
  // Hard-coded maximum of 18 steps for outside checks
  const MAX_STEPS = 18;
  
  const stepIndex = parseInt(params.stepIndex, 10);
  const isValidStep = !isNaN(stepIndex) && stepIndex > 0 && stepIndex <= MAX_STEPS;

  // Protect the route and load checklist item
  useEffect(() => {
    async function initializeStep() {
      if (!loading) {
        if (!user) {
          debug.error('Outside Check Step: Not authenticated, redirecting to sign-in');
          router.replace('/signin');
          return;
        }

        if (!isValidStep) {
          debug.error(`Invalid step index: ${stepIndex}, redirecting to outside checks`);
          router.replace('/checks/outside');
          return;
        }

        try {
          // Get the total number of steps
          const count = await getChecklistItemCount('outside');
          debug.log(`Total steps for outside checks: ${count}`);
          setTotalSteps(count);

          // Check if this step exists
          if (stepIndex > count || stepIndex > MAX_STEPS) {
            debug.error(`Step index ${stepIndex} out of range (max: ${Math.min(count, MAX_STEPS)}), redirecting to outside checks`);
            router.replace('/checks/outside');
            return;
          }

          // Check user progress to prevent skipping steps
          const progress = await getUserProgress(user.id, 'outside');
          debug.log('Current user progress:', progress);
          
          // Special case: Allow accessing step 1 even if current_step is 0 (after reset)
          const isAccessingFirstStep = stepIndex === 1;
          const isStartingOver = progress && progress.current_step === 0;
          
          if (progress && stepIndex > progress.current_step && !progress.is_complete && !(isAccessingFirstStep && isStartingOver)) {
            debug.error(`Cannot skip steps (trying to access ${stepIndex}, but current is ${progress.current_step}), redirecting`);
            
            // If current_step is 0, redirect to step 1, otherwise to the current step
            const redirectStep = progress.current_step === 0 ? 1 : progress.current_step;
            router.replace(`/checks/outside/${redirectStep}`);
            return;
          }

          // Get the checklist item for this step
          const item = await getChecklistItemByOrder('outside', stepIndex);
          debug.log(`Checklist item for step ${stepIndex}:`, item);
          
          if (!item) {
            debug.error(`Checklist item not found for step ${stepIndex}, redirecting to outside checks`);
            router.replace('/checks/outside');
            return;
          }
          setChecklistItem(item);

          // Get any existing snags for this item
          const userSnags = await getSnags(user.id, item.id);
          debug.log(`Found ${userSnags.length} snags for this item`);
          setSnags(userSnags);

          // Update user progress to this step
          if (!progress || stepIndex > progress.current_step) {
            debug.log(`Updating user progress to step ${stepIndex}`);
            await updateUserProgress(user.id, 'outside', stepIndex, false);
          }

          setIsLoading(false);
        } catch (error) {
          debug.error('Error initializing step:', error);
          setIsLoading(false);
        }
      }
    }

    initializeStep();
  }, [user, loading, router, stepIndex, isValidStep]);

  const handleContinue = async () => {
    if (!user || isNavigating) return;
    
    setIsNavigating(true);
    setIsLoading(true); // Show full-page loading state
    
    try {
      debug.log(`Continue button clicked at step ${stepIndex}, total steps: ${totalSteps}`);
      
      // Mark this step as complete in user progress
      const isLastStep = stepIndex === totalSteps || stepIndex === MAX_STEPS;
      
      // Update progress in Supabase
      try {
        if (isLastStep) {
          // If this is the last step, mark the entire section as complete
          debug.log('This is the last step, marking outside checks as complete');
          await updateUserProgress(user.id, 'outside', stepIndex, true);
        } else {
          // Otherwise, update progress to the next step
          debug.log(`Moving to next step: ${stepIndex + 1}`);
          await updateUserProgress(user.id, 'outside', stepIndex + 1, false);
        }
        
        // Navigate after successful progress update
        if (isLastStep) {
          // Redirect to dashboard
          debug.log('Redirecting to dashboard');
          router.push('/dashboard');
        } else {
          // Redirect to the next step
          debug.log(`Navigating to step ${stepIndex + 1}`);
          router.push(`/checks/outside/${stepIndex + 1}`);
        }
      } catch (progressError) {
        // Log the error and show a user-friendly message
        debug.error('Error updating progress:', progressError);
        alert('There was an issue saving your progress. Please try again.');
        setIsNavigating(false);
        setIsLoading(false);
      }
    } catch (error) {
      debug.error('Error in continue handler:', error);
      setIsNavigating(false);
      setIsLoading(false);
    }
  };

  const handleAddSnag = () => {
    // Navigate to the snag creation page for this step
    debug.log(`Navigating to add snag for step ${stepIndex}`);
    setIsNavigating(true);
    setIsLoading(true); // Show full-page loading state
    router.push(`/checks/outside/${stepIndex}/snags/new`);
  };

  if (loading || isLoading || isNavigating) {
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
                  Check {stepIndex} of {totalSteps}
                </p>
                <h1 className="text-2xl md:text-3xl font-bold">
                  {checklistItem && checklistItem.friendly_text}
                </h1>
              </div>
              
              {checklistItem && (
                <p className="text-gray-dark">Look at all the bricks on the house. Make sure there are no big chips or splashes of mortar.</p>
              )}
            </header>
            
            <div className="mb-8">
              {/* Snag details removed as requested */}
              
              <div className="flex flex-col md:flex-row md:justify-between gap-3 w-full">
                <button
                  onClick={handleAddSnag}
                  className="btn btn-primary text-base py-2 px-4 w-full md:w-auto order-1"
                  aria-label={snags.length > 0 ? "Add another snag" : "Add a snag"}
                >
                  {snags.length > 0 ? "Add another snag" : "Add a snag"}
                </button>
                
                <button
                  onClick={handleContinue}
                  className="btn btn-outline text-base py-2 px-4 w-full md:w-auto order-2"
                  aria-label={stepIndex === totalSteps ? "Finish outside checks" : "Continue with no snags"}
                >
                  {stepIndex === totalSteps ? "Finish outside checks" : "Continue to next check"}
                </button>
              </div>
            </div>
            
            {snags.length > 0 && (
              <div className="mt-8 pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-dark">
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1 text-error">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                    You've found {snags.length} {snags.length === 1 ? 'snag' : 'snags'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
