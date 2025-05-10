import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase/client';
import { updatePaymentStatus } from '@/lib/api/builder-share';
import { debug } from '@/lib/debug';

// Initialize Stripe with your secret key
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
const stripe = new Stripe(stripeSecretKey);

/**
 * API handler for creating a Stripe payment intent
 * POST /api/payment
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    debug.log('API: Received payment intent creation request');
    
    // Parse the request body
    let { shareId } = req.body;
    const { userId } = req.body;
    
    debug.log('API: Processing payment intent for', { shareId, userId });
    
    // Validate required parameters
    if (!shareId || !userId) {
      debug.error('API: Missing required parameters');
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    // Verify that the builder share record exists
    try {
      debug.log('API: Verifying builder share record', { shareId, userId });
      
      // First, let's log all builder shares for this user to debug
      const allSharesQuery = await supabase
        .from('builder_shares')
        .select('*')
        .eq('user_id', userId);
        
      if (allSharesQuery.error) {
        debug.error('API: Error querying all builder shares:', allSharesQuery.error);
      } else {
        debug.log('API: All builder shares for user:', allSharesQuery.data);
      }
      
      // Now check for the specific share
      const { data, error } = await supabase
        .from('builder_shares')
        .select('*')
        .eq('id', shareId)
        .maybeSingle();
      
      if (error) {
        debug.error('API: Error querying builder share record:', error);
        return res.status(500).json({ error: `Database error: ${error.message}` });
      }
      
      if (!data) {
        debug.error('API: Builder share record not found for ID:', shareId);
        
        // If the specific share wasn't found, try to get the latest share for this user
        const latestShareQuery = await supabase
          .from('builder_shares')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
          
        if (latestShareQuery.error || !latestShareQuery.data) {
          debug.error('API: No builder shares found for user:', userId);
          return res.status(404).json({ error: 'No builder share records found for this user' });
        }
        
        // Use the latest share instead
        debug.log('API: Using latest builder share instead:', latestShareQuery.data);
        shareId = latestShareQuery.data.id;
      } else {
        debug.log('API: Builder share record verified', data);
      }
    } catch (dbError) {
      debug.error('API: Error verifying builder share record:', dbError);
      return res.status(500).json({ error: 'Error verifying builder share record' });
    }
    
    // Create a payment intent for £19.99
    debug.log('API: Creating Stripe payment intent');
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 1999, // Amount in pence (£19.99)
      currency: 'gbp',
      automatic_payment_methods: { enabled: true },
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
    }
    
    // Return the client secret to the client
    debug.log('API: Returning client secret to client');
    return res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error: any) {
    debug.error('API: Error creating payment intent:', error);
    return res.status(500).json({ error: error.message || 'Failed to create payment intent' });
  }
}
