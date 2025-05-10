import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { debug } from '@/lib/debug';
import { createClient } from '@supabase/supabase-js';
import { BuilderShareData } from '@/lib/api/builder-share';

// Initialize Stripe with your secret key
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
const stripe = new Stripe(stripeSecretKey);

// Initialize Supabase with direct client for API routes
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * API handler for creating a Stripe checkout session
 * POST /api/create-checkout-session
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    debug.log('API: Received checkout session creation request');
    
    // Parse the request body
    const { amount, userId, builderName, builderEmail } = req.body;
    
    debug.log('API: Processing checkout session for', { amount, userId, builderName, builderEmail });
    
    // Validate required parameters
    if (!amount || !userId || !builderName || !builderEmail) {
      debug.error('API: Missing required parameters');
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    // Create or update the builder share record
    let shareId: string;
    try {
      console.log('[API] create-checkout-session received:', req.body);
      debug.log('API: Creating builder share record');
      
      // Create a new builder share record directly with Supabase
      const { data, error } = await supabase
        .from('builder_shares')
        .insert({
          user_id: userId,
          builder_name: builderName,
          builder_email: builderEmail,
          payment_status: 'pending'
        })
        .select()
        .single();
      
      if (error) {
        console.error('[API] Supabase insert error:', error);
        debug.error('API: Error creating builder share record:', error);
        return res.status(500).json({ error: `Failed to create builder share record: ${error.message}` });
      }
      
      if (!data) {
        console.error('[API] No data returned from Supabase insert');
        debug.error('API: No data returned from builder share insert');
        return res.status(500).json({ error: 'Failed to create builder share record: No data returned' });
      }
      
      console.log('[API] Builder share inserted:', data);
      shareId = data.id;
      
      debug.log('API: Builder share record created', { shareId });
    } catch (dbError) {
      console.error('[API] create-checkout-session failed:', dbError);
      debug.error('API: Error creating builder share record:', dbError);
      return res.status(500).json({ error: 'Error creating builder share record' });
    }
    
    // Create a checkout session
    debug.log('API: Creating Stripe checkout session');
    
    // Log the URLs that will be used for redirects
    const successUrl = `${process.env.NEXT_PUBLIC_APP_URL}/share/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${process.env.NEXT_PUBLIC_APP_URL}/share/cancel`;
    
    console.log('[API] Redirect URLs:', {
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      successUrl,
      cancelUrl
    });
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'gbp',
          product_data: { 
            name: 'SnaggedIt Snag List',
            description: 'Professional PDF report of all your snags, delivered to your builder'
          },
          unit_amount: amount,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { 
        userId, 
        builderName, 
        builderEmail,
        shareId 
      },
    });
    
    debug.log('API: Checkout session created successfully', { id: session.id });
    
    // Update the builder share record with the checkout session ID
    try {
      debug.log('API: Updating payment status in database');
      console.log('[API] Updating builder share record:', { shareId, sessionId: session.id });
      
      // Update the builder share record directly with Supabase
      const { data, error } = await supabase
        .from('builder_shares')
        .update({
          payment_status: 'pending',
          payment_intent_id: session.id
        })
        .eq('id', shareId)
        .select()
        .single();
      
      if (error) {
        console.error('[API] Supabase update error:', error);
        debug.error('API: Error updating payment status:', error);
        // Don't fail the request - we already have the checkout session
      } else {
        console.log('[API] Builder share updated:', data);
        debug.log('API: Payment status updated successfully');
      }
    } catch (updateError) {
      // Log the error but don't fail the request - we already have the checkout session
      console.error('[API] Error updating payment status:', updateError);
      debug.error('API: Error updating payment status:', updateError);
    }
    
    // Return the session URL to the client
    console.log('[API] Checkout Session created:', session.id, session.url);
    debug.log('API: Returning session URL to client');
    
    // Return JSON with URL for client-side redirect
    if (!session.url) {
      throw new Error('No Stripe checkout URL available');
    }
    return res.status(200).json({ url: session.url });
  } catch (error: any) {
    debug.error('API: Error creating checkout session:', error);
    return res.status(500).json({ error: error.message || 'Failed to create checkout session' });
  }
}
