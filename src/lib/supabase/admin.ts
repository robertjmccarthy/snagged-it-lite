import { createClient } from '@supabase/supabase-js';
import { debug } from '@/lib/debug';

// These environment variables will need to be set in a .env.local file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-url.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Create an admin client with service role key that can bypass RLS
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

/**
 * Safely reset a user's progress using admin privileges
 * This bypasses RLS policies
 */
export async function adminResetUserProgress(userId: string): Promise<void> {
  try {
    debug.log('Admin: Resetting user progress for user:', userId);
    
    // Delete all snags for the user
    debug.log('Admin: Deleting all snags for user');
    const { error: snagDeleteError } = await supabaseAdmin
      .from('snags')
      .delete()
      .eq('user_id', userId);
    
    if (snagDeleteError) {
      debug.error('Admin: Error deleting snags:', snagDeleteError);
      throw new Error(`Failed to delete snags: ${snagDeleteError.message}`);
    }
    
    debug.log('Admin: Successfully deleted all snags for user');
    
    // First check if outside progress record exists
    const { data: outsideProgress, error: outsideCheckError } = await supabaseAdmin
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('category_slug', 'outside')
      .single();
    
    if (outsideCheckError && outsideCheckError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      debug.error('Admin: Error checking outside progress:', outsideCheckError);
      throw new Error(`Failed to check outside progress: ${outsideCheckError.message}`);
    }
    
    // Update or insert outside progress
    if (outsideProgress) {
      debug.log('Admin: Updating existing outside progress');
      const { error: updateError } = await supabaseAdmin
        .from('user_progress')
        .update({
          current_step: 0,
          is_complete: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', outsideProgress.id);
      
      if (updateError) {
        debug.error('Admin: Error updating outside progress:', updateError);
        throw new Error(`Failed to update outside progress: ${updateError.message}`);
      }
    } else {
      debug.log('Admin: Creating new outside progress');
      const { error: insertError } = await supabaseAdmin
        .from('user_progress')
        .insert({
          user_id: userId,
          category_slug: 'outside',
          current_step: 0,
          is_complete: false,
          updated_at: new Date().toISOString()
        });
      
      if (insertError) {
        debug.error('Admin: Error inserting outside progress:', insertError);
        throw new Error(`Failed to insert outside progress: ${insertError.message}`);
      }
    }
    
    // First check if inside progress record exists
    const { data: insideProgress, error: insideCheckError } = await supabaseAdmin
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('category_slug', 'inside')
      .single();
    
    if (insideCheckError && insideCheckError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      debug.error('Admin: Error checking inside progress:', insideCheckError);
      throw new Error(`Failed to check inside progress: ${insideCheckError.message}`);
    }
    
    // Update or insert inside progress
    if (insideProgress) {
      debug.log('Admin: Updating existing inside progress');
      const { error: updateError } = await supabaseAdmin
        .from('user_progress')
        .update({
          current_step: 0,
          is_complete: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', insideProgress.id);
      
      if (updateError) {
        debug.error('Admin: Error updating inside progress:', updateError);
        throw new Error(`Failed to update inside progress: ${updateError.message}`);
      }
    } else {
      debug.log('Admin: Creating new inside progress');
      const { error: insertError } = await supabaseAdmin
        .from('user_progress')
        .insert({
          user_id: userId,
          category_slug: 'inside',
          current_step: 0,
          is_complete: false,
          updated_at: new Date().toISOString()
        });
      
      if (insertError) {
        debug.error('Admin: Error inserting inside progress:', insertError);
        throw new Error(`Failed to insert inside progress: ${insertError.message}`);
      }
    }
    
    debug.log('Admin: Successfully reset user progress');
  } catch (error) {
    debug.error('Admin: Error in adminResetUserProgress:', error);
    throw error;
  }
}
