import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe once and export the promise
export const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
