'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';

// Component to handle the actual dashboard logic
function DashboardContent() {
  const { user, loading, error, checkAuth } = useAuth();
  const [localLoading, setLocalLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      console.log('Dashboard: Checking authentication status');
      
      if (loading) {
        // Wait for the initial auth state to resolve
        return;
      }
      
      // Check if user is authenticated using our AuthContext
      if (!user) {
        console.log('Dashboard: Not authenticated, redirecting to sign-in');
        window.location.replace('/signin');
        return;
      }
      
      console.log('Dashboard: User authenticated:', user?.email);
      setLocalLoading(false);
    };

    verifyAuth();
  }, [loading, user]);

  if (loading || localLoading) {
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

  return (
    <div className="flex flex-1 flex-col p-6 animate-fade-in">
      <div className="container mx-auto max-w-4xl">
        <div className="bg-white shadow-sm rounded-xl p-6 md:p-8 border border-gray-100">
          <header className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="bg-primary/10 p-4 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-primary">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">Hello {getUserFirstName()}!</h1>
            <p className="text-gray-dark text-lg max-w-2xl mx-auto">Welcome to SnaggedIt</p>
          </header>
          
          <div className="mb-10 bg-accent p-6 rounded-lg border border-primary/10">
            <h2 className="text-xl font-semibold mb-4 text-center">How It Works</h2>
            <p className="text-gray-dark mb-4 text-center max-w-2xl mx-auto">
              Here's how SnaggedIt will guide you through your home inspection step by step. You'll start with Outside checks, then move Inside, and finally review and share your snag list.
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
          
          <div className="text-center">
            <a 
              href="/checks/outside" 
              className="btn btn-primary rounded-pill px-8 py-3 text-lg inline-flex items-center justify-center" 
              aria-label="Start your home inspection with outside checks"
              role="button"
            >
              <span>Get Started</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 ml-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
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
    <main className="flex min-h-screen flex-col">
      <Navigation isAuthenticated={!!user} />
      <Suspense fallback={<DashboardLoading />}>
        <DashboardContent />
      </Suspense>
    </main>
  );
}
