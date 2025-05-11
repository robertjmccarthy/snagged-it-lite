'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { getChecklistItemCount, getUserProgress, getSnagCountForCategory } from '@/lib/api/checklist';
import { debug } from '@/lib/debug';
import { Layout, Section, Card, Button } from '@/components';

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
  
  // Load user progress data
  useEffect(() => {
    const loadProgressData = async () => {
      if (localLoading || !user) return;
      
      try {
        setIsLoadingProgress(true);
        
        // Get total steps for outside and inside
        const [outsideTotalSteps, insideTotalSteps] = await Promise.all([
          getChecklistItemCount('outside'),
          getChecklistItemCount('inside')
        ]);
        
        setOutsideTotal(outsideTotalSteps);
        setInsideTotal(insideTotalSteps);
        
        // Get user progress for outside and inside
        const [outsideUserProgress, insideUserProgress] = await Promise.all([
          getUserProgress(user.id, 'outside'),
          getUserProgress(user.id, 'inside')
        ]);
        
        setOutsideProgress(outsideUserProgress);
        setInsideProgress(insideUserProgress);
        
        // Get snag counts for outside and inside
        const [outsideSnags, insideSnags] = await Promise.all([
          getSnagCountForCategory(user.id, 'outside'),
          getSnagCountForCategory(user.id, 'inside')
        ]);
        
        setOutsideSnagCount(outsideSnags);
        setInsideSnagCount(insideSnags);
        
        setIsLoadingProgress(false);
      } catch (error) {
        debug.error('Error loading progress data:', error);
        setIsLoadingProgress(false);
      }
    };
    
    loadProgressData();
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
    if (!outsideProgress) {
      return '/checks/outside/1'; // Start at step 1 if no progress
    }
    
    if (outsideProgress.is_complete) {
      return '/checks/outside/1'; // Start over if already complete
    }
    
    return `/checks/outside/${outsideProgress.current_step}`; // Continue from current step
  };
  
  // Helper function to determine the next step URL for inside checks
  const getInsideNextStepUrl = () => {
    if (!insideProgress) {
      return '/checks/inside/1'; // Start at step 1 if no progress
    }
    
    if (insideProgress.is_complete) {
      return '/checks/inside/1'; // Start over if already complete
    }
    
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
    
    return `${outsideProgress.current_step - 1} of ${outsideTotal} complete`;
  };
  
  // Helper function to get inside progress text
  const getInsideProgressText = () => {
    if (!insideProgress) {
      return `0 of ${insideTotal} complete`;
    }
    
    if (insideProgress.is_complete) {
      return `${insideTotal} of ${insideTotal} complete`;
    }
    
    return `${insideProgress.current_step - 1} of ${insideTotal} complete`;
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
  
  // Determine if we should show the view snag list button
  const showSnagListButton = () => {
    // Get the completion status of both outside and inside checks
    const outsideComplete = outsideProgress && outsideProgress.is_complete;
    const insideComplete = insideProgress && insideProgress.is_complete;
    
    // Only show the button when both Outside and Inside checks are complete
    return outsideComplete && insideComplete;
  };

  return (
    <Section background="white" spacing="md" className="animate-fade-in bg-transparent">
      <div className="container mx-auto max-w-4xl">
        <Card className="p-6 md:p-8">
          <header className="text-left mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">Hello homeowner 👋</h1>
          </header>
          
          {/* Progress Cards */}
          <div className="space-y-6 mb-10">
            {/* Outside Checks Card */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="mb-4">
                <p className="text-gray-dark text-sm mb-2">
                  {getOutsideProgressText()}
                </p>
                <h2 className="text-xl font-semibold mb-2">Snag outside your home</h2>
                <p className="text-gray-dark mb-2">Check the brickwork, external paintwork, drives and pathways, the roof, and any garages and gardens.</p>
              </div>
              
              <div className="mb-6">
                {outsideSnagCount > 0 && (
                  <p className="text-sm text-gray-dark mt-2">
                    {outsideSnagCount} {outsideSnagCount === 1 ? 'snag' : 'snags'} recorded
                  </p>
                )}
              </div>
              
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
              
              <div className="mb-6">
                {insideSnagCount > 0 && (
                  <p className="text-sm text-gray-dark mt-2">
                    {insideSnagCount} {insideSnagCount === 1 ? 'snag' : 'snags'} recorded
                  </p>
                )}
              </div>
              
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
            
            {/* View Snag List Button - Only shown when appropriate */}
            {showSnagListButton() && (
              <div className="mt-4 text-center">
                <Link href="/snags/summary">
                  <Button 
                    variant="primary" 
                    size="lg"
                    aria-label="View your complete snag list"
                  >
                    <span className="flex items-center">
                      View your snag list
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 ml-2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                      </svg>
                    </span>
                  </Button>
                </Link>
              </div>
            )}
          </div>
          
          {/* How It Works Section removed */}
        </Card>
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
      <style jsx global>{`
        body {
          background-color: #84E0A3;
        }
      `}</style>
      <Suspense fallback={<DashboardLoading />}>
        <DashboardContent />
      </Suspense>
    </Layout>
  );
}
