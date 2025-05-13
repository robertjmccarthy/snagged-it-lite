import { loadStripe } from '@stripe/stripe-js';
import { debug } from '@/lib/debug';

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
let stripePromise: ReturnType<typeof loadStripe> | null = null;

export const getStripe = () => {
  if (!stripePromise) {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!key) {
      debug.error('Missing Stripe publishable key');
      return null;
    }
    stripePromise = loadStripe(key);
  }
  return stripePromise;
};

/**
 * Redirects to Stripe Checkout for the SnaggedIt payment
 * @param shareId The ID of the share to associate with the payment
 * @param email Optional customer email to pre-fill
 */
export const redirectToStripeCheckout = async (
  shareId: string,
  email?: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const stripe = await getStripe();
    
    if (!stripe) {
      throw new Error('Failed to initialize Stripe');
    }
    
    const { error } = await stripe.redirectToCheckout({
      lineItems: [
        {
          // Replace this with your actual Price ID from the Stripe Dashboard
          price: 'price_1RMycTPSz8Hl9b9dohhJ7aLH',
          quantity: 1,
        },
      ],
      mode: 'payment',
      successUrl: `${window.location.origin}/snags/share/success?share_id=${shareId}`,
      cancelUrl: `${window.location.origin}/snags/share/confirm`,
      customerEmail: email,
    });
    
    if (error) {
      debug.error(`Stripe checkout error: ${error.message}`);
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (err: any) {
    debug.error(`Error redirecting to Stripe: ${err.message}`);
    return { success: false, error: err.message };
  }
};
