import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import Navigation from '@/components/Navigation';
import Link from 'next/link';
import { debug } from '@/lib/debug';

// Define the type for our server-side props
type SuccessPageProps = {
  paymentStatus: 'success' | 'pending' | 'failed';
  error?: string;
  sessionId?: string;
};

// Server-side data fetching
export const getServerSideProps: GetServerSideProps<SuccessPageProps> = async ({ query }) => {
  console.log('[Server] getServerSideProps called with query:', query);
  
  const sessionId = query.session_id as string;
  console.log('[Server] Session ID from query:', sessionId);
  
  if (!sessionId) {
    console.log('[Server] No session ID provided, returning failed status');
    return { 
      props: { 
        paymentStatus: 'failed', 
        error: 'No session ID provided' 
      } 
    };
  }
  
  try {
    // Initialize Stripe with your secret key
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');
    
    // Initialize Supabase with server-side credentials
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );
    
    // 1. Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent']
    });
    
    console.log('[Server] Stripe session retrieved:', {
      id: session.id,
      paymentStatus: session.payment_status,
      metadata: session.metadata
    });
    
    // 2. If payment was successful, update the database
    if (session.payment_status === 'paid') {
      const { shareId } = session.metadata || {};
      
      if (shareId) {
        // Update the builder share record with completed status
        const { data, error } = await supabase
          .from('builder_shares')
          .update({
            payment_status: 'completed',
            payment_intent_id: typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id || session.id
          })
          .eq('id', shareId)
          .select()
          .single();
        
        if (error) {
          console.error('[Server] Error updating builder share record:', error);
          return { 
            props: { 
              paymentStatus: 'success', 
              error: 'Payment successful, but there was an error updating your records',
              sessionId
            } 
          };
        }
        
        console.log('[Server] Builder share record updated:', data);
        
        // TODO: Generate and email PDF to builder and user
        // This would typically be handled by a separate serverless function
      }
      
      return { 
        props: { 
          paymentStatus: 'success',
          sessionId
        } 
      };
    } else {
      // Payment is not completed yet or failed
      return { 
        props: { 
          paymentStatus: session.payment_status === 'unpaid' ? 'pending' : 'failed',
          error: `Payment ${session.payment_status}`,
          sessionId
        } 
      };
    }
  } catch (error: any) {
    console.error('[Server] Error verifying payment:', error);
    return { 
      props: { 
        paymentStatus: 'failed', 
        error: error.message || 'An error occurred while verifying your payment',
        sessionId
      } 
    };
  }
};

export default function SuccessPage({ paymentStatus, error, sessionId }: SuccessPageProps) {
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);
  
  // Use useEffect to handle client-side navigation
  useEffect(() => {
    // Only run this effect on the client side
    if (typeof window !== 'undefined') {
      // Redirect to the summary page after a short delay if payment was successful
      if (paymentStatus === 'success' && !redirecting) {
        setRedirecting(true);
        const redirectTimer = setTimeout(() => {
          window.location.href = '/snags/summary?shared=true';
        }, 5000);
        
        // Clean up the timer if the component unmounts
        return () => clearTimeout(redirectTimer);
      }
    }
  }, [paymentStatus, redirecting]);

  // Show loading state while redirecting
  if (paymentStatus === 'success' && redirecting) {
    return (
      <main className="flex min-h-screen flex-col">
        <Navigation isAuthenticated={true} />
        <div className="flex flex-1 items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </main>
    );
  }

  // Show error state
  if (error) {
    return (
      <main className="flex min-h-screen flex-col">
        <Navigation isAuthenticated={false} />
        <div className="flex flex-1 flex-col p-6">
          <div className="container mx-auto max-w-md">
            <div className="bg-error/10 text-error rounded-lg p-4 border border-error/20 mb-4">
              {error}
            </div>
            <Link 
              href="/share/confirm" 
              className="btn btn-primary w-full"
            >
              Try again
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Show success state
  if (paymentStatus === 'success') {
    return (
      <main className="flex min-h-screen flex-col">
        <Navigation isAuthenticated={true} />
        <div className="flex flex-1 flex-col p-6 animate-fade-in">
          <div className="container mx-auto max-w-md">
            <div className="bg-white shadow-sm rounded-xl p-6 md:p-8 border border-gray-100">
              <div className="flex justify-center mb-6">
                <div className="bg-success/20 rounded-full p-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-success">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              
              <h1 className="text-2xl font-bold text-center mb-4">Payment Successful!</h1>
              
              <p className="text-gray-dark text-center mb-6">
                Your snag list has been shared with your builder. You will receive a confirmation email shortly.
              </p>
              
              <div className="bg-accent/20 rounded-lg p-5 border border-primary/10 mb-6">
                <h2 className="text-lg font-semibold mb-3">What happens next?</h2>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-primary mr-2 flex-shrink-0 mt-0.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                    <span>Your builder will receive an email with your snag list PDF</span>
                  </li>
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-primary mr-2 flex-shrink-0 mt-0.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                    <span>You'll also receive a copy of the PDF for your records</span>
                  </li>
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-primary mr-2 flex-shrink-0 mt-0.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>You'll be redirected to your snag summary in a few seconds</span>
                  </li>
                </ul>
              </div>
              
              <Link 
                href="/snags/summary" 
                className="btn btn-primary w-full"
              >
                Go to Snag Summary
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Show pending state (fallback)
  return (
    <main className="flex min-h-screen flex-col">
      <Navigation isAuthenticated={false} />
      <div className="flex flex-1 flex-col p-6">
        <div className="container mx-auto max-w-md">
          <div className="bg-white shadow-sm rounded-xl p-6 md:p-8 border border-gray-100">
            <h1 className="text-2xl font-bold text-center mb-4">Verifying Payment...</h1>
            <p className="text-gray-dark text-center mb-6">
              We're confirming your payment with Stripe. This should only take a moment.
            </p>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
