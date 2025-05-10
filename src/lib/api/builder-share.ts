import { supabase as clientSupabase } from '@/lib/supabase/client';
import { debug } from '@/lib/debug';
import { createClient } from '@supabase/supabase-js';

// Determine if we're in a server environment (API routes, getServerSideProps, etc.)
const isServer = typeof window === 'undefined';

// Initialize the appropriate Supabase client based on the environment
let supabase: ReturnType<typeof createClient>;

if (isServer) {
  // Server-side: Use service role key for privileged operations
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  // Check for missing environment variables
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment');
  }
  
  // Create a Supabase client with the service role key for server operations
  supabase = createClient(supabaseUrl, supabaseServiceKey);
  debug.log('Using server-side Supabase client with service role key');
} else {
  // Client-side: Use the public client
  supabase = clientSupabase;
  debug.log('Using client-side Supabase client');
}

// Interface for builder share data
export interface BuilderShareData {
  id?: string;
  user_id: string;
  builder_name: string;
  builder_email: string;
  payment_status?: string;
  payment_intent_id?: string;
  pdf_url?: string;
  email_sent?: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * Create a new builder share record
 * @param userId - The user's ID
 * @param builderName - The builder's name
 * @param builderEmail - The builder's email
 * @returns The created builder share record
 */
export async function createBuilderShare(
  userId: string,
  builderName: string,
  builderEmail: string
): Promise<BuilderShareData> {
  
  debug.log('Creating builder share record', { userId, builderName, builderEmail });
  
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
    debug.error('Error creating builder share record:', error);
    throw new Error(`Failed to create builder share record: ${error.message}`);
  }
  
  debug.log('Builder share record created successfully', data);
  return data;
}

/**
 * Get the latest builder share record for a user
 * @param userId - The user's ID
 * @returns The latest builder share record or null if none exists
 */
export async function getLatestBuilderShare(userId: string): Promise<BuilderShareData | null> {
  
  debug.log('Fetching latest builder share record for user', userId);
  
  try {
    // First try to get the record with single() which expects exactly one result
    const { data, error } = await supabase
      .from('builder_shares')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(); // Use maybeSingle instead of single to avoid errors when no records exist
    
    if (error) {
      debug.error('Error fetching builder share record:', error);
      throw new Error(`Failed to fetch builder share record: ${error.message}`);
    }
    
    if (!data) {
      debug.log('No builder share records found for user', userId);
      return null;
    }
    
    debug.log('Builder share record fetched successfully', data);
    return data;
  } catch (error: any) {
    debug.error('Exception fetching builder share record:', error);
    // Return null instead of throwing to make the function more robust
    return null;
  }
}

/**
 * Update a builder share record
 * @param shareId - The ID of the builder share record
 * @param updateData - The data to update
 * @returns The updated builder share record
 */
export async function updateBuilderShare(
  shareId: string,
  updateData: Partial<BuilderShareData>
): Promise<BuilderShareData> {
  
  debug.log('Updating builder share record', { shareId, updateData });
  
  const { data, error } = await supabase
    .from('builder_shares')
    .update(updateData)
    .eq('id', shareId)
    .select()
    .single();
  
  if (error) {
    debug.error('Error updating builder share record:', error);
    throw new Error(`Failed to update builder share record: ${error.message}`);
  }
  
  debug.log('Builder share record updated successfully', data);
  return data;
}

/**
 * Update the payment status of a builder share record
 * @param shareId - The ID of the builder share record
 * @param paymentStatus - The new payment status
 * @param paymentIntentId - The Stripe payment intent ID
 * @returns The updated builder share record
 */
export async function updatePaymentStatus(
  shareId: string,
  paymentStatus: string,
  paymentIntentId?: string
): Promise<BuilderShareData> {
  const updateData: Partial<BuilderShareData> = {
    payment_status: paymentStatus
  };
  
  if (paymentIntentId) {
    updateData.payment_intent_id = paymentIntentId;
  }
  
  return updateBuilderShare(shareId, updateData);
}

/**
 * Get the total count of snags for a user
 * @param userId - The user's ID
 * @returns The total count of snags
 */
export async function getTotalSnagCount(userId: string): Promise<number> {
  
  debug.log('Fetching total snag count for user', userId);
  
  const { count, error } = await supabase
    .from('snags')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);
  
  if (error) {
    debug.error('Error fetching snag count:', error);
    throw new Error(`Failed to fetch snag count: ${error.message}`);
  }
  
  debug.log('Total snag count:', count);
  return count || 0;
}
