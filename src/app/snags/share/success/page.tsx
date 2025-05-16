'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useShare } from '@/contexts/ShareContext';
import Layout from '@/components/Layout';
import Section from '@/components/Section';
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
        <div className="fixed inset-0 bg-dark-green -z-10"></div>
        <style jsx global>{`
          body {
            background-color: #0A4D2E;
          }
        `}</style>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Section background="dark-green">
      <div className="container mx-auto max-w-4xl">
        <div className="flex flex-col items-center text-center py-12 px-6">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6 text-white">
            Thank you for your payment
          </h1>
          <p className="text-xl text-white mb-8">
            Your snag list is ready to view, download, and share with your builder
          </p>
          
          <Link href="/dashboard">
            <button
              className="btn btn-primary text-lg py-3 px-6"
              aria-label="Continue to view your snag list"
            >
              Continue to view your snag list
            </button>
          </Link>
        </div>
      </div>
    </Section>
  );
}

// Main component with Suspense boundary
export default function SuccessPage() {
  return (
    <Layout>
      <div className="fixed inset-0 bg-dark-green -z-10"></div>
      <style jsx global>{`
        body {
          background-color: #0A4D2E;
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
