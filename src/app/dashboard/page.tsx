'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import { getChecklistItemCount, getUserProgress, getSnagCountForCategory, getAllUserSnags } from '@/lib/api/checklist';
import { getUserShares } from '@/lib/api/share';
import { debug } from '@/lib/debug';
import { Layout, Section, Card, Button } from '@/components';
import ResetProgress from '@/components/ResetProgress';
import { supabase } from '@/lib/supabase/client';
import PdfDownloadButton from '@/components/PdfDownloadButton';

// Component to handle the actual dashboard logic
function DashboardContent() {
  const router = useRouter();
  const { user, loading, error, checkAuth } = useAuth();
  const [localLoading, setLocalLoading] = useState(true);
  const [outsideProgress, setOutsideProgress] = useState<any>(null);
  const [insideProgress, setInsideProgress] = useState<any>(null);
  const [outsideTotal, setOutsideTotal] = useState(0);
  const [insideTotal, setInsideTotal] = useState(0);
  const [outsideSnagCount, setOutsideSnagCount] = useState(0);
  const [insideSnagCount, setInsideSnagCount] = useState(0);
  const [isLoadingProgress, setIsLoadingProgress] = useState(true);
  const [userShares, setUserShares] = useState<any[]>([]);
  const [latestShare, setLatestShare] = useState<any>(null);
  const [userSnags, setUserSnags] = useState<any[]>([]);
  const [isLoadingSnags, setIsLoadingSnags] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      debug.log('Dashboard: Checking authentication status');
      
      if (loading) {
        // Wait for the initial auth state to resolve
        return;
      }
      
      // Check if user is authenticated using our AuthContext
      if (!user) {
        debug.log('Dashboard: Not authenticated, redirecting to sign-in');
        window.location.replace('/signin');
        return;
      }
      
      debug.log('Dashboard: User authenticated:', user?.email);
      setLocalLoading(false);
    };

    verifyAuth();
  }, [loading, user]);
  
  // Define the loadProgressData function outside useEffect so it can be reused
  const loadProgressData = async () => {
    if (localLoading || !user) return;
    
    try {
      setIsLoadingProgress(true);
      debug.log('Dashboard: Loading progress data...');
      
      // Get total steps for outside and inside
      try {
        const [outsideTotalSteps, insideTotalSteps] = await Promise.all([
          getChecklistItemCount('outside'),
          getChecklistItemCount('inside')
        ]);
        
        setOutsideTotal(outsideTotalSteps);
        setInsideTotal(insideTotalSteps);
      } catch (countError) {
        debug.error('Error fetching checklist item counts:', countError);
        // Continue with other data fetching even if this fails
      }
      
      // Get user progress for outside and inside
      try {
        const [outsideUserProgress, insideUserProgress] = await Promise.all([
          getUserProgress(user.id, 'outside'),
          getUserProgress(user.id, 'inside')
        ]);
        
        debug.log('Dashboard: Outside progress:', outsideUserProgress);
        debug.log('Dashboard: Inside progress:', insideUserProgress);
        
        setOutsideProgress(outsideUserProgress);
        setInsideProgress(insideUserProgress);
      } catch (progressError) {
        debug.error('Error fetching user progress:', progressError);
        // Continue with other data fetching even if this fails
      }
      
      // Get snag counts for outside and inside
      try {
        const [outsideSnags, insideSnags] = await Promise.all([
          getSnagCountForCategory(user.id, 'outside'),
          getSnagCountForCategory(user.id, 'inside')
        ]);
        
        setOutsideSnagCount(outsideSnags);
        setInsideSnagCount(insideSnags);
      } catch (snagCountError) {
        debug.error('Error fetching snag counts:', snagCountError);
        // Continue even if this fails
      }
      
      setIsLoadingProgress(false);
    } catch (error) {
      debug.error('Error in loadProgressData:', error);
      setIsLoadingProgress(false);
    }
  };
  
  // Load user progress data on initial mount and when user changes
  useEffect(() => {
    loadProgressData();
    if (user && !localLoading) {
      loadUserShares();
      loadUserSnags();
    }
  }, [localLoading, user]);
  
  // Load user snags data
  const loadUserSnags = async () => {
    if (!user) return;
    
    try {
      setIsLoadingSnags(true);
      debug.log('Dashboard: Loading user snags data...');
      const snags = await getAllUserSnags(user.id);
      setUserSnags(snags);
      debug.log('Dashboard: User snags loaded:', snags.length);
      setIsLoadingSnags(false);
    } catch (error) {
      debug.error('Error loading user snags:', error);
      setIsLoadingSnags(false);
    }
  };
  
  // Load user shares data
  const loadUserShares = async () => {
    if (!user) return;
    
    try {
      debug.log('Dashboard: Loading user shares data...');
      const shares = await getUserShares(user.id);
      setUserShares(shares);
      
      // Reset latest share by default
      setLatestShare(null);
      
      // Get the active snag list with all relevant details
      const { data: activeSnagList, error: snagListError } = await supabase
        .from('snag_lists')
        .select('id, share_id, shared_at')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();
        
      if (snagListError) {
        debug.error('Error fetching active snag list:', snagListError);
        return;
      }
      
      debug.log('Active snag list:', activeSnagList);
      
      // If no active snag list or it doesn't have a share_id, don't show shared version
      if (!activeSnagList || !activeSnagList.share_id) {
        debug.log('Active snag list has no associated share');
        return;
      }
      
      // Only set the latest share if it's associated with the current active snag list
      // AND it has been paid
      const paidShares = shares.filter(
        share => share.status === 'paid' && share.id === activeSnagList.share_id
      );
      
      if (paidShares.length > 0) {
        debug.log('Found paid share for current active snag list:', paidShares[0]);
        setLatestShare(paidShares[0]); // The share associated with the current active snag list
      } else {
        debug.log('No paid shares found for current active snag list');
      }
      
      debug.log('Dashboard: User shares loaded:', shares.length);
    } catch (error) {
      debug.error('Error loading user shares:', error);
    }
  };
  
  // Use a combination of approaches to ensure data is refreshed when returning to the dashboard
  useEffect(() => {
    if (!localLoading && user) {
      // Function to refresh data
      const refreshData = () => {
        debug.log('Dashboard: Refreshing data...');
        loadProgressData();
      };
      
      // Refresh when the page becomes visible (handles tab switching and app resuming)
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          refreshData();
        }
      };
      
      // Refresh when the window regains focus (handles navigation back to this page)
      const handleFocus = () => {
        refreshData();
      };
      
      // Add event listeners
      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('focus', handleFocus);
      
      // Initial refresh
      refreshData();
      
      // Clean up event listeners when component unmounts
      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('focus', handleFocus);
      };
    }
  }, [localLoading, user]);

  if (loading || localLoading || isLoadingProgress) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Extract user's first name from metadata or email
  const getUserFirstName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name.split(' ')[0];
    } else if (user?.email) {
      // Fallback to using the part before @ in email
      return user.email.split('@')[0];
    }
    return 'there'; // Default fallback
  };

  // Helper function to determine the next step URL for outside checks
  const getOutsideNextStepUrl = () => {
    if (!outsideProgress || outsideProgress.is_complete) {
      return '/checks/outside'; // Go to the outside checks overview page
    }
    
    // If user has started but not completed, they can continue from current step
    return `/checks/outside/${outsideProgress.current_step}`; // Continue from current step
  };
  
  // Helper function to determine the next step URL for inside checks
  const getInsideNextStepUrl = () => {
    if (!insideProgress || insideProgress.is_complete) {
      return '/checks/inside'; // Go to the inside checks overview page
    }
    
    // If user has started but not completed, they can continue from current step
    return `/checks/inside/${insideProgress.current_step}`; // Continue from current step
  };
  
  // Inside checks are now always enabled regardless of outside check progress
  // This function is kept for backward compatibility but always returns true
  const isInsideEnabled = () => {
    return true;
  };
  
  // Helper function to get outside progress text
  const getOutsideProgressText = () => {
    if (!outsideProgress) {
      return `0 of ${outsideTotal} complete`;
    }
    
    if (outsideProgress.is_complete) {
      return `${outsideTotal} of ${outsideTotal} complete`;
    }
    
    // Ensure we don't display negative numbers when current_step is 0
    const completedSteps = Math.max(0, outsideProgress.current_step - 1);
    return `${completedSteps} of ${outsideTotal} complete`;
  };
  
  // Helper function to get inside progress text
  const getInsideProgressText = () => {
    if (!insideProgress) {
      return `0 of ${insideTotal} complete`;
    }
    
    if (insideProgress.is_complete) {
      return `${insideTotal} of ${insideTotal} complete`;
    }
    
    // Ensure we don't display negative numbers when current_step is 0
    const completedSteps = Math.max(0, insideProgress.current_step - 1);
    return `${completedSteps} of ${insideTotal} complete`;
  };
  
  // Helper function to get outside button text
  const getOutsideButtonText = () => {
    if (!outsideProgress || !outsideProgress.current_step) {
      return 'Start checks';
    }
    
    if (outsideProgress.is_complete) {
      return 'Checks done';
    }
    
    return 'Continue checks';
  };
  
  // Helper function to get inside button text
  const getInsideButtonText = () => {
    if (!insideProgress || !insideProgress.current_step) {
      return 'Start checks';
    }
    
    if (insideProgress.is_complete) {
      return 'Checks done';
    }
    
    return 'Continue checks';
  };
  
  // Determine if we should show the completion box
  const showCompletionBox = () => {
    // Get the completion status of both outside and inside checks
    const outsideComplete = outsideProgress && outsideProgress.is_complete;
    const insideComplete = insideProgress && insideProgress.is_complete;
    
    // Only show the completion box when both Outside and Inside checks are complete
    return outsideComplete && insideComplete;
  };
  
  // No longer showing the View Snag List button as per requirements

  return (
    <Section background="light" spacing="md" className="animate-fade-in bg-transparent">
      <div className="container mx-auto max-w-4xl">
          <header className="text-left mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              {latestShare && (outsideSnagCount > 0 || insideSnagCount > 0)
                ? "Your snag list" 
                : showCompletionBox() 
                  ? "You're done snagging 🎉" 
                  : "Hello homeowner 👋"
              }
            </h1>
          </header>
          
          {/* Progress Cards */}
          <div className="space-y-6 mb-10">
            {/* Show completion box when all checks are completed */}
            {showCompletionBox() && (
              <>
                {latestShare ? (
                  /* Content for users who have shared their snag list */
                  <>
                    {/* Details Box */}
                    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                      <h2 className="text-xl font-semibold mb-4">Details</h2>
                      <div className="space-y-4">
                        {/* Home Address */}
                        <div className="flex justify-between items-start border-b border-gray-200 pb-3">
                          <div>
                            <h3 className="text-sm font-medium text-gray-500 mb-0">Home address</h3>
                            <p className="text-base text-gray-900 whitespace-pre-line">{latestShare.address}</p>
                          </div>
                        </div>
                        
                        {/* Builder */}
                        <div className="flex justify-between items-start border-b border-gray-200 pb-3">
                          <div>
                            <h3 className="text-sm font-medium text-gray-500 mb-0">Builder</h3>
                            <p className="text-base text-gray-900">{latestShare.builder_name}</p>
                          </div>
                        </div>
                        
                        {/* Builder Email section removed */}
                        
                        {/* Shared On */}
                        <div className="flex justify-between items-start border-b border-gray-200 pb-3">
                          <div>
                            <h3 className="text-sm font-medium text-gray-500 mb-0">Complete on</h3>
                            <p className="text-base text-gray-900">{new Date(latestShare.updated_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        
                        {/* Snags Count */}
                        <div className="flex justify-between items-start pb-3">
                          <div>
                            <h3 className="text-sm font-medium text-gray-500 mb-0">Snags</h3>
                            <p className="text-base text-gray-900">{outsideSnagCount + insideSnagCount === 1 ? "1 snag recorded" : `${outsideSnagCount + insideSnagCount} snags recorded`}</p>
                          </div>
                        </div>
                        
                        {/* Download PDF Button */}
                        {userSnags.length > 0 && (
                          <div className="flex pt-3 border-t border-gray-200">
                            <PdfDownloadButton 
                              snags={userSnags} 
                              shareDetails={latestShare}
                              className="menu-item"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Start New Snag List Box moved up to replace the removed Recorded Snags Box */}
                    
                    {/* Start New Snag List Box */}
                    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mt-6">
                      <h2 className="text-xl font-semibold mb-4">Start a new snag list</h2>
                      <p className="text-gray-dark mb-4">
                        Ready to create a new snag list? Click the button below to reset your progress and start fresh.
                      </p>
                      <div className="flex">
                        <ResetProgress />
                      </div>
                    </div>
                  </>
                ) : outsideSnagCount + insideSnagCount > 0 ? (
                  /* Content for users with snags but not shared yet */
                  <>
                    {/* Snag count box - styled like industry standards section */}
                    <div className="bg-dark-green text-white rounded-2xl shadow-lg overflow-hidden mb-6">
                      <div className="py-8 px-6">
                        <div className="flex items-center justify-start">
                          <div className="bg-primary rounded-full p-2 mr-3 flex-shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#333333" className="w-5 h-5" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
                            </svg>
                          </div>
                          <h2 className="text-xl md:text-2xl font-bold leading-tight my-auto">
                            {outsideSnagCount + insideSnagCount === 1 
                              ? "There is 1 snag on your list" 
                              : `There are ${outsideSnagCount + insideSnagCount} snags on your list`
                            }
                          </h2>
                        </div>
                      </div>
                    </div>
                    
                    {/* Next steps box */}
                    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold mb-2">Next steps</h3>
                        <p className="text-gray-dark mb-4">
                          You're just a few steps away from having an industry aligned snag list to share with your builder.
                        </p>
                        <ul className="list-disc pl-5 mb-4 text-gray-dark space-y-1">
                          <li>Enter your details</li>
                          <li>Enter your builder's details</li>
                          <li>Pay £19.99 and download your snag list</li>
                          <li>Send your snag list to your builder</li>
                        </ul>
                      </div>
                      
                      <div className="mb-6"></div>
                      
                      <div className="flex">
                        <Link href="/snags/share">
                          <button 
                            className="menu-item bg-primary hover:bg-primary-hover"
                            aria-label="Share your snag list with your builder"
                          >
                            Download your snag list
                          </button>
                        </Link>
                      </div>
                    </div>
                  </>
                ) : (
                  /* Content for users with no snags */
                  <>
                    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                      <div className="mb-4">
                        <h2 className="text-xl font-semibold mb-2">You don't have any snags. Amazing!</h2>
                        <p className="text-gray-dark mb-4">
                          Enjoy living in your new home, and if you do find any snags, start a new snag list.
                        </p>
                      </div>
                      
                      <div className="mb-6"></div>
                      
                      <div className="flex">
                        <ResetProgress />
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
            
            {/* Only show check boxes if not all checks are completed */}
            {!showCompletionBox() && (
              <>
                {/* Outside Checks Card */}
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                  <div className="mb-4">
                    <p className="text-gray-dark text-sm mb-2">
                      {getOutsideProgressText()}
                    </p>
                    <h2 className="text-xl font-semibold mb-2">Snag outside your home</h2>
                    <p className="text-gray-dark mb-2">Check the brickwork, external paintwork, drives and pathways, the roof, and any garages and gardens.</p>
                  </div>
                  
                  <div className="mb-6"></div>
                  
                  <div className="flex">
                    <Link href={getOutsideNextStepUrl()} onClick={e => (outsideProgress && outsideProgress.is_complete) && e.preventDefault()}>
                      <button 
                        className={`menu-item ${outsideProgress && outsideProgress.is_complete ? 'bg-gray-lighter' : 'bg-primary hover:bg-primary-hover'}`}
                        disabled={outsideProgress && outsideProgress.is_complete}
                        aria-label={getOutsideButtonText()}
                      >
                        {getOutsideButtonText()}
                      </button>
                    </Link>
                  </div>
                </div>
                
                {/* Inside Checks Card */}
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                  <div className="mb-4">
                    <p className="text-gray-dark text-sm mb-2">
                      {getInsideProgressText()}
                    </p>
                    <h2 className="text-xl font-semibold mb-2">Snag inside your home</h2>
                    <p className="text-gray-dark mb-2">Check the ceilings and walls, the windows and doors, the floors, pipes, radiators, and the loft space.</p>
                  </div>
                  
                  <div className="mb-6"></div>
                  
                  <div className="flex">
                    <Link href={getInsideNextStepUrl()} onClick={e => (insideProgress && insideProgress.is_complete) && e.preventDefault()}>
                      <button 
                        className={`menu-item ${insideProgress && insideProgress.is_complete ? 'bg-gray-lighter' : 'bg-primary hover:bg-primary-hover'}`}
                        disabled={insideProgress && insideProgress.is_complete}
                        aria-label={getInsideButtonText()}
                      >
                        {getInsideButtonText()}
                      </button>
                    </Link>
                  </div>
                </div>
              </>
            )}
            
            {/* View Snag List button has been removed as per requirements */}
          </div>
          
          {/* How It Works Section removed */}
      </div>
    </Section>
  );
}

// Loading fallback for the Suspense boundary
function DashboardLoading() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
}

// Main component with Suspense boundary
export default function Dashboard() {
  const { user } = useAuth();
  
  return (
    <Layout>
      <div className="fixed inset-0 bg-[#BBF2D7] -z-10"></div>
      <style jsx global>{`
        body {
          background-color: #BBF2D7;
        }
      `}</style>
      <Suspense fallback={<DashboardLoading />}>
        <DashboardContent />
      </Suspense>
    </Layout>
  );
}
