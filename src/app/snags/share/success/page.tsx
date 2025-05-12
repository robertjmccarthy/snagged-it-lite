'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useShare } from '@/contexts/ShareContext';
import ShareLayout from '@/components/ShareLayout';
import { Button } from '@/components';
import { debug } from '@/lib/debug';

export default function SuccessPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { shareData, resetShareData } = useShare();

  // Protect the route
  useEffect(() => {
    if (!loading && !user) {
      debug.error('Share Success Page: Not authenticated, redirecting to sign-in');
      router.replace('/signin');
    }
  }, [loading, user, router]);

  // Reset share data when navigating away from success page
  useEffect(() => {
    return () => {
      resetShareData();
    };
  }, [resetShareData]);

  if (loading || !user) {
    return (
      <ShareLayout title="Payment successful">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </ShareLayout>
    );
  }

  return (
    <ShareLayout 
      title="Payment successful" 
      subtitle="Your snag list has been sent to your builder."
    >
      <div className="space-y-8 text-center">
        <div className="flex justify-center">
          <div className="bg-primary bg-opacity-20 rounded-full p-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Thank you for your payment</h2>
          <p className="text-gray-600">
            We've sent your snag list to {shareData.builderType === 'other' ? shareData.builderName : shareData.builderType} at {shareData.builderEmail}.
          </p>
          <p className="text-gray-600">
            Your builder will now be able to review your snags and get to work on fixing them.
          </p>
        </div>
        
        <div className="pt-6">
          <Link href="/dashboard">
            <Button
              variant="primary"
              size="lg"
              className="w-full"
            >
              Return to dashboard
            </Button>
          </Link>
        </div>
      </div>
    </ShareLayout>
  );
}
