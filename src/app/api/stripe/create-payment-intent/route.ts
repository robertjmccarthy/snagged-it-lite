import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase/client';
import { updatePaymentStatus } from '@/lib/api/builder-share';

// Initialize Stripe with your secret key
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
const stripe = new Stripe(stripeSecretKey);

// Next.js App Router API route handler
export async function POST(request: Request) {
  try {
    const { shareId, userId } = await request.json();
    
    if (!shareId || !userId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }
    
    // First, verify that the share record exists
    try {
      const { data, error } = await supabase
        .from('builder_shares')
        .select('id')
        .eq('id', shareId)
        .eq('user_id', userId)
        .single();
      
      if (error || !data) {
        console.error('Builder share record not found:', error || 'No data returned');
        return NextResponse.json(
          { error: 'Builder share record not found' },
          { status: 404 }
        );
      }
    } catch (dbError) {
      console.error('Error verifying builder share record:', dbError);
      return NextResponse.json(
        { error: 'Error verifying builder share record' },
        { status: 500 }
      );
    }
    
    // Create a payment intent for £19.99
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 1999, // Amount in pence (£19.99)
      currency: 'gbp',
      automatic_payment_methods: { enabled: true }, // Enable automatic payment methods for PaymentElement
      metadata: {
        shareId,
        userId,
      }
    });
    
    // Update the builder share record with the payment intent ID
    try {
      await updatePaymentStatus(shareId, 'pending', paymentIntent.id);
    } catch (updateError) {
      // Log the error but don't fail the request - we already have the payment intent
      console.error('Error updating payment status:', updateError);
      // We can still proceed since we have the payment intent created
    }
    
    // Return the client secret to the client
    return NextResponse.json({ 
      clientSecret: paymentIntent.client_secret 
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}
