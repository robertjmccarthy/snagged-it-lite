'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useShare } from '@/contexts/ShareContext';
import { Layout, Section } from '@/components';
import { debug } from '@/lib/debug';
import { updateShareStatus } from '@/lib/api/share';

export default function SuccessPage() {
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
      
      // If we have a shareId, update its status to paid
      if (shareId) {
        const updatePaymentStatus = async () => {
          try {
            setIsUpdating(true);
            debug.log(`Updating payment status for share: ${shareId}`);
            await updateShareStatus(shareId, 'paid');
            debug.log('Payment status updated successfully');
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
    <Layout>
      <div className="fixed inset-0 bg-[#BBF2D7] -z-10"></div>
      <style jsx global>{`
        body {
          background-color: #BBF2D7;
        }
      `}</style>
      
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
    </Layout>
  );
}
