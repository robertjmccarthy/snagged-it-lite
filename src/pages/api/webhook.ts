import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { buffer } from 'micro';
import { updatePaymentStatus } from '@/lib/api/builder-share';
import { debug } from '@/lib/debug';

// Initialize Stripe with your secret key
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
const stripe = new Stripe(stripeSecretKey);

// Disable body parsing, need the raw body for webhook signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * API handler for Stripe webhooks
 * POST /api/webhook
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    debug.log('Webhook: Received Stripe webhook event');
    
    // Get the raw body for signature verification
    const rawBody = await buffer(req);
    const signature = req.headers['stripe-signature'] as string;
    
    if (!signature) {
      debug.error('Webhook: Missing Stripe signature');
      return res.status(400).json({ error: 'Missing Stripe signature' });
    }
    
    // Verify the webhook signature
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      debug.error('Webhook: Missing webhook secret in environment variables');
      return res.status(500).json({ error: 'Server configuration error' });
    }
    
    let event: Stripe.Event;
    
    try {
      debug.log('Webhook: Verifying webhook signature');
      event = stripe.webhooks.constructEvent(
        rawBody.toString(),
        signature,
        webhookSecret
      );
      debug.log('Webhook: Signature verified successfully');
    } catch (err: any) {
      debug.error('Webhook: Signature verification failed:', err);
      return res.status(400).json({ error: `Webhook signature verification failed: ${err.message}` });
    }
    
    // Handle the event based on its type
    debug.log('Webhook: Processing event type:', event.type);
    
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;
      default:
        debug.log('Webhook: Unhandled event type:', event.type);
    }
    
    // Return a 200 response to acknowledge receipt of the event
    debug.log('Webhook: Event processed successfully');
    return res.status(200).json({ received: true });
  } catch (error: any) {
    debug.error('Webhook: Error processing webhook:', error);
    return res.status(500).json({ error: error.message || 'Failed to process webhook' });
  }
}

/**
 * Handle a successful payment intent
 */
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  debug.log('Webhook: Processing successful payment intent:', paymentIntent.id);
  
  try {
    const { shareId } = paymentIntent.metadata;
    
    if (!shareId) {
      debug.error('Webhook: Missing shareId in payment intent metadata');
      return;
    }
    
    debug.log('Webhook: Updating payment status to completed for share:', shareId);
    await updatePaymentStatus(shareId, 'completed', paymentIntent.id);
    debug.log('Webhook: Payment status updated successfully');
  } catch (error) {
    debug.error('Webhook: Error handling successful payment:', error);
  }
}

/**
 * Handle a failed payment intent
 */
async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  debug.log('Webhook: Processing failed payment intent:', paymentIntent.id);
  
  try {
    const { shareId } = paymentIntent.metadata;
    
    if (!shareId) {
      debug.error('Webhook: Missing shareId in payment intent metadata');
      return;
    }
    
    debug.log('Webhook: Updating payment status to failed for share:', shareId);
    await updatePaymentStatus(shareId, 'failed', paymentIntent.id);
    debug.log('Webhook: Payment status updated successfully');
  } catch (error) {
    debug.error('Webhook: Error handling failed payment:', error);
  }
}
