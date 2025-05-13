import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { debug } from '@/lib/debug';
import { updateShareStatus } from '@/lib/api/share';

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-04-30.basil',
});

// This is your Stripe CLI webhook secret for testing your endpoint locally
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(req: NextRequest) {
  const payload = await req.text();
  const sig = req.headers.get('stripe-signature') || '';
  
  let event: Stripe.Event;

  try {
    // Verify the webhook signature
    event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
  } catch (err: any) {
    debug.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      
      // Retrieve the shareId and userId from the metadata
      const { shareId, userId } = session.metadata || {};
      
      if (shareId) {
        // Update the share status to paid
        await updateShareStatus(shareId, 'paid');
        
        // In a real-world application, you would also trigger an email to the builder here
        // or queue a background job to send the email
        debug.log(`Payment completed for share ${shareId}`);
      }
      break;
    }
    
    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const { shareId } = paymentIntent.metadata || {};
      
      if (shareId) {
        // Update the share status to failed
        await updateShareStatus(shareId, 'failed');
        debug.error(`Payment failed for share ${shareId}`);
      }
      break;
    }
    
    default:
      // Unexpected event type
      debug.log(`Unhandled event type: ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  return NextResponse.json({ received: true });
}
