'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import Link from 'next/link';
import { format, formatDistanceToNow } from 'date-fns';
import { getAllUserSnags } from '@/lib/api/checklist';
import { debug } from '@/lib/debug';

// Component that uses useSearchParams must be wrapped in Suspense
function SnagSummaryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [snags, setSnags] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showSharedSuccess, setShowSharedSuccess] = useState(false);
  
  // Check for shared=true query parameter
  useEffect(() => {
    if (searchParams) {
      const shared = searchParams.get('shared');
      if (shared === 'true') {
        setShowSharedSuccess(true);
      }
    }
  }, [searchParams]);

  // Protect the route and load snags
  useEffect(() => {
    async function loadSnags() {
      if (!loading) {
        if (!user) {
          debug.error('Snag Summary: Not authenticated, redirecting to sign-in');
          router.replace('/signin');
          return;
        }

        try {
          debug.log('Fetching all snags for user');
          const snagData = await getAllUserSnags(user.id);
          debug.log(`Found ${snagData.length} snags`);
          setSnags(snagData);
          setIsLoading(false);
        } catch (error) {
          debug.error('Error loading snags:', error);
          setError('Failed to load your snags. Please try again.');
          setIsLoading(false);
        }
      }
    }

    loadSnags();
  }, [user, loading, router]);

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return {
        relative: formatDistanceToNow(date, { addSuffix: true }),
        full: format(date, 'PPP p') // e.g., "April 29, 2023 at 3:45 PM"
      };
    } catch (error) {
      return {
        relative: 'Unknown date',
        full: 'Unknown date'
      };
    }
  };

  if (loading || isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col p-6">
        <div className="container mx-auto max-w-md">
          <div className="bg-error/10 text-error rounded-lg p-4 border border-error/20 mb-4">
            {error}
          </div>
          <Link href="/dashboard" className="btn btn-primary w-full">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col p-6 animate-fade-in">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-6 flex items-center">
          <Link 
            href="/dashboard" 
            className="text-gray-dark hover:text-primary transition-colors flex items-center"
            aria-label="Back to dashboard"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back
          </Link>
        </div>
        
        <div className="bg-white shadow-sm rounded-xl p-6 md:p-8 border border-gray-100">
          {showSharedSuccess && (
            <div className="bg-success/10 text-success rounded-lg p-4 border border-success/20 mb-6 flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-medium">Snag list shared successfully!</p>
                <p className="text-sm">Your builder has been notified and will receive your snag list.</p>
              </div>
            </div>
          )}
          
          {snags.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-50 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-gray-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-2">No snags found</h2>
              <p className="text-gray-dark mb-6">
                You haven't recorded any snags yet. Start a new check to document issues with your build.
              </p>
              <Link href="/checks" className="btn btn-primary rounded-pill px-6 py-2">
                Start a new check
              </Link>
            </div>
          ) : (
            <>
              <div className="space-y-6">
                {snags.map((snag) => {
                  const formattedDate = formatDate(snag.created_at);
                  const checklistItem = snag.checklist_item || {};
                  const category = checklistItem.category || {};
                  
                  return (
                    <div key={snag.id} className="bg-gray-50 rounded-lg overflow-hidden border border-gray-100 flex flex-col md:flex-row">
                      {/* Image thumbnail (if available) */}
                      {snag.image_url && (
                        <div className="md:w-1/3 bg-gray-100 flex items-center justify-center overflow-hidden">
                          <img 
                            src={snag.image_url} 
                            alt={`Snag: ${checklistItem.friendly_text || 'Unknown item'}`}
                            className="w-full h-48 md:h-full object-cover"
                          />
                        </div>
                      )}
                      
                      {/* Snag details */}
                      <div className="p-6 flex-1">
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className="bg-primary/10 text-primary-dark px-3 py-1 rounded-full text-xs font-medium">
                            {category.name || 'Unknown'}
                          </span>
                          <span className="bg-gray-100 text-gray-dark px-3 py-1 rounded-full text-xs font-medium" title={formattedDate.full}>
                            {formattedDate.relative}
                          </span>
                        </div>
                        
                        <h3 className="text-lg font-semibold mb-2">
                          {checklistItem.friendly_text || 'Unknown item'}
                        </h3>
                        
                        {snag.note && (
                          <p className="text-gray-dark mb-4 whitespace-pre-wrap">
                            {snag.note}
                          </p>
                        )}
                        
                        <div className="mt-4 flex justify-end">
                          <Link 
                            href={`/snags/${snag.id}/edit`}
                            className="btn btn-outline rounded-pill px-4 py-1 text-sm"
                          >
                            <span className="flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                              </svg>
                              Edit
                            </span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-10 pt-6 border-t border-gray-100">
                <div className="flex justify-center">
                  <Link 
                    href="/share/builder"
                    className="btn btn-primary rounded-pill px-8 py-3"
                    aria-label="Share your snag list with your builder"
                  >
                    <span className="flex items-center">
                      Share with builder
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 ml-2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                      </svg>
                    </span>
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Loading fallback for the Suspense boundary
function SnagSummaryLoading() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
}

export default function SnagSummaryPage() {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <main className="flex min-h-screen flex-col overflow-x-hidden">
        <Navigation isAuthenticated={false} />
        <div className="flex flex-1 items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </main>
    );
  }
  
  return (
    <main className="flex min-h-screen flex-col overflow-x-hidden">
      <Navigation isAuthenticated={!!user} />
      <Suspense fallback={<SnagSummaryLoading />}>
        <SnagSummaryContent />
      </Suspense>
    </main>
  );
}
