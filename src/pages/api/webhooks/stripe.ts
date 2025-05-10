import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { buffer } from 'micro';
import { createClient } from '@supabase/supabase-js';
import { debug } from '@/lib/debug';

// Initialize Stripe with your secret key
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
const stripe = new Stripe(stripeSecretKey);

// Initialize Supabase with direct client for API routes
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Disable body parsing, need the raw body for webhook signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * API handler for Stripe webhooks
 * POST /api/webhooks/stripe
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
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
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
 * Handle a completed checkout session
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  debug.log('Webhook: Processing completed checkout session:', session.id);
  console.log('[Webhook] Processing completed checkout session:', session.id);
  
  try {
    const { shareId } = session.metadata || {};
    
    if (!shareId) {
      console.error('[Webhook] Missing shareId in checkout session metadata');
      debug.error('Webhook: Missing shareId in checkout session metadata');
      return;
    }
    
    console.log('[Webhook] Updating payment status for share:', shareId);
    debug.log('Webhook: Updating payment status to completed for share:', shareId);
    
    // Update the builder share record with the completed status directly with Supabase
    const { data, error } = await supabase
      .from('builder_shares')
      .update({
        payment_status: 'completed',
        payment_intent_id: session.id
      })
      .eq('id', shareId)
      .select()
      .single();
    
    if (error) {
      console.error('[Webhook] Supabase update error:', error);
      debug.error('Webhook: Error updating payment status:', error);
      return;
    }
    
    console.log('[Webhook] Builder share updated:', data);
    debug.log('Webhook: Payment status updated successfully');
    
    // TODO: Generate and send PDF report to builder and user
    // This would typically be handled by a separate serverless function
    // or background job to avoid blocking the webhook response
    
  } catch (error) {
    console.error('[Webhook] Error handling completed checkout session:', error);
    debug.error('Webhook: Error handling completed checkout session:', error);
  }
}
