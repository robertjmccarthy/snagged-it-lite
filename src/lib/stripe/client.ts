import { loadStripe, Stripe } from '@stripe/stripe-js';
import { debug } from '@/lib/debug';

// Load the Stripe.js library with your publishable key
let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!key) {
      debug.error('Stripe publishable key is not set');
      throw new Error('Stripe publishable key is not set');
    }
    
    stripePromise = loadStripe(key);
  }
  return stripePromise;
};

// Create a payment intent and get the client secret
export const createPaymentIntent = async (shareId: string, userId: string) => {
  try {
    debug.log('Requesting payment intent creation', { shareId, userId });
    const response = await fetch('/api/payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ shareId, userId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      debug.error('Payment intent creation failed', errorData);
      throw new Error(errorData.error || 'Failed to create payment intent');
    }

    const data = await response.json();
    debug.log('Payment intent created successfully');
    return data.clientSecret;
  } catch (error) {
    debug.error('Error creating payment intent:', error);
    throw error;
  }
};
