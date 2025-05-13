'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useShare } from '@/contexts/ShareContext';
import { Layout } from '@/components';
import { debug } from '@/lib/debug';
import { updateShareStatus, getShareById } from '@/lib/api/share';
import { supabase } from '@/lib/supabase/client';
import { getActiveSnagList } from '@/lib/api/snag-list';

// Component that uses searchParams (needs to be wrapped in Suspense)
function SuccessPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();
  const { resetShareData } = useShare();
  const [isUpdating, setIsUpdating] = useState(false);
  const shareId = searchParams?.get('share_id');

  // Protect the route and verify payment
  useEffect(() => {
    if (!loading) {
      if (!user) {
        debug.error('Share Success Page: Not authenticated, redirecting to sign-in');
        router.replace('/signin');
        return;
      }
      
      // If we have a shareId, update its status to paid and link it to the active snag list
      if (shareId) {
        const updatePaymentStatus = async () => {
          try {
            setIsUpdating(true);
            debug.log(`Updating payment status for share: ${shareId}`);
            
            // Step 1: Update the share status to paid
            await updateShareStatus(shareId, 'paid');
            debug.log('Payment status updated successfully');
            
            // Step 2: Get the share details to get the address and builder info
            const shareData = await getShareById(shareId);
            if (!shareData) {
              debug.error(`Could not find share with ID: ${shareId}`);
              return;
            }
            
            // Step 3: Get the active snag list for this user
            const activeSnagList = await getActiveSnagList(user.id);
            if (!activeSnagList) {
              debug.error('No active snag list found for user');
              return;
            }
            
            // Step 4: Link the share to the active snag list
            debug.log(`Linking share ${shareId} to snag list ${activeSnagList.id}`);
            const { error: updateError } = await supabase
              .from('snag_lists')
              .update({
                share_id: shareId,
                address: shareData.address,
                builder_name: shareData.builder_name,
                builder_email: shareData.builder_email,
                shared_at: new Date().toISOString()
              })
              .eq('id', activeSnagList.id);
            
            if (updateError) {
              debug.error(`Error linking share to snag list: ${updateError.message}`);
            } else {
              debug.log('Successfully linked share to snag list');
            }
          } catch (error) {
            debug.error(`Error updating payment status: ${error}`);
          } finally {
            setIsUpdating(false);
          }
        };
        
        updatePaymentStatus();
      }
    }
  }, [loading, user, router, shareId]);

  // Reset share data when navigating away from success page
  useEffect(() => {
    return () => {
      resetShareData();
    };
  }, [resetShareData]);

  if (loading || !user) {
    return (
      <Layout>
        <div className="fixed inset-0 bg-[#BBF2D7] -z-10"></div>
        <style jsx global>{`
          body {
            background-color: #BBF2D7;
          }
        `}</style>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <div className="flex flex-1 flex-col p-6 animate-fade-in">
      <div className="container mx-auto max-w-4xl">
        <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm">
          <header className="text-left mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">Thank you for your payment</h1>
          </header>
          
          <div className="space-y-6 mb-10">
            <p className="text-gray-dark text-lg mb-6">
              Your snag list has been sent to your builder. They will be able to view all the snags you recorded so they can get on with sorting them.
            </p>
            
            <div className="flex">
              <Link href="/dashboard">
                <button
                  className="menu-item bg-primary hover:bg-primary-hover"
                  aria-label="View your snag list"
                >
                  View your snag list
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main component with Suspense boundary
export default function SuccessPage() {
  return (
    <Layout>
      <div className="fixed inset-0 bg-[#BBF2D7] -z-10"></div>
      <style jsx global>{`
        body {
          background-color: #BBF2D7;
        }
      `}</style>
      
      <Suspense fallback={
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      }>
        <SuccessPageContent />
      </Suspense>
    </Layout>
  );
}
