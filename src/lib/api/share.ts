import { supabase } from '@/lib/supabase/client';
import { debug } from '@/lib/debug';
import { ShareData } from '@/contexts/ShareContext';

/**
 * Save share data to Supabase
 * @param userId The user ID
 * @param shareData The share data to save
 * @returns The ID of the created share record
 */
export async function saveShareData(userId: string, shareData: ShareData): Promise<string | null> {
  try {
    // Log the data being saved for debugging
    debug.log(`Saving share data for user: ${userId} ${JSON.stringify(shareData, null, 2)}`);
    
    // Create a record in the shares table
    const { data, error } = await supabase
      .from('shares')
      .insert({
        user_id: userId,
        full_name: shareData.fullName,
        address: shareData.address,
        builder_type: shareData.builderType,
        builder_name: shareData.builderType === 'other' ? shareData.builderName : shareData.builderType,
        builder_email: shareData.builderEmail,
        status: 'pending_payment', // Initial status
        created_at: new Date().toISOString(),
      })
      .select('id')
      .single();
    
    if (error) {
      debug.error(`Error saving share data: ${JSON.stringify(error, null, 2)}`);
      throw error;
    }
    
    debug.log(`Share data saved successfully with ID: ${data?.id}`);
    
    return data?.id || null;
  } catch (error) {
    debug.error(`Error in saveShareData: ${JSON.stringify(error, null, 2)}`);
    return null;
  }
}

/**
 * Update the status of a share
 * @param shareId The ID of the share
 * @param status The new status
 * @returns Success boolean
 */
export async function updateShareStatus(shareId: string, status: 'pending_payment' | 'paid' | 'sent' | 'failed'): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('shares')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', shareId);
    
    if (error) {
      debug.error(`Error updating share status: ${JSON.stringify(error, null, 2)}`);
      throw error;
    }
    
    return true;
  } catch (error) {
    debug.error(`Error in updateShareStatus: ${JSON.stringify(error, null, 2)}`);
    return false;
  }
}

/**
 * Get all shares for a user
 * @param userId The user ID
 * @returns Array of shares
 */
export async function getUserShares(userId: string) {
  try {
    const { data, error } = await supabase
      .from('shares')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      debug.error(`Error getting user shares: ${JSON.stringify(error, null, 2)}`);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    debug.error(`Error in getUserShares: ${JSON.stringify(error, null, 2)}`);
    return [];
  }
}

/**
 * Get a specific share by ID
 * @param shareId The ID of the share to retrieve
 * @returns The share object or null if not found
 */
export async function getShareById(shareId: string) {
  try {
    const { data, error } = await supabase
      .from('shares')
      .select('*')
      .eq('id', shareId)
      .single();
    
    if (error) {
      debug.error(`Error getting share by ID: ${JSON.stringify(error, null, 2)}`);
      throw error;
    }
    
    return data;
  } catch (error) {
    debug.error(`Error in getShareById: ${JSON.stringify(error, null, 2)}`);
    return null;
  }
}
