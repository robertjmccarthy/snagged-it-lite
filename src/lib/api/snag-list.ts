import { supabase } from '@/lib/supabase/client';
import { debug } from '@/lib/debug';
import { getUserShares } from './share';
import { getUserProgress } from './checklist';

export interface SnagList {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  share_id: string | null;
  address: string | null;
  builder_name: string | null;
  builder_email: string | null;
  shared_at: string | null;
  snag_count?: number;
}

/**
 * Create a new snag list for a user
 * @param userId The user ID
 * @param name Optional name for the snag list
 * @returns The ID of the newly created snag list
 */
export async function createNewSnagList(userId: string, name?: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('snag_lists')
      .insert({
        user_id: userId,
        name: name || `Snag List ${new Date().toLocaleDateString()}`,
        is_active: true
      })
      .select('id')
      .single();

    if (error) {
      debug.error('Error creating new snag list:', error);
      return null;
    }

    return data.id;
  } catch (error) {
    debug.error('Exception creating new snag list:', error);
    return null;
  }
}

/**
 * Get all snag lists for a user with snag counts
 * @param userId The user ID
 * @returns Array of snag lists with snag counts
 */
export async function getSnagListsForUser(userId: string): Promise<SnagList[]> {
  try {
    // First get all snag lists
    const { data: snagLists, error } = await supabase
      .from('snag_lists')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      debug.error('Error fetching snag lists:', error);
      return [];
    }

    // Now get counts for each snag list
    const listsWithCounts = await Promise.all(
      snagLists.map(async (list: any) => {
        const { count, error: countError } = await supabase
          .from('snags')
          .select('*', { count: 'exact', head: true })
          .eq('snag_list_id', list.id);

        if (countError) {
          debug.error(`Error counting snags for list ${list.id}:`, countError);
          return { ...list, snag_count: 0 };
        }

        return { ...list, snag_count: count || 0 };
      })
    );

    return listsWithCounts;
  } catch (error) {
    debug.error('Exception fetching snag lists:', error);
    return [];
  }
}

/**
 * Get a specific snag list by ID
 * @param snagListId The snag list ID
 * @returns The snag list or null if not found
 */
export async function getSnagListById(snagListId: string): Promise<SnagList | null> {
  try {
    const { data, error } = await supabase
      .from('snag_lists')
      .select('*')
      .eq('id', snagListId)
      .single();

    if (error) {
      debug.error(`Error fetching snag list ${snagListId}:`, error);
      return null;
    }

    // Get snag count
    const { count, error: countError } = await supabase
      .from('snags')
      .select('*', { count: 'exact', head: true })
      .eq('snag_list_id', snagListId);

    if (countError) {
      debug.error(`Error counting snags for list ${snagListId}:`, countError);
      return { ...data, snag_count: 0 };
    }

    return { ...data, snag_count: count || 0 };
  } catch (error) {
    debug.error(`Exception fetching snag list ${snagListId}:`, error);
    return null;
  }
}

/**
 * Get all snags for a specific snag list
 * @param snagListId The snag list ID
 * @returns Array of snags
 */
export async function getSnagsByListId(snagListId: string) {
  try {
    const { data, error } = await supabase
      .from('snags')
      .select(`
        *,
        checklist_item:checklist_item_id (
          *
        )
      `)
      .eq('snag_list_id', snagListId)
      .order('created_at', { ascending: false });

    if (error) {
      debug.error(`Error fetching snags for list ${snagListId}:`, error);
      return [];
    }

    return data;
  } catch (error) {
    debug.error(`Exception fetching snags for list ${snagListId}:`, error);
    return [];
  }
}

/**
 * Update the active snag list for a user
 * @param userId The user ID
 * @param snagListId The snag list ID to set as active
 * @returns Success status
 */
export async function setActiveSnagList(userId: string, snagListId: string): Promise<boolean> {
  try {
    // First set all lists to inactive
    const { error: updateError } = await supabase
      .from('snag_lists')
      .update({ is_active: false })
      .eq('user_id', userId);

    if (updateError) {
      debug.error('Error updating snag lists to inactive:', updateError);
      return false;
    }

    // Then set the specified list to active
    const { error } = await supabase
      .from('snag_lists')
      .update({ is_active: true })
      .eq('id', snagListId)
      .eq('user_id', userId); // Extra safety check

    if (error) {
      debug.error(`Error setting snag list ${snagListId} as active:`, error);
      return false;
    }

    return true;
  } catch (error) {
    debug.error(`Exception setting active snag list:`, error);
    return false;
  }
}

/**
 * Get the currently active snag list for a user
 * @param userId The user ID
 * @returns The active snag list or null if none found
 */
export async function getActiveSnagList(userId: string): Promise<SnagList | null> {
  try {
    debug.log('Getting active snag list for user:', userId);
    
    // First try to get a list marked as active
    const { data, error } = await supabase
      .from('snag_lists')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();

    if (error) {
      debug.log('No active snag list found with is_active=true, error code:', error.code);
      
      // If no active list found, try to get the most recent one
      if (error.code === 'PGRST116') {
        debug.log('Trying to get most recent snag list');
        
        const { data: recentList, error: recentError } = await supabase
          .from('snag_lists')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (recentError) {
          debug.error('Error fetching recent snag list:', recentError);
          return null;
        }

        debug.log('Found recent snag list:', recentList);
        
        // Set this list as active
        debug.log('Setting this list as active:', recentList.id);
        await setActiveSnagList(userId, recentList.id);
        
        // Get snag count for this list
        const { count, error: countError } = await supabase
          .from('snags')
          .select('*', { count: 'exact', head: true })
          .eq('snag_list_id', recentList.id);
          
        if (countError) {
          debug.error(`Error counting snags for list ${recentList.id}:`, countError);
          return { ...recentList, snag_count: 0 };
        }
        
        return { ...recentList, snag_count: count || 0 };
      }

      debug.error('Error fetching active snag list:', error);
      return null;
    }
    
    debug.log('Found active snag list with is_active=true:', data);
    
    // Get snag count for this list
    const { count, error: countError } = await supabase
      .from('snags')
      .select('*', { count: 'exact', head: true })
      .eq('snag_list_id', data.id);
      
    if (countError) {
      debug.error(`Error counting snags for list ${data.id}:`, countError);
      return { ...data, snag_count: 0 };
    }
    
    return { ...data, snag_count: count || 0 };
  } catch (error) {
    debug.error('Exception fetching active snag list:', error);
    return null;
  }
}

/**
 * Update a snag list with share information
 * @param snagListId The snag list ID
 * @param shareId The share ID
 * @param shareData The share data
 * @returns Success status
 */
export async function updateSnagListWithShareInfo(
  snagListId: string,
  shareId: string,
  shareData: {
    address: string;
    builder_name: string;
    builder_email: string;
  }
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('snag_lists')
      .update({
        share_id: shareId,
        address: shareData.address,
        builder_name: shareData.builder_name,
        builder_email: shareData.builder_email,
        shared_at: new Date().toISOString()
      })
      .eq('id', snagListId);

    if (error) {
      debug.error(`Error updating snag list ${snagListId} with share info:`, error);
      return false;
    }

    return true;
  } catch (error) {
    debug.error(`Exception updating snag list with share info:`, error);
    return false;
  }
}

/**
 * Ensures a snag list exists for a user when they complete their checks.
 * This function checks if both inside and outside checks are completed,
 * and if so, creates a new snag list if one doesn't already exist.
 * 
 * @param userId The user ID
 * @returns The ID of the active snag list, or null if checks are not complete
 */
export async function ensureSnagListForCompletedChecks(userId: string): Promise<string | null> {
  try {
    debug.log('Checking if user has completed all checks:', userId);
    
    // Get progress for both inside and outside checks
    const [insideProgress, outsideProgress] = await Promise.all([
      getUserProgress(userId, 'inside'),
      getUserProgress(userId, 'outside')
    ]);
    
    debug.log('Inside progress:', insideProgress);
    debug.log('Outside progress:', outsideProgress);
    
    // Check if both inside and outside checks are complete
    const bothChecksComplete = 
      insideProgress?.is_complete === true && 
      outsideProgress?.is_complete === true;
    
    if (!bothChecksComplete) {
      debug.log('User has not completed both checks yet');
      return null;
    }
    
    debug.log('User has completed both inside and outside checks');
    
    // Check if user already has an active snag list
    const activeSnagList = await getActiveSnagList(userId);
    
    if (activeSnagList) {
      debug.log('User already has an active snag list:', activeSnagList.id);
      return activeSnagList.id;
    }
    
    // Create a new snag list for the user
    debug.log('Creating new snag list for completed checks');
    const newSnagListId = await createNewSnagList(userId, `Snag List ${new Date().toLocaleDateString()}`);
    
    if (!newSnagListId) {
      debug.error('Failed to create new snag list for completed checks');
      return null;
    }
    
    debug.log('Successfully created new snag list for completed checks:', newSnagListId);
    return newSnagListId;
  } catch (error) {
    debug.error('Error ensuring snag list for completed checks:', error);
    return null;
  }
}
