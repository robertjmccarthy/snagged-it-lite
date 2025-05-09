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
  const [navigating, setNavigating] = useState(false);
  
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
          
          if (progress && stepIndex > progress.current_step && !progress.is_complete) {
            debug.error(`Cannot skip steps (trying to access ${stepIndex}, but current is ${progress.current_step}), redirecting`);
            router.replace(`/checks/outside/${progress.current_step}`);
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
    if (!user || navigating) return;
    
    setNavigating(true);
    try {
      debug.log(`Continue button clicked at step ${stepIndex}, total steps: ${totalSteps}`);
      
      // If this is the last step, mark the outside checks as complete
      if (stepIndex === MAX_STEPS || stepIndex === totalSteps) {
        debug.log('This is the last step, marking outside checks as complete');
        await updateUserProgress(user.id, 'outside', stepIndex, true);
        router.push('/checks/inside'); // Navigate directly to inside checks landing page
      } else {
        // Otherwise, go to the next step
        debug.log(`Moving to next step: ${stepIndex + 1}`);
        await updateUserProgress(user.id, 'outside', stepIndex + 1, false);
        router.push(`/checks/outside/${stepIndex + 1}`);
      }
    } catch (error) {
      debug.error('Error navigating to next step:', error);
      setNavigating(false);
    }
  };

  const handleAddSnag = () => {
    if (!user || !checklistItem) return;
    router.push(`/checks/outside/${stepIndex}/snags/new`);
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
              href="/checks/outside" 
              className="text-gray-dark hover:text-primary transition-colors flex items-center"
              aria-label="Back to outside checks"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Back to outside checks
            </Link>
          </div>
          
          <div className="bg-white shadow-sm rounded-xl p-6 md:p-8 border border-gray-100">
            <header className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="bg-primary/10 p-2 rounded-full mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-primary">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold">Outside Check</h1>
                </div>
                <div className="text-sm text-gray-dark bg-gray-50 px-3 py-1 rounded-full">
                  Step {stepIndex} of {totalSteps}
                </div>
              </div>
              
              {checklistItem && (
                <div className="bg-accent p-5 rounded-lg border border-primary/10">
                  <h2 className="text-xl font-semibold mb-2">{checklistItem.friendly_text}</h2>
                  <p className="text-gray-dark text-sm italic">Original: {checklistItem.original_text}</p>
                </div>
              )}
            </header>
            
            <div className="mb-8">
              {snags.length > 0 ? (
                <div className="mb-6">
                  <h3 className="font-semibold mb-3 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-error">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                    {snags.length} {snags.length === 1 ? 'Snag' : 'Snags'} Recorded
                  </h3>
                  
                  <div className="space-y-4">
                    {snags.map((snag) => (
                      <div key={snag.id} className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                        {snag.photo_url && (
                          <div className="mb-3">
                            <img 
                              src={snag.photo_url} 
                              alt="Snag photo" 
                              className="rounded-lg w-full max-h-48 object-cover"
                            />
                          </div>
                        )}
                        {snag.note && (
                          <p className="text-gray-dark">{snag.note}</p>
                        )}
                        <div className="text-xs text-gray-dark mt-2">
                          Recorded on {new Date(snag.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
              
              <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
                <button
                  onClick={handleAddSnag}
                  className="btn btn-outline rounded-pill px-6 py-2 order-2 sm:order-1"
                  aria-label={snags.length > 0 ? "Add another snag" : "Add a snag"}
                >
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    {snags.length > 0 ? "Add another snag" : "Add a snag"}
                  </span>
                </button>
                
                <button
                  onClick={handleContinue}
                  disabled={navigating}
                  className="btn btn-primary rounded-pill px-6 py-2 order-1 sm:order-2"
                  aria-label={stepIndex === totalSteps ? "Finish outside checks" : "Continue with no snags"}
                >
                  {navigating ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      {stepIndex === totalSteps ? "Finish outside checks" : "Continue with no snags"}
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 ml-2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </span>
                  )}
                </button>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-dark">
                {snags.length > 0 ? (
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1 text-error">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                    {snags.length} {snags.length === 1 ? 'snag' : 'snags'} recorded for this check
                  </span>
                ) : (
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1 text-success">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    No snags recorded for this check
                  </span>
                )}
              </div>
              
              {stepIndex > 1 && (
                <Link 
                  href={`/checks/outside/${stepIndex - 1}`}
                  className="text-primary hover:text-primary-hover transition-colors flex items-center text-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                  </svg>
                  Previous check
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
