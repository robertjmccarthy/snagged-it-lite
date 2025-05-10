'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  PaymentElement,
  useStripe,
  useElements,
  Elements,
} from '@stripe/react-stripe-js';
import { getStripe, createPaymentIntent } from '@/lib/stripe/client';
import { debug } from '@/lib/debug';

interface PaymentFormProps {
  shareId: string;
  userId: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}

// The inner form component that uses the Stripe hooks
function CheckoutForm({ shareId, userId, onSuccess, onError }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't loaded yet
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      // Confirm the payment
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/snags/summary?shared=true`,
        },
        redirect: 'if_required',
      });

      if (error) {
        // Show error to your customer
        setErrorMessage(error.message || 'An unexpected error occurred.');
        onError(error.message || 'An unexpected error occurred.');
      } else {
        // Payment succeeded
        debug.log('Payment succeeded');
        onSuccess();
      }
    } catch (error: any) {
      debug.error('Error processing payment:', error);
      setErrorMessage(error.message || 'An unexpected error occurred.');
      onError(error.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      
      {errorMessage && (
        <div className="bg-error/10 text-error rounded-lg p-4 border border-error/20">
          {errorMessage}
        </div>
      )}
      
      <button
        type="submit"
        disabled={isLoading || !stripe || !elements}
        className="w-full btn btn-primary rounded-pill py-3"
        aria-label="Pay and share your snag list"
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing payment...
          </span>
        ) : (
          <span className="flex items-center justify-center">
            Pay £19.99 and share your snag list
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 ml-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </span>
        )}
      </button>
      
      <p className="text-xs text-gray-dark text-center">
        Your payment is processed securely by Stripe. We do not store your card details.
      </p>
    </form>
  );
}

// The wrapper component that sets up the Stripe Elements provider
export default function StripePaymentElement({ shareId, userId, onSuccess, onError }: PaymentFormProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Create a payment intent when the component mounts
    async function initializePayment() {
      try {
        setIsLoading(true);
        debug.log('Initializing Stripe payment with real API');
        const secret = await createPaymentIntent(shareId, userId);
        setClientSecret(secret);
      } catch (error: any) {
        debug.error('Failed to initialize payment:', error);
        setError(error.message || 'Failed to initialize payment');
        onError(error.message || 'Failed to initialize payment');
      } finally {
        setIsLoading(false);
      }
    }

    initializePayment();
  }, [shareId, userId, onError]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !clientSecret) {
    return (
      <div className="bg-error/10 text-error rounded-lg p-4 border border-error/20">
        {error || 'Failed to initialize payment. Please try again.'}
      </div>
    );
  }

  return (
    <Elements stripe={getStripe()} options={{ clientSecret }}>
      <CheckoutForm
        shareId={shareId}
        userId={userId}
        onSuccess={onSuccess}
        onError={onError}
      />
    </Elements>
  );
}
