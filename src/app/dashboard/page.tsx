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
      return 'Start outside checks';
    }
    
    if (outsideProgress.is_complete) {
      return 'Outside checks done';
    }
    
    return 'Continue outside checks';
  };
  
  // Helper function to get inside button text
  const getInsideButtonText = () => {
    if (!insideProgress || !insideProgress.current_step) {
      return 'Start inside checks';
    }
    
    if (insideProgress.is_complete) {
      return 'Inside checks done';
    }
    
    return 'Continue inside checks';
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
    <Section background="light" spacing="md" className="animate-fade-in">
      <div className="container mx-auto max-w-4xl">
        <Card className="p-6 md:p-8">
          <header className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="bg-primary/10 p-4 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-primary">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">Hello homeowner!</h1>
            <p className="text-gray-dark text-lg max-w-2xl mx-auto">Welcome to SnaggedIt</p>
          </header>
          
          {/* Progress Cards */}
          <div className="space-y-6 mb-10">
            {/* Outside Checks Card */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="bg-primary/10 p-2 rounded-full mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-primary">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold">Outside Checks</h2>
                </div>
                <div className="bg-primary/10 px-3 py-1 rounded-full text-sm font-medium">
                  {getOutsideProgressText()}
                </div>
              </div>
              
              <div className="relative h-2 bg-gray-100 rounded-full mb-4 overflow-hidden">
                <div 
                  className="absolute top-0 left-0 h-full bg-primary rounded-full" 
                  style={{
                    width: `${outsideProgress ? (outsideProgress.is_complete ? 100 : ((outsideProgress.current_step - 1) / outsideTotal) * 100) : 0}%`
                  }}
                ></div>
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  {outsideSnagCount > 0 && (
                    <p className="text-sm text-gray-dark">
                      {outsideSnagCount} {outsideSnagCount === 1 ? 'snag' : 'snags'} recorded
                    </p>
                  )}
                </div>
                
                <Link href={getOutsideNextStepUrl()} onClick={e => (outsideProgress && outsideProgress.is_complete) && e.preventDefault()}>
                  <Button 
                    variant={outsideProgress && outsideProgress.is_complete ? 'outline' : 'primary'}
                    disabled={outsideProgress && outsideProgress.is_complete}
                    aria-label={getOutsideButtonText()}
                  >
                    <span className="flex items-center">
                      {getOutsideButtonText()}
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 ml-2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </span>
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Inside Checks Card */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="bg-success/10 p-2 rounded-full mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-success">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m1.5.5l-1.5-.5M6.75 7.364V3h-3v18m3-13.636l10.5-3.819" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold">Inside Checks</h2>
                </div>
                <div className="bg-success/10 px-3 py-1 rounded-full text-sm font-medium">
                  {getInsideProgressText()}
                </div>
              </div>
              
              <div className="relative h-2 bg-gray-100 rounded-full mb-4 overflow-hidden">
                <div 
                  className="absolute top-0 left-0 h-full bg-success rounded-full" 
                  style={{
                    width: `${insideProgress ? (insideProgress.is_complete ? 100 : ((insideProgress.current_step - 1) / insideTotal) * 100) : 0}%`
                  }}
                ></div>
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  {insideSnagCount > 0 && (
                    <p className="text-sm text-gray-dark">
                      {insideSnagCount} {insideSnagCount === 1 ? 'snag' : 'snags'} recorded
                    </p>
                  )}
                </div>
                
                <Link href={getInsideNextStepUrl()} onClick={e => (insideProgress && insideProgress.is_complete) && e.preventDefault()}>
                  <Button 
                    variant={insideProgress && insideProgress.is_complete ? 'outline' : 'primary'}
                    disabled={insideProgress && insideProgress.is_complete}
                    aria-label={getInsideButtonText()}
                  >
                    <span className="flex items-center">
                      {getInsideButtonText()}
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 ml-2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </span>
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* View Snag List Button - Only shown when appropriate */}
            {showSnagListButton() && (
              <div className="mt-8 text-center">
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
          
          {/* How It Works Section */}
          <div className="mb-10 bg-accent p-6 rounded-lg border border-primary/10">
            <h2 className="text-xl font-semibold mb-4 text-center">How It Works</h2>
            <p className="text-gray-dark mb-4 text-center max-w-2xl mx-auto">
              Here's how SnaggedIt guides you through your home inspection step by step. You'll start with Outside checks, then move Inside, and finally review and share your snag list.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="bg-white p-5 rounded-lg border border-gray-100 text-center">
                <div className="flex justify-center mb-3">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-primary">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                    </svg>
                  </div>
                </div>
                <h3 className="font-semibold mb-2">1. Outside Checks</h3>
                <p className="text-sm text-gray-dark">Inspect the exterior of your home, including walls, roof, and garden areas.</p>
              </div>
              
              <div className="bg-white p-5 rounded-lg border border-gray-100 text-center">
                <div className="flex justify-center mb-3">
                  <div className="bg-success/10 p-2 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-success">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m1.5.5l-1.5-.5M6.75 7.364V3h-3v18m3-13.636l10.5-3.819" />
                    </svg>
                  </div>
                </div>
                <h3 className="font-semibold mb-2">2. Inside Checks</h3>
                <p className="text-sm text-gray-dark">Document issues in each room, from floors to ceilings and everything in between.</p>
              </div>
              
              <div className="bg-white p-5 rounded-lg border border-gray-100 text-center">
                <div className="flex justify-center mb-3">
                  <div className="bg-info/10 p-2 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-info">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                    </svg>
                  </div>
                </div>
                <h3 className="font-semibold mb-2">3. Review & Share</h3>
                <p className="text-sm text-gray-dark">Generate a professional report to share with contractors and track progress.</p>
              </div>
            </div>
          </div>
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
      <Suspense fallback={<DashboardLoading />}>
        <DashboardContent />
      </Suspense>
    </Layout>
  );
}
