import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabase';
import { updatePaymentStatus } from '@/lib/api/builder-share';
import { debug } from '@/lib/debug';

// Use the admin Supabase client for server operations
const supabase = supabaseAdmin;

// Initialize Stripe with your secret key
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

// Check for missing Stripe secret key
if (!stripeSecretKey) {
  throw new Error('Missing STRIPE_SECRET_KEY in environment');
}

const stripe = new Stripe(stripeSecretKey);

export async function POST(request: Request) {
  try {
    debug.log('API: Received payment intent creation request');
    const { shareId, userId } = await request.json();
    
    debug.log('API: Processing payment intent for', { shareId, userId });
    
    if (!shareId || !userId) {
      debug.error('API: Missing required parameters');
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }
    
    // First, verify that the share record exists
    try {
      debug.log('API: Verifying builder share record');
      const { data, error } = await supabase
        .from('builder_shares')
        .select('id')
        .eq('id', shareId)
        .eq('user_id', userId)
        .single();
      
      if (error || !data) {
        debug.error('API: Builder share record not found:', error || 'No data returned');
        return NextResponse.json(
          { error: 'Builder share record not found' },
          { status: 404 }
        );
      }
      
      debug.log('API: Builder share record verified', data);
    } catch (dbError) {
      debug.error('API: Error verifying builder share record:', dbError);
      return NextResponse.json(
        { error: 'Error verifying builder share record' },
        { status: 500 }
      );
    }
    
    // Create a payment intent for £19.99
    debug.log('API: Creating Stripe payment intent');
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 1999, // Amount in pence (£19.99)
      currency: 'gbp',
      automatic_payment_methods: { enabled: true }, // Enable automatic payment methods for PaymentElement
      metadata: {
        shareId,
        userId,
      }
    });
    
    debug.log('API: Payment intent created successfully', { id: paymentIntent.id });
    
    // Update the builder share record with the payment intent ID
    try {
      debug.log('API: Updating payment status in database');
      await updatePaymentStatus(shareId, 'pending', paymentIntent.id);
      debug.log('API: Payment status updated successfully');
    } catch (updateError) {
      // Log the error but don't fail the request - we already have the payment intent
      debug.error('API: Error updating payment status:', updateError);
      // We can still proceed since we have the payment intent created
    }
    
    // Return the client secret to the client
    debug.log('API: Returning client secret to client');
    return NextResponse.json({ 
      clientSecret: paymentIntent.client_secret 
    });
  } catch (error) {
    debug.error('API: Error creating payment intent:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}
