import { loadStripe } from '@stripe/stripe-js';
import { debug } from '@/lib/debug';

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
// This is your test publishable API key.
const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

let stripePromise: ReturnType<typeof loadStripe> | null = null;

export const getStripe = () => {
  if (!stripePublishableKey) {
    debug.error('Missing Stripe publishable key. Payment features will not work.');
    return null;
  }
  
  if (!stripePromise) {
    stripePromise = loadStripe(stripePublishableKey);
  }
  
  return stripePromise;
};
