'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import { Layout, Section, Button } from '@/components';
import { getSnagListById, SnagList, setActiveSnagList } from '@/lib/api/snag-list';
import { getAllUserSnags } from '@/lib/api/checklist';
import { debug } from '@/lib/debug';

interface SnagListDetailPageProps {
  params: {
    id: string;
  };
}

export default function SnagListDetailPage({ params }: SnagListDetailPageProps) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [snagList, setSnagList] = useState<SnagList | null>(null);
  const [snags, setSnags] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSettingActive, setIsSettingActive] = useState(false);

  // Protect the route
  useEffect(() => {
    if (!loading && !user) {
      debug.log('Snag List Detail Page: Not authenticated, redirecting to sign-in');
      router.replace('/signin');
    }
  }, [loading, user, router]);

  // Load snag list and snags
  useEffect(() => {
    const loadSnagListData = async () => {
      if (!user || !params.id) return;
      
      try {
        setIsLoading(true);
        
        // Load snag list details
        const list = await getSnagListById(params.id);
        if (!list) {
          debug.error(`Snag list with ID ${params.id} not found`);
          router.replace('/snag-lists');
          return;
        }
        
        setSnagList(list);
        
        // Load snags for this list
        const snagData = await getAllUserSnags(user.id, params.id);
        setSnags(snagData);
      } catch (error) {
        debug.error('Error loading snag list data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user && params.id) {
      loadSnagListData();
    }
  }, [user, params.id, router]);

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not shared yet';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Set this snag list as active
  const handleSetActive = async () => {
    if (!user || !snagList) return;
    
    try {
      setIsSettingActive(true);
      const success = await setActiveSnagList(user.id, snagList.id);
      
      if (success) {
        // Update the local state
        setSnagList({
          ...snagList,
          is_active: true
        });
        
        // Redirect to dashboard to start using this list
        router.push('/dashboard');
      } else {
        debug.error('Failed to set snag list as active');
      }
    } catch (error) {
      debug.error('Error setting snag list as active:', error);
    } finally {
      setIsSettingActive(false);
    }
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
          {/* Back button */}
          <div className="mb-4">
            <Link href="/snag-lists" className="text-primary hover:text-primary-hover flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to all snag lists
            </Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : snagList ? (
            <>
              <header className="text-left mb-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">
                      {snagList.address || 'Unnamed property'}
                    </h1>
                    <p className="text-lg text-gray-600">
                      {snagList.snag_count || 0} snags recorded
                      {snagList.shared_at ? ` • Shared on ${formatDate(snagList.shared_at)}` : ''}
                    </p>
                  </div>
                  
                  {!snagList.is_active && (
                    <div className="mt-4 md:mt-0">
                      <button 
                        onClick={handleSetActive}
                        disabled={isSettingActive}
                        className="menu-item bg-primary hover:bg-primary-hover"
                      >
                        {isSettingActive ? 'Setting active...' : 'Use this snag list'}
                      </button>
                    </div>
                  )}
                  
                  {snagList.is_active && (
                    <div className="mt-4 md:mt-0">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        Active list
                      </span>
                    </div>
                  )}
                </div>
              </header>

              {/* Details Box */}
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-6">
                <h2 className="text-xl font-semibold mb-2">Details</h2>
                <div className="space-y-2 mt-3">
                  {snagList.address && (
                    <div className="flex justify-between items-start border-b border-gray-200 pb-2">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-0.5">Home address</h3>
                        <p className="mt-0 text-base text-gray-900 whitespace-pre-line">{snagList.address}</p>
                      </div>
                    </div>
                  )}
                  
                  {snagList.builder_name && (
                    <div className="flex justify-between items-start border-b border-gray-200 pb-2">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-0.5">Builder</h3>
                        <p className="mt-0 text-base text-gray-900">{snagList.builder_name}</p>
                      </div>
                    </div>
                  )}
                  
                  {snagList.builder_email && (
                    <div className="flex justify-between items-start border-b border-gray-200 pb-2">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-0.5">Builder email</h3>
                        <p className="mt-0 text-base text-gray-900">{snagList.builder_email}</p>
                      </div>
                    </div>
                  )}
                  
                  {snagList.shared_at && (
                    <div className="flex justify-between items-start border-b border-gray-200 pb-2">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-0.5">Shared on</h3>
                        <p className="mt-0 text-base text-gray-900">{formatDate(snagList.shared_at)}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-start pb-2">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-0.5">Snags</h3>
                      <p className="mt-0 text-base text-gray-900">{snagList.snag_count || 0} snags recorded</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Snags List */}
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Recorded snags</h2>
                {snags.length > 0 ? (
                  <div className="space-y-4">
                    {snags.map((snag) => (
                      <div key={snag.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-base font-medium">{snag.checklist_item?.friendly_text || 'Snag'}</h4>
                          <span className="text-xs text-gray-500">
                            {new Date(snag.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        
                        {snag.note && (
                          <p className="text-sm text-gray-700 mb-2">{snag.note}</p>
                        )}
                        
                        {snag.photo_url && (
                          <div className="mt-2 relative h-40 w-full">
                            <img 
                              src={snag.photo_url} 
                              alt="Snag photo" 
                              className="rounded-md object-cover h-full w-full"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No snags found</p>
                )}
              </div>
            </>
          ) : (
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm text-center">
              <h2 className="text-xl font-semibold mb-4">Snag list not found</h2>
              <p className="text-gray-600 mb-6">
                The snag list you're looking for doesn't exist or you don't have permission to view it.
              </p>
              <Link href="/snag-lists">
                <button className="menu-item bg-primary hover:bg-primary-hover">
                  Back to your snag lists
                </button>
              </Link>
            </div>
          )}
        </div>
      </Section>
    </Layout>
  );
}
