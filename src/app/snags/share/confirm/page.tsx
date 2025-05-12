'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useShare } from '@/contexts/ShareContext';
import ShareLayout from '@/components/ShareLayout';
import { Button } from '@/components';
import { debug } from '@/lib/debug';
import { saveShareData } from '@/lib/api/share';

export default function ConfirmPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { shareData } = useShare();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Protect the route and check for required data
  useEffect(() => {
    if (!loading) {
      if (!user) {
        debug.error('Share Confirm Page: Not authenticated, redirecting to sign-in');
        router.replace('/signin');
        return;
      }
      
      // Check if all required data is present
      const { fullName, address, builderType, builderEmail } = shareData;
      
      if (!fullName || !address || !builderType || !builderEmail) {
        debug.error('Share Confirm Page: Missing required data, redirecting to first step');
        router.replace('/snags/share/name');
      }
    }
  }, [loading, user, router, shareData]);

  const handleSubmit = async () => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      // Save the share data to Supabase
      const shareId = await saveShareData(user.id, shareData);
      
      if (!shareId) {
        throw new Error('Failed to save share data');
      }
      
      // In a real implementation, this would redirect to a payment gateway
      // with the shareId as a reference
      
      // For now, just redirect to a success page
      router.push('/snags/share/success');
    } catch (error) {
      debug.error('Error processing payment:', error);
      setIsSubmitting(false);
    }
  };

  // Get the builder name for display
  const builderDisplayName = shareData.builderType === 'other' 
    ? shareData.builderName 
    : shareData.builderType;

  if (loading || !user || !shareData.fullName) {
    return (
      <ShareLayout title="Confirm your details">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </ShareLayout>
    );
  }

  return (
    <ShareLayout 
      title="Confirm your details" 
      subtitle="Check the information below before proceeding to pay."
    >
      <div className="space-y-8">
        {/* Information summary */}
        <div className="space-y-4">
          {/* Full Name */}
          <div className="flex justify-between items-start border-b border-gray-200 pb-3">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Full name</h3>
              <p className="mt-1 text-base text-gray-900">{shareData.fullName}</p>
            </div>
            <Link 
              href="/snags/share/name?returnToConfirm=true" 
              className="text-sm text-primary hover:text-primary-hover"
              aria-label="Change your name"
            >
              Change
            </Link>
          </div>
          
          {/* Address */}
          <div className="flex justify-between items-start border-b border-gray-200 pb-3">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Home address</h3>
              <p className="mt-1 text-base text-gray-900 whitespace-pre-line">{shareData.address}</p>
            </div>
            <Link 
              href="/snags/share/address?returnToConfirm=true" 
              className="text-sm text-primary hover:text-primary-hover"
              aria-label="Change your address"
            >
              Change
            </Link>
          </div>
          
          {/* Builder */}
          <div className="flex justify-between items-start border-b border-gray-200 pb-3">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Builder</h3>
              <p className="mt-1 text-base text-gray-900">{builderDisplayName}</p>
            </div>
            <Link 
              href="/snags/share/builder?returnToConfirm=true" 
              className="text-sm text-primary hover:text-primary-hover"
              aria-label="Change your builder"
            >
              Change
            </Link>
          </div>
          
          {/* Builder Email */}
          <div className="flex justify-between items-start border-b border-gray-200 pb-3">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Builder email</h3>
              <p className="mt-1 text-base text-gray-900">{shareData.builderEmail}</p>
            </div>
            <Link 
              href="/snags/share/builder-email?returnToConfirm=true" 
              className="text-sm text-primary hover:text-primary-hover"
              aria-label="Change builder email"
            >
              Change
            </Link>
          </div>
        </div>
        
        {/* Payment banner */}
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 shadow-sm mt-8">
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">Share your snag list for £19.99</h2>
            <p className="text-gray-dark mb-2">
              Your builder will receive your snag list straight to their inbox so they can get onto sorting the snags with your new home.
            </p>
          </div>
          
          <div className="mb-6"></div>
          
          <div className="flex">
            <button
              onClick={handleSubmit}
              className="menu-item bg-primary hover:bg-primary-hover"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
              aria-label="Confirm details and go to pay"
            >
              {isSubmitting ? 'Processing...' : 'Confirm details and go to pay'}
            </button>
          </div>
        </div>
      </div>
    </ShareLayout>
  );
}
