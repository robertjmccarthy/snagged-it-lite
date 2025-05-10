import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { updatePaymentStatus } from '@/lib/api/builder-share';
import { headers } from 'next/headers';

// Initialize Stripe with your secret key
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
const stripe = new Stripe(stripeSecretKey);

// This is your Stripe webhook secret for testing your endpoint locally
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Next.js App Router API route handler
export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = headers().get('stripe-signature') || '';

    let event: Stripe.Event;

    try {
      if (!webhookSecret) {
        throw new Error('Webhook secret is not set');
      }
      
      // Verify the webhook signature
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret
      );
    } catch (err: any) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      );
    }

    // Handle specific event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const { shareId } = paymentIntent.metadata;
        
        if (shareId) {
          // Update the payment status to 'paid'
          await updatePaymentStatus(shareId, 'paid', paymentIntent.id);
          
          // Here you would also generate and email the PDF report
          // This would involve calling a service to generate the PDF
          // and another service to send emails
          console.log(`Payment for share ${shareId} succeeded`);
        }
        break;
        
      case 'payment_intent.payment_failed':
        const failedPaymentIntent = event.data.object as Stripe.PaymentIntent;
        const failedShareId = failedPaymentIntent.metadata.shareId;
        
        if (failedShareId) {
          // Update the payment status to 'failed'
          await updatePaymentStatus(failedShareId, 'failed', failedPaymentIntent.id);
          console.log(`Payment for share ${failedShareId} failed`);
        }
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Return a response to acknowledge receipt of the event
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}
