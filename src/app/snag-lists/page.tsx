'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { Layout, Section, Button } from '@/components';
import { getSnagListsForUser, getActiveSnagList, ensureSnagListForCompletedChecks, SnagList } from '@/lib/api/snag-list';
import { getUserProgress } from '@/lib/api/checklist';
import { debug } from '@/lib/debug';

export default function SnagListsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [snagLists, setSnagLists] = useState<SnagList[]>([]);
  const [activeSnagList, setActiveSnagList] = useState<SnagList | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Protect the route
  useEffect(() => {
    if (!loading && !user) {
      debug.log('Snag Lists Page: Not authenticated, redirecting to sign-in');
      router.replace('/signin');
    }
  }, [loading, user, router]);

  // Load snag lists and active snag list
  useEffect(() => {
    const loadSnagLists = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        debug.log('Loading snag lists for user:', user.id);
        
        // Check if the user has completed both inside and outside checks
        const [insideProgress, outsideProgress] = await Promise.all([
          getUserProgress(user.id, 'inside'),
          getUserProgress(user.id, 'outside')
        ]);
        
        debug.log('Inside progress:', insideProgress);
        debug.log('Outside progress:', outsideProgress);
        
        const bothChecksComplete = 
          insideProgress?.is_complete === true && 
          outsideProgress?.is_complete === true;
        
        debug.log('Both checks complete:', bothChecksComplete);
        
        let active = null;
        
        // If both checks are complete, ensure an active snag list exists
        if (bothChecksComplete) {
          debug.log('User has completed both checks, ensuring active snag list exists');
          const snagListId = await ensureSnagListForCompletedChecks(user.id);
          
          if (snagListId) {
            debug.log('Created or found active snag list:', snagListId);
            // Get the active snag list details
            active = await getActiveSnagList(user.id);
          }
        } else {
          // If not both checks complete, just try to get the active snag list
          debug.log('User has not completed both checks, checking for active snag list');
          active = await getActiveSnagList(user.id);
        }
        
        debug.log('Active snag list after checks:', active);
        
        // Then get all snag lists
        const allLists = await getSnagListsForUser(user.id);
        debug.log('All snag lists:', allLists);
        
        // Set the active snag list
        setActiveSnagList(active);
        
        // Filter out the active snag list from the list of all snag lists
        // to avoid showing it twice
        if (active) {
          const filteredLists = allLists.filter(list => list.id !== active.id);
          debug.log('Filtered snag lists (excluding active):', filteredLists);
          setSnagLists(filteredLists);
        } else {
          setSnagLists(allLists);
        }
      } catch (error) {
        debug.error('Error loading snag lists:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      loadSnagLists();
    }
  }, [user]);

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not shared yet';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading || !user) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Section background="light" spacing="md">
        <div className="container mx-auto max-w-4xl">
          <header className="text-left mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">Your snag lists</h1>
          </header>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Active Snag List Section - Always show this section */}
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Current Snag List</h2>
                <div className="bg-white p-6 rounded-lg border-2 border-primary shadow-sm">
                  {activeSnagList ? (
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                      <div className="mb-4 md:mb-0">
                        <h3 className="text-xl font-semibold mb-1">
                          {activeSnagList.address || 'Current property'}
                        </h3>
                        <div className="space-y-1">
                          <p className="text-gray-600">
                            <span className="font-medium">Builder:</span> {activeSnagList.builder_name || 'Not specified'}
                          </p>
                          <p className="text-gray-600">
                            <span className="font-medium">Created on:</span> {new Date(activeSnagList.created_at).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </p>
                          <p className="text-gray-600">
                            <span className="font-medium">Shared:</span> {activeSnagList.shared_at ? 'Yes' : 'No'}
                          </p>
                          <p className="text-gray-600">
                            <span className="font-medium">Snags:</span> {activeSnagList.snag_count || 0}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col space-y-2">
                        <Link href="/snags/summary">
                          <button className="menu-item bg-primary hover:bg-primary-hover w-full md:w-auto">
                            View current snag list
                          </button>
                        </Link>
                        <div className="text-center md:text-right">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active list
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-xl font-semibold mb-3">Your Current Snag List</h3>
                      <p className="text-gray-600 mb-4">
                        You have completed your home checks. Your snags are available in the summary view.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Link href="/snags/summary">
                          <button className="menu-item bg-primary hover:bg-primary-hover w-full sm:w-auto">
                            View current snags
                          </button>
                        </Link>
                        <Link href="/dashboard">
                          <button className="menu-item bg-white hover:bg-gray-100 border border-gray-300 text-gray-800 w-full sm:w-auto">
                            Go to dashboard
                          </button>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Previous Snag Lists Section */}
              {snagLists.length > 0 ? (
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Previous Snag Lists</h2>
                  <div className="space-y-4">
                    {snagLists.map((list) => (
                      <div key={list.id} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                          <div className="mb-4 md:mb-0">
                            <h3 className="text-xl font-semibold mb-1">
                              {list.address || 'Unnamed property'}
                            </h3>
                            <div className="space-y-1">
                              <p className="text-gray-600">
                                <span className="font-medium">Builder:</span> {list.builder_name || 'Not specified'}
                              </p>
                              <p className="text-gray-600">
                                <span className="font-medium">Shared on:</span> {formatDate(list.shared_at)}
                              </p>
                              <p className="text-gray-600">
                                <span className="font-medium">Snags:</span> {list.snag_count || 0}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col space-y-2">
                            <Link href={`/snag-lists/${list.id}`}>
                              <button className="menu-item bg-primary hover:bg-primary-hover w-full md:w-auto">
                                View snag list
                              </button>
                            </Link>
                            {list.is_active && (
                              <div className="text-center md:text-right">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Active list
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : !activeSnagList && (
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <h2 className="text-xl font-semibold mb-4">No snag lists found</h2>
                <p className="text-gray-600 mb-6">
                  You haven't created any snag lists yet. Start by snagging your home.
                </p>
                <Link href="/dashboard">
                  <button className="menu-item bg-primary hover:bg-primary-hover">
                    Snag your home
                  </button>
                </Link>
              </div>
              )}
            </div>
          )}
        </div>
      </Section>
    </Layout>
  );
}
