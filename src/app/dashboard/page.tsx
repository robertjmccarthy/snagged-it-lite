'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import Navigation from '@/components/Navigation';

// Component to handle the actual dashboard logic
function DashboardContent() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // Prevent multiple redirects
    if (authChecked) return;
    
    const checkUser = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const session = data?.session;
        
        if (!session) {
          // Use replace instead of push to avoid browser history issues
          router.replace('/signin');
          return;
        }
        
        setUser(session.user);
        setAuthChecked(true);
      } catch (error) {
        console.error('Error checking authentication:', error);
        // If there's an error with Supabase, redirect to sign-in
        router.replace('/signin');
        return;
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, [router, authChecked]);

  if (loading) {
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
