'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import Navigation from '@/components/Navigation';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          router.push('/signin');
          return;
        }
        
        setUser(session.user);
      } catch (error) {
        console.error('Error checking authentication:', error);
        // If there's an error with Supabase, redirect to sign-in
        router.push('/signin');
        return;
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, [router]);

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col">
        <Navigation isAuthenticated={true} />
        <div className="flex flex-1 items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col">
      <Navigation isAuthenticated={true} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Welcome to SnaggedIt Lite</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Your dashboard for tracking home build issues
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-md dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 text-xl font-bold">Quick Stats</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Total Issues</span>
                <span className="font-medium">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Open Issues</span>
                <span className="font-medium">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Resolved Issues</span>
                <span className="font-medium">0</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-md dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 text-xl font-bold">Recent Activity</h2>
            <p className="text-gray-600 dark:text-gray-400">
              No recent activity to display.
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-md dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 text-xl font-bold">Quick Actions</h2>
            <div className="space-y-2">
              <button className="btn btn-primary w-full">
                Create New Issue
              </button>
              <button className="btn btn-outline w-full">
                View All Issues
              </button>
              <button className="btn btn-outline w-full">
                Generate Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
