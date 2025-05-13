import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { debug } from '@/lib/debug';
import { updateShareStatus } from '@/lib/api/share';

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-04-30.basil',
});

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const sessionId = url.searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing session_id parameter' },
        { status: 400 }
      );
    }

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Check if the payment was successful
    const paymentStatus = session.payment_status;
    const paymentSuccessful = paymentStatus === 'paid';

    // If the payment was successful, update the share status
    if (paymentSuccessful && session.metadata?.shareId) {
      await updateShareStatus(session.metadata.shareId, 'paid');
    }

    return NextResponse.json({
      verified: paymentSuccessful,
      paymentStatus,
      shareId: session.metadata?.shareId,
    });
  } catch (error) {
    debug.error('Error verifying session:', error);
    return NextResponse.json(
      { error: 'Error verifying session' },
      { status: 500 }
    );
  }
}
