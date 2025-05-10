import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { updatePaymentStatus } from '@/lib/api/builder-share';
import { debug } from '@/lib/debug';

// Initialize Stripe with your secret key
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
}

const stripe = new Stripe(stripeSecretKey);

// Webhook secret for verifying webhook events
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
if (!webhookSecret) {
  console.warn('Warning: STRIPE_WEBHOOK_SECRET is not defined in environment variables');
}

/**
 * API route for handling Stripe webhook events
 * POST /api/stripe-webhook
 */
export async function POST(request: Request) {
  const body = await request.text();
  const headersList = headers();
  const signature = headersList.get('stripe-signature') || '';

  debug.log('API: Received Stripe webhook event');

  let event: Stripe.Event;

  try {
    if (!webhookSecret) {
      throw new Error('Webhook secret is not set');
    }
    
    // Verify the webhook signature
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    debug.log('API: Webhook signature verified');
  } catch (err: any) {
    debug.error('API: Webhook signature verification failed:', err.message);
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${err.message}` },
      { status: 400 }
    );
  }

  // Handle the event
  try {
    debug.log('API: Processing webhook event', { type: event.type });
    
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        debug.log('API: Payment intent succeeded', { id: paymentIntent.id });
        
        // Update the payment status in the database
        if (paymentIntent.metadata.shareId) {
          try {
            await updatePaymentStatus(
              paymentIntent.metadata.shareId,
              'paid',
              paymentIntent.id
            );
            debug.log('API: Payment status updated to paid');
          } catch (error) {
            debug.error('API: Error updating payment status:', error);
          }
        } else {
          debug.error('API: Missing shareId in payment intent metadata');
        }
        break;
        
      case 'payment_intent.payment_failed':
        const failedPaymentIntent = event.data.object as Stripe.PaymentIntent;
        debug.log('API: Payment intent failed', { id: failedPaymentIntent.id });
        
        // Update the payment status in the database
        if (failedPaymentIntent.metadata.shareId) {
          try {
            await updatePaymentStatus(
              failedPaymentIntent.metadata.shareId,
              'failed',
              failedPaymentIntent.id
            );
            debug.log('API: Payment status updated to failed');
          } catch (error) {
            debug.error('API: Error updating payment status:', error);
          }
        } else {
          debug.error('API: Missing shareId in payment intent metadata');
        }
        break;
        
      default:
        debug.log(`API: Unhandled event type: ${event.type}`);
    }

    // Return a response to acknowledge receipt of the event
    return NextResponse.json({ received: true });
  } catch (error: any) {
    debug.error('API: Error processing webhook event:', error);
    return NextResponse.json(
      { error: error.message || 'Error processing webhook event' },
      { status: 500 }
    );
  }
}
