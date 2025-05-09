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
      
      // Check if user is authenticated using our AuthContext
      const isAuthenticated = await checkAuth();
      
      if (!isAuthenticated) {
        console.log('Dashboard: Not authenticated, redirecting to sign-in');
        window.location.href = '/signin';
        return;
      }
      
      console.log('Dashboard: User authenticated:', user?.email);
      setLocalLoading(false);
    };

    verifyAuth();
  }, [checkAuth, user]);

  if (loading || localLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4">Welcome to your Dashboard</h1>
        <p className="mb-2">You are signed in as:</p>
        <div className="bg-gray-100 p-3 rounded mb-4">
          <p className="font-medium">{user?.email}</p>
        </div>
        <p className="text-gray-600 mb-6">This is where you'll manage your projects and issues.</p>
      </div>
    </div>
  );
}

// Loading fallback for the Suspense boundary
function DashboardLoading() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
    </div>
  );
}

// Main component with Suspense boundary
export default function Dashboard() {
  return (
    <main className="flex min-h-screen flex-col">
      <Navigation isAuthenticated={true} />
      <Suspense fallback={<DashboardLoading />}>
        <DashboardContent />
      </Suspense>
    </main>
  );
}
