'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { format, formatDistanceToNow } from 'date-fns';
import { getAllUserSnags } from '@/lib/api/checklist';
import { debug } from '@/lib/debug';
import { Layout, Section, Card, Button } from '@/components';

// Success message component with Suspense boundary
function SuccessMessage() {
  const searchParams = useSearchParams();
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
  
  if (!showSharedSuccess) return null;
  
  return (
    <div className="bg-success/10 text-success rounded-lg p-4 border border-success/20 mb-6 flex items-start">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <div>
        <p className="font-medium">Snag list shared successfully!</p>
        <p className="text-sm">Your builder has been notified and will receive a copy of your snag list.</p>
      </div>
    </div>
  );
}

export default function SnagSummaryPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [snags, setSnags] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

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
      <Layout>
        <div className="flex flex-1 items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Section background="light" spacing="md" className="animate-fade-in">
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
          
          <Card className="p-6 md:p-8">
            <Suspense fallback={null}>
              <SuccessMessage />
            </Suspense>
            
            <header className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl md:text-3xl font-bold">Your snag list</h1>
                <div className="bg-primary/10 px-3 py-1 rounded-full text-sm font-medium">
                  {snags.length} {snags.length === 1 ? 'snag' : 'snags'} recorded
                </div>
              </div>
              <p className="text-gray-dark">
                Here's a summary of all the issues you've recorded during your property checks.
              </p>
            </header>
            
            {error && (
              <div className="bg-error/10 text-error rounded-lg p-4 border border-error/20 mb-6">
                {error}
              </div>
            )}
            
            {snags.length === 0 ? (
              <div className="bg-gray-50 border border-gray-100 rounded-lg p-8 text-center">
                <div className="flex justify-center mb-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-primary">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-lg font-medium mb-2">No snags recorded yet</h3>
                <p className="text-gray-dark mb-6">
                  You haven't recorded any issues during your property checks. Start a check to document any problems you find.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/checks/outside">
                    <Button variant="primary">
                      <span className="flex items-center">
                        Check outside
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 ml-2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                      </span>
                    </Button>
                  </Link>
                  <Link href="/checks/inside">
                    <Button variant="outline">
                      <span className="flex items-center">
                        Check inside
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 ml-2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                      </span>
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-6">
                  {snags.map((snag) => {
                    const formattedDate = formatDate(snag.created_at);
                    // Access the data with our new structure
                    const checklistItem = snag.checklist_item || {};
                    const category = snag.category || {};
                    
                    return (
                      <div key={snag.id} className="border border-gray-100 rounded-lg overflow-hidden">
                        <div className="flex flex-col md:flex-row">
                          {/* Photo thumbnail */}
                          <div className="md:w-1/3 lg:w-1/4 bg-gray-50 flex items-center justify-center">
                            {snag.photo_url ? (
                              <img 
                                src={snag.photo_url} 
                                alt="Snag photo" 
                                className="w-full h-48 md:h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-48 md:h-full flex items-center justify-center bg-gray-50 p-4">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-gray-300">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                                </svg>
                              </div>
                            )}
                          </div>
                          
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
                              <Link href={`/snags/${snag.id}/edit`}>
                                <Button 
                                  variant="outline"
                                  size="sm"
                                >
                                <span className="flex items-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                  </svg>
                                  Edit
                                </span>
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Share feature removed */}
              </>
            )}
          </Card>
        </div>
      </Section>
    </Layout>
  );
}
