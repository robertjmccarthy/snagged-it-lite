import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { debug } from '@/lib/debug';
import { supabase } from '@/lib/supabase/client';
import { updateShareStatus } from '@/lib/api/share';

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-04-30.basil', // Use the latest API version
});

export async function POST(req: NextRequest) {
  try {
    debug.log(`Stripe checkout API called with URL: ${req.url}`);
    
    const { shareId, userId } = await req.json();
    debug.log(`Received request with shareId: ${shareId}, userId: ${userId}`);

    if (!shareId || !userId) {
      debug.error('Missing required parameters in Stripe checkout request');
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Fetch the share data to get details for the checkout session
    debug.log(`Fetching share data for shareId: ${shareId}, userId: ${userId}`);
    
    // First, check if the share exists without using .single() to avoid the error
    const { data: shareDataArray, error: shareError } = await supabase
      .from('shares')
      .select('*')
      .eq('id', shareId)
      .eq('user_id', userId);
      
    // Log the raw query results for debugging
    debug.log(`Query results: ${JSON.stringify(shareDataArray, null, 2)}`);
    
    // Extract the first item if it exists
    const shareData = shareDataArray && shareDataArray.length > 0 ? shareDataArray[0] : null;

    if (shareError) {
      debug.error(`Error fetching share data: ${JSON.stringify(shareError, null, 2)}`);
      return NextResponse.json(
        { error: `Share not found: ${shareError.message}` },
        { status: 404 }
      );
    }
    
    if (!shareData) {
      debug.error(`Share data not found for shareId: ${shareId}, userId: ${userId}`);
      return NextResponse.json(
        { error: 'Share data not found' },
        { status: 404 }
      );
    }
    
    debug.log(`Share data found: ${JSON.stringify(shareData, null, 2)}`);

    // Create a Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: 'SnaggedIt Home Inspection Report',
              description: 'Share your snag list with your builder',
            },
            unit_amount: 1999, // £19.99 in pence
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/snags/share/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/snags/share/confirm`,
      metadata: {
        shareId,
        userId,
      },
    });

    // Update the share status to indicate payment is in progress
    await updateShareStatus(shareId, 'pending_payment');

    debug.log(`Stripe checkout session created: ${session.id}, URL: ${session.url}`);
    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    debug.error(`Error creating checkout session: ${JSON.stringify(error, null, 2)}`);
    return NextResponse.json(
      { error: `Error creating checkout session: ${error.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}
