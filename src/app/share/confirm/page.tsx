'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useBuilderShare } from '@/contexts/BuilderShareContext';
import Navigation from '@/components/Navigation';
import Link from 'next/link';
import { debug } from '@/lib/debug';
import { getTotalSnagCount, updatePaymentStatus } from '@/lib/api/builder-share';

export default function ConfirmationPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { 
    builderName,
    builderEmail,
    isLoading: shareLoading, 
    error: shareError,
    currentShareId
  } = useBuilderShare();
  
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [snagCount, setSnagCount] = useState(0);
  const [localError, setLocalError] = useState<string | null>(null);
  
  // Fixed price for sharing snag list
  const SHARE_PRICE = 19.99;
  
  // Protect the route and initialize data
  useEffect(() => {
    async function loadData() {
      if (!loading) {
        if (!user) {
          debug.error('Confirmation: Not authenticated, redirecting to sign-in');
          router.replace('/signin');
          return;
        }
        
        // If we don't have builder name or email, redirect to the appropriate page
        if (!builderName) {
          debug.error('Confirmation: No builder name set, redirecting to builder selection');
          router.replace('/share/builder');
          return;
        }
        
        if (!builderEmail) {
          debug.error('Confirmation: No builder email set, redirecting to builder email');
          router.replace('/share/builder-email');
          return;
        }
        
        try {
          // Get the total number of snags for the user
          const count = await getTotalSnagCount(user.id);
          setSnagCount(count);
        } catch (error) {
          debug.error('Error fetching snag count:', error);
          setLocalError('Failed to load snag count. Please try again.');
        }
        
        setIsPageLoading(false);
      }
    }
    
    loadData();
  }, [loading, user, router, builderName, builderEmail]);
  
  // Handle payment and sharing
  const handlePayAndShare = async () => {
    if (!user || !currentShareId) {
      setLocalError('Something went wrong. Please try again.');
      return;
    }
    
    setIsProcessing(true);
    setLocalError(null);
    
    try {
      // In a real implementation, this would integrate with Stripe or another payment processor
      // For now, we'll simulate a successful payment
      debug.log('Processing payment and sharing snag list');
      
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update payment status to 'paid'
      await updatePaymentStatus(currentShareId, 'paid', 'mock_payment_intent_id');
      
      // Redirect to summary page with success message
      router.push('/snags/summary?shared=true');
    } catch (error) {
      debug.error('Error processing payment:', error);
      setLocalError('Failed to process payment. Please try again.');
      setIsProcessing(false);
    }
  };
  
  if (loading || isPageLoading) {
    return (
      <main className="flex min-h-screen flex-col">
        <Navigation isAuthenticated={!!user} />
        <div className="flex flex-1 items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </main>
    );
  }
  
  return (
    <main className="flex min-h-screen flex-col">
      <Navigation isAuthenticated={!!user} />
      <div className="flex flex-1 flex-col p-6 animate-fade-in">
        <div className="container mx-auto max-w-md">
          <div className="mb-6 flex items-center">
            <Link 
              href="/share/builder-email" 
              className="text-gray-dark hover:text-primary transition-colors flex items-center"
              aria-label="Back to builder email"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Back
            </Link>
          </div>
          
          <div className="bg-white shadow-sm rounded-xl p-6 md:p-8 border border-gray-100">
            <header className="mb-8 text-center">
              <h1 className="text-2xl md:text-3xl font-bold mb-4">Confirm & Pay</h1>
              <p className="text-gray-dark">
                Review your details before sharing your snag list with your builder.
              </p>
            </header>
            
            {(shareError || localError) && (
              <div className="bg-error/10 text-error rounded-lg p-4 border border-error/20 mb-6">
                {shareError || localError}
              </div>
            )}
            
            <div className="space-y-6">
              {/* Summary details */}
              <div className="bg-gray-50 rounded-lg p-5 border border-gray-100">
                <h2 className="text-lg font-semibold mb-4">Summary</h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-dark">Your name:</span>
                    <span className="font-medium">{user?.user_metadata?.full_name || user?.email?.split('@')[0]}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-dark">Builder name:</span>
                    <span className="font-medium">{builderName}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-dark">Builder email:</span>
                    <span className="font-medium">{builderEmail}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-dark">Snags recorded:</span>
                    <span className="font-medium">{snagCount}</span>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <div className="flex justify-between font-semibold">
                      <span>Total cost:</span>
                      <span className="text-primary">£{SHARE_PRICE.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* What you get */}
              <div className="bg-accent/20 rounded-lg p-5 border border-primary/10">
                <h2 className="text-lg font-semibold mb-3">What you get</h2>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-success mr-2 flex-shrink-0 mt-0.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-gray-dark">Professional PDF report of all your snags</span>
                  </li>
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-success mr-2 flex-shrink-0 mt-0.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-gray-dark">Immediate email delivery to your builder</span>
                  </li>
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-success mr-2 flex-shrink-0 mt-0.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-gray-dark">Copy of the report sent to your email</span>
                  </li>
                </ul>
              </div>
              
              <div className="pt-4">
                <button
                  type="button"
                  onClick={handlePayAndShare}
                  disabled={isProcessing || shareLoading}
                  className="w-full btn btn-primary rounded-pill py-3"
                  aria-label="Continue to pay and share your snag list"
                >
                  {isProcessing ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing payment...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      Continue to pay and share your snag list
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 ml-2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </span>
                  )}
                </button>
              </div>
              
              <p className="text-xs text-gray-dark text-center">
                By clicking the button above, you agree to our <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
