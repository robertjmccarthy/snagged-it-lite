import { getStripe } from '@/lib/stripe/client';
import { debug } from '@/lib/debug';

/**
 * Initiates the Stripe checkout process for a share
 * @param shareId The ID of the share to process payment for
 * @param userId The ID of the user making the payment
 * @returns The URL to redirect to for checkout
 */
export async function initiateStripeCheckout(shareId: string, userId: string): Promise<string | null> {
  try {
    // Get the current origin (hostname + port) for the API URL
    const origin = window.location.origin;
    const apiUrl = `${origin}/api/stripe/checkout`;
    
    debug.log(`Initiating Stripe checkout for shareId: ${shareId}, userId: ${userId}`);
    debug.log(`Using API URL: ${apiUrl}`);
    
    // Call our API to create a checkout session
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        shareId,
        userId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      debug.error(`API response not OK: ${response.status} ${response.statusText}`);
      debug.error(`Error data: ${JSON.stringify(errorData, null, 2)}`);
      throw new Error(errorData.error || 'Failed to create checkout session');
    }

    const { url } = await response.json();
    return url;
  } catch (error: any) {
    debug.error(`Error initiating Stripe checkout: ${error.message}`);
    return null;
  }
}

/**
 * Redirects to the Stripe checkout page
 * @param shareId The ID of the share to process payment for
 * @param userId The ID of the user making the payment
 * @returns A boolean indicating success or failure
 */
export async function redirectToCheckout(shareId: string, userId: string): Promise<boolean> {
  try {
    const checkoutUrl = await initiateStripeCheckout(shareId, userId);
    
    if (!checkoutUrl) {
      throw new Error('Failed to get checkout URL');
    }
    
    // Redirect to the checkout URL
    window.location.href = checkoutUrl;
    return true;
  } catch (error) {
    debug.error('Error redirecting to checkout:', error);
    return false;
  }
}
