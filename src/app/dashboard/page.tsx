'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { getChecklistItemCount, getUserProgress, getSnagCountForCategory } from '@/lib/api/checklist';
import { debug } from '@/lib/debug';
import { Layout, Section, Card, Button } from '@/components';
import ResetProgress from '@/components/ResetProgress';

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
  }, [localLoading, user]);
  
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
              {showCompletionBox() 
                ? "You're all done 🎉" 
                : "Hello homeowner 👋"
              }
            </h1>

          </header>
          
          {/* Progress Cards */}
          <div className="space-y-6 mb-10">
            {/* Show completion box when all checks are completed */}
            {showCompletionBox() && (
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                {outsideSnagCount + insideSnagCount > 0 ? (
                  /* Content for users with snags */
                  <>
                    <div className="mb-4">
                      <h2 className="text-xl font-semibold mb-2">There are {outsideSnagCount + insideSnagCount} snags on your list</h2>
                      <p className="text-gray-dark mb-4">
                        Share your list with your builder so they can get onto sorting the snags, and you can enjoy your new home.
                      </p>
                    </div>
                    
                    <div className="mb-6"></div>
                    
                    <div className="flex">
                      <Link href="/snags/share">
                        <button 
                          className="menu-item bg-primary hover:bg-primary-hover"
                          aria-label="Share your snag list with your builder"
                        >
                          Share your snag list
                        </button>
                      </Link>
                    </div>
                  </>
                ) : (
                  /* Content for users with no snags */
                  <>
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
                  </>
                )}
              </div>
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
