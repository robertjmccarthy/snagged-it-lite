import { supabase } from '@/lib/supabase/client';
import { debug } from '@/lib/debug';
import { getActiveSnagList } from '@/lib/api/snag-list';

export interface ChecklistItem {
  id: number;
  category_id: number;
  original_text: string;
  friendly_text: string;
  display_order: number;
}

export interface ChecklistCategory {
  id: number;
  name: string;
  slug: string;
  display_order: number;
}

export interface Snag {
  id: string;
  user_id: string;
  checklist_item_id: number;
  note: string | null;
  photo_url: string | null;
  created_at: string;
}

export interface UserProgress {
  id: string;
  user_id: string;
  category_slug: string;
  current_step: number;
  is_complete: boolean;
  created_at: string;
  updated_at: string;
}

// Get all checklist items for a specific category
export async function getChecklistItems(categorySlug: string): Promise<ChecklistItem[]> {
  const { data, error } = await supabase
    .from('checklist_items')
    .select('*')
    .eq('category_id', supabase.from('checklist_categories').select('id').eq('slug', categorySlug))
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching checklist items:', error);
    throw error;
  }

  return data || [];
}

// Get a specific checklist item by its ID
export async function getChecklistItem(itemId: number): Promise<ChecklistItem | null> {
  const { data, error } = await supabase
    .from('checklist_items')
    .select('*')
    .eq('id', itemId)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 is "No rows returned" which we handle as null
    console.error('Error fetching checklist item:', error);
    throw error;
  }

  return data || null;
}

// Get a specific checklist item by its display order in a category
export async function getChecklistItemByOrder(categorySlug: string, order: number): Promise<ChecklistItem | null> {
  debug.log(`Fetching checklist item for ${categorySlug} with order ${order}`);
  
  // First get the category ID
  const { data: categoryData, error: categoryError } = await supabase
    .from('checklist_categories')
    .select('id')
    .eq('slug', categorySlug)
    .single();

  if (categoryError) {
    debug.error(`Error fetching category ID for ${categorySlug}:`, categoryError);
    return null;
  }

  debug.log(`Found category ID: ${categoryData?.id} for ${categorySlug}`);

  // Then get the checklist item with the matching display_order
  const { data, error } = await supabase
    .from('checklist_items')
    .select('*')
    .eq('category_id', categoryData.id)
    .eq('display_order', order)
    .single();

  if (error) {
    if (error.code === 'PGRST116') { // No rows returned
      debug.error(`No checklist item found for ${categorySlug} with order ${order}`);
      return null;
    }
    debug.error(`Error fetching checklist item by order:`, error);
    throw error;
  }

  debug.log(`Found checklist item:`, data);
  return data;
}

// Get the total number of checklist items in a category
export async function getChecklistItemCount(categorySlug: string): Promise<number> {
  debug.log(`Counting checklist items for ${categorySlug}`);
  
  // First get the category ID
  const { data: categoryData, error: categoryError } = await supabase
    .from('checklist_categories')
    .select('id')
    .eq('slug', categorySlug)
    .single();

  if (categoryError) {
    debug.error(`Error fetching category ID for ${categorySlug}:`, categoryError);
    return 0;
  }

  debug.log(`Found category ID: ${categoryData?.id} for ${categorySlug}`);

  // Then count the checklist items for this category
  const { count, error } = await supabase
    .from('checklist_items')
    .select('*', { count: 'exact', head: true })
    .eq('category_id', categoryData.id);

  if (error) {
    debug.error('Error counting checklist items:', error);
    throw error;
  }

  debug.log(`Found ${count} checklist items for ${categorySlug}`);
  return count || 0;
}

// Get all snags for a specific user and checklist item that belong to the active snag list
export async function getSnags(userId: string, checklistItemId: number): Promise<Snag[]> {
  try {
    debug.log(`Fetching snags for user ${userId} and checklist item ${checklistItemId}`);
    
    // Step 1: Get the active snag list ID for this user
    const activeSnagList = await getActiveSnagList(userId);
    
    if (!activeSnagList) {
      debug.log('No active snag list found, returning empty array');
      return [];
    }
    
    debug.log(`Found active snag list: ${activeSnagList.id}`);
    
    // Step 2: Get snags that belong to this user, checklist item, and active snag list
    const { data, error } = await supabase
      .from('snags')
      .select('*')
      .eq('user_id', userId)
      .eq('checklist_item_id', checklistItemId)
      .eq('snag_list_id', activeSnagList.id) // Only get snags from the active snag list
      .order('created_at', { ascending: false });

    if (error) {
      debug.error('Error fetching snags:', error);
      throw error;
    }

    debug.log(`Found ${data?.length || 0} snags for checklist item ${checklistItemId}`);
    return data || [];
  } catch (error) {
    debug.error(`Error in getSnags: ${error}`);
    return [];
  }
}

/**
 * Create a new snag in the database
 * 
 * @param userId - The ID of the user creating the snag
 * @param checklistItemId - The ID of the checklist item this snag is associated with
 * @param note - Optional text description of the snag
 * @param photoUrl - Optional URL to a photo of the snag
 * @returns The created snag object
 */
export async function createSnag(
  userId: string,
  checklistItemId: number,
  note: string | null,
  photoUrl: string | null
): Promise<Snag> {
  try {
    debug.log('Creating new snag', {
      userId,
      checklistItemId,
      hasNote: !!note,
      hasPhoto: !!photoUrl
    });
    
    // Validate inputs
    if (!userId) {
      throw new Error('User ID is required to create a snag');
    }
    
    if (!checklistItemId) {
      throw new Error('Checklist item ID is required to create a snag');
    }
    
    // At least one of note or photoUrl must be provided
    if (!note && !photoUrl) {
      throw new Error('Either a note or a photo must be provided for a snag');
    }
    
    // Get the active snag list for this user
    debug.log('Getting active snag list for user:', userId);
    const activeSnagList = await getActiveSnagList(userId);
    
    // If no active snag list exists, create one
    let snagListId = null;
    if (activeSnagList) {
      debug.log('Found active snag list:', activeSnagList.id);
      snagListId = activeSnagList.id;
    } else {
      debug.log('No active snag list found, creating a new one');
      const { data: newSnagList, error: createError } = await supabase
        .from('snag_lists')
        .insert({
          user_id: userId,
          name: `Snag List ${new Date().toLocaleDateString()}`,
          is_active: true
        })
        .select('id')
        .single();
      
      if (createError) {
        debug.error('Error creating new snag list:', createError);
        throw new Error(`Failed to create snag list: ${createError.message}`);
      }
      
      snagListId = newSnagList.id;
      debug.log('Created new active snag list:', snagListId);
    }
    
    // Insert the snag into the database with the snag list ID
    const { data, error } = await supabase
      .from('snags')
      .insert([
        {
          user_id: userId,
          checklist_item_id: checklistItemId,
          note,
          photo_url: photoUrl,
          snag_list_id: snagListId, // Associate with the active snag list
        },
      ])
      .select()
      .single();

    if (error) {
      debug.error('Error creating snag in database:', error);
      throw new Error(`Failed to create snag: ${error.message}`);
    }

    debug.log('Snag created successfully:', data);
    return data;
  } catch (error: any) {
    debug.error('Error in createSnag function:', error);
    throw new Error(`Failed to create snag: ${error.message || 'Unknown error'}`);
  }
}

// Delete a snag
export async function deleteSnag(userId: string, snagId: string): Promise<void> {
  const { error } = await supabase
    .from('snags')
    .delete()
    .eq('id', snagId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting snag:', error);
    throw error;
  }
}

// Get user progress for a category
export async function getUserProgress(userId: string, categorySlug: string): Promise<UserProgress | null> {
  try {
    // Sanitize the category slug by removing any positional indexes (e.g., 'outside:1' -> 'outside')
    const sanitizedCategorySlug = categorySlug.split(':')[0];
    
    debug.log(`Getting user progress for user ${userId} and category ${sanitizedCategorySlug}`);
    
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('category_slug', sanitizedCategorySlug)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // PGRST116 is "No rows returned" which we handle as null
        debug.log(`No progress found for user ${userId} and category ${sanitizedCategorySlug}`);
        return null;
      }
      
      debug.error(`Error fetching user progress for ${sanitizedCategorySlug}:`, error);
      throw new Error(`Failed to fetch user progress: ${error.message}`);
    }

    debug.log(`Found progress for ${sanitizedCategorySlug}:`, data);
    return data;
  } catch (error: any) {
    debug.error('Error in getUserProgress:', error);
    throw new Error(`Failed to get user progress: ${error.message || 'Unknown error'}`);
  }
}

// Create or update user progress
export async function updateUserProgress(
  userId: string,
  categorySlug: string,
  currentStep: number,
  isComplete: boolean = false
): Promise<UserProgress> {
  try {
    // Sanitize the category slug by removing any positional indexes (e.g., 'outside:1' -> 'outside')
    const sanitizedCategorySlug = categorySlug.split(':')[0];
    
    debug.log(`Updating user progress for user ${userId}, category ${sanitizedCategorySlug}, step ${currentStep}, complete: ${isComplete}`);
    
    // First check if a record exists
    const existingProgress = await getUserProgress(userId, sanitizedCategorySlug);

    if (existingProgress) {
      debug.log(`Updating existing progress record with ID ${existingProgress.id}`);
      // Update existing record
      const { data, error } = await supabase
        .from('user_progress')
        .update({
          current_step: currentStep,
          is_complete: isComplete,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingProgress.id)
        .select()
        .single();

      if (error) {
        debug.error('Error updating user progress:', error);
        throw new Error(`Failed to update user progress: ${error.message}`);
      }

      debug.log('User progress updated successfully');
      return data;
    } else {
      debug.log('Creating new progress record');
      // Use upsert to handle potential conflicts with unique constraints
      const { data, error } = await supabase
        .from('user_progress')
        .upsert(
          {
            user_id: userId,
            category_slug: sanitizedCategorySlug,
            current_step: currentStep,
            is_complete: isComplete,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          { 
            onConflict: 'user_id,category_slug',
            ignoreDuplicates: false
          }
        )
        .select()
        .single();

      if (error) {
        debug.error('Error creating user progress:', error);
        throw new Error(`Failed to create user progress: ${error.message}`);
      }

      debug.log('New user progress created successfully');
      return data;
    }
  } catch (error: any) {
    debug.error('Error in updateUserProgress:', error);
    throw new Error(`Failed to update user progress: ${error.message || 'Unknown error'}`);
  }
}

// Get count of snags for a user in a specific category that belong to the active snag list
export async function getSnagCountForCategory(userId: string, categorySlug: string): Promise<number> {
  try {
    debug.log(`Counting snags for user ${userId} in category ${categorySlug}`);
    
    // Step 1: Get the active snag list ID for this user
    const activeSnagList = await getActiveSnagList(userId);
    
    if (!activeSnagList) {
      debug.log('No active snag list found, returning 0');
      return 0;
    }
    
    debug.log(`Found active snag list: ${activeSnagList.id}`);
    
    // Step 2: Get the category ID
    const { data: categoryData, error: categoryError } = await supabase
      .from('checklist_categories')
      .select('id')
      .eq('slug', categorySlug)
      .single();

    if (categoryError) {
      debug.error('Error fetching category ID:', categoryError);
      throw categoryError;
    }

    // Step 3: Get all checklist item IDs for this category
    const { data: itemsData, error: itemsError } = await supabase
      .from('checklist_items')
      .select('id')
      .eq('category_id', categoryData.id);

    if (itemsError) {
      debug.error('Error fetching checklist items:', itemsError);
      throw itemsError;
    }

    // Extract just the IDs into an array
    const itemIds = itemsData.map(item => item.id);

    // If no items found, return 0
    if (itemIds.length === 0) {
      debug.log('No checklist items found for this category, returning 0');
      return 0;
    }

    // Step 4: Count the snags that belong to the active snag list
    const { count, error } = await supabase
      .from('snags')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('snag_list_id', activeSnagList.id) // Only count snags from the active snag list
      .in('checklist_item_id', itemIds);

    if (error) {
      debug.error('Error counting snags for category:', error);
      throw error;
    }

    debug.log(`Found ${count || 0} snags for category ${categorySlug}`);
    return count || 0;
  } catch (error) {
    debug.error(`Error in getSnagCountForCategory: ${error}`);
    return 0;
  }
}

// Get all snags for a user with checklist item details that belong to the active snag list
export async function getAllUserSnags(userId: string): Promise<any[]> {
  try {
    debug.log(`Fetching all snags for user ${userId} from active snag list`);
    
    // Step 1: Get the active snag list ID for this user
    const activeSnagList = await getActiveSnagList(userId);
    
    if (!activeSnagList) {
      debug.log('No active snag list found, returning empty array');
      return [];
    }
    
    debug.log(`Found active snag list: ${activeSnagList.id}`);
    
    // Step 2: Get all snags that belong to this user and active snag list
    const { data, error } = await supabase
      .from('snags')
      .select('*')
      .eq('user_id', userId)
      .eq('snag_list_id', activeSnagList.id) // Only get snags from the active snag list
      .order('created_at', { ascending: false });

    if (error) {
      debug.error('Error fetching all user snags:', error);
      throw error;
    }

    // If we have snags, fetch the checklist items separately
    if (data && data.length > 0) {
      // Get all unique checklist item IDs
      const checklistItemIds = Array.from(new Set(data.map(snag => snag.checklist_item_id)));
      
      // Fetch checklist items
      const { data: checklistItems, error: itemsError } = await supabase
        .from('checklist_items')
        .select('*, checklist_categories:category_id(id, name, slug)')
        .in('id', checklistItemIds);
      
      if (itemsError) {
        debug.error('Error fetching checklist items:', itemsError);
      } else if (checklistItems) {
        // Add checklist item details to each snag
        data.forEach(snag => {
          const item = checklistItems.find(item => item.id === snag.checklist_item_id);
          if (item) {
            snag.checklist_item = item;
            snag.category = item.checklist_categories;
          }
        });
      }
    }

    debug.log(`Found ${data?.length || 0} snags for user ${userId}`);
    return data || [];
  } catch (error) {
    debug.error('Error in getAllUserSnags function:', error);
    throw error;
  }
}

// Get a specific snag by ID with checklist item details
export async function getSnagById(userId: string, snagId: string): Promise<any> {
  try {
    debug.log(`Fetching snag ${snagId} for user ${userId}`);
    
    // Basic query to get the snag
    const { data, error } = await supabase
      .from('snags')
      .select('*')
      .eq('user_id', userId)
      .eq('id', snagId)
      .single();

    if (error) {
      debug.error(`Error fetching snag ${snagId}:`, error);
      throw error;
    }

    if (data) {
      // Fetch the checklist item details
      const { data: checklistItem, error: itemError } = await supabase
        .from('checklist_items')
        .select('*, checklist_categories:category_id(id, name, slug)')
        .eq('id', data.checklist_item_id)
        .single();
      
      if (itemError) {
        debug.error(`Error fetching checklist item for snag ${snagId}:`, itemError);
      } else if (checklistItem) {
        // Add checklist item details to the snag
        data.checklist_item = checklistItem;
        data.category = checklistItem.checklist_categories;
      }
    }

    debug.log(`Found snag ${snagId}:`, data);
    return data;
  } catch (error) {
    debug.error('Error in getSnagById function:', error);
    throw error;
  }
}

// Update an existing snag
export async function updateSnag(
  userId: string,
  snagId: string,
  note: string | null,
  photoUrl: string | null
): Promise<any> {
  try {
    debug.log(`Updating snag ${snagId} for user ${userId}`);
    
    const { data, error } = await supabase
      .from('snags')
      .update({
        note,
        photo_url: photoUrl,
        // Don't update created_at to preserve the original timestamp
      })
      .eq('user_id', userId)
      .eq('id', snagId)
      .select()
      .single();

    if (error) {
      debug.error(`Error updating snag ${snagId}:`, error);
      throw new Error(`Failed to update snag: ${error.message}`);
    }

    debug.log(`Successfully updated snag ${snagId}`);
    return data;
  } catch (error: any) {
    debug.error('Error in updateSnag function:', error);
    throw new Error(`Failed to update snag: ${error.message || 'Unknown error'}`);
  }
}

import { getServiceRoleClient } from '@/lib/supabase/client';

/**
 * Upload a photo to Supabase Storage
 * 
 * This function uploads a photo to the Supabase Storage 'snags' bucket and returns the public URL.
 * It includes proper error handling and validation to ensure reliable uploads.
 * 
 * For production use, this function uses a service role client to bypass RLS policies.
 * In a real production application, this would be implemented as a secure server-side endpoint.
 */
export async function uploadSnagPhoto(userId: string, file: File): Promise<string> {
  try {
    // Validate file input
    if (!file || file.size === 0) {
      throw new Error('Invalid file: File is empty or undefined');
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit for better mobile performance
      throw new Error('File size exceeds 5MB limit');
    }
    
    // Extract file extension and create a unique filename
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const validImageTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    
    if (!validImageTypes.includes(fileExt) && !file.type.startsWith('image/')) {
      throw new Error(`Invalid file type: .${fileExt}. Only images are allowed.`);
    }
    
    // Create a unique filename with timestamp
    const timestamp = Date.now();
    
    // IMPORTANT: Use the original userId with hyphens preserved for RLS policy matching
    // The RLS policy requires: split_part(name, '/', 1) = auth.uid()
    const fileName = `${userId}/${timestamp}.${fileExt}`;
    
    debug.log('Preparing to upload photo to Supabase storage', {
      fileName,
      fileType: file.type,
      fileSize: `${(file.size / 1024).toFixed(2)} KB`
    });
    
    // Ensure user is authenticated before uploading
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData?.session) {
      debug.error('No active session found, attempting to refresh session');
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError || !refreshData.session) {
        debug.error('Session refresh failed:', refreshError);
        throw new Error('Authentication required to upload files. Please sign in again.');
      }
      
      debug.log('Session refreshed successfully');
    }
    
    // Set proper content type based on file extension
    const contentTypeMap: Record<string, string> = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp'
    };
    
    const contentType = file.type || contentTypeMap[fileExt] || 'image/jpeg';
    
    // Get the service role client to bypass RLS policies
    const serviceClient = getServiceRoleClient();
    
    // Upload the file to Supabase Storage
    debug.log(`Uploading file to 'snags' bucket with path: ${fileName}`);
    
    try {
      const { data: uploadData, error: uploadError } = await serviceClient.storage
        .from('snags')
        .upload(fileName, file, {
          contentType,
          cacheControl: '3600',
          upsert: true
        });
      
      if (uploadError) {
        debug.error('Error uploading file to Supabase storage:', uploadError);
        
        // Provide specific error messages based on the error type
        if (uploadError.message?.includes('row-level security') || 
            uploadError.message?.includes('403') || 
            uploadError.message?.includes('Unauthorized')) {
          throw new Error(
            'Storage permission denied. This could be due to one of the following reasons:\n' +
            '1. The storage bucket does not exist\n' +
            '2. Your user session is not properly authenticated\n' +
            '3. The service role client is not configured correctly'
          );
        }
        
        throw new Error(`Upload failed: ${uploadError.message}`);
      }
      
      debug.log('File uploaded successfully', uploadData);
      
      // Get the public URL for the uploaded file
      const { data: urlData } = serviceClient.storage.from('snags').getPublicUrl(fileName);
      
      if (!urlData || !urlData.publicUrl) {
        throw new Error('Failed to get public URL for uploaded file');
      }
      
      // Add cache-busting parameter to prevent browser caching
      const publicUrl = `${urlData.publicUrl}?t=${timestamp}`;
      debug.log('Generated public URL for uploaded file:', publicUrl);
      
      return publicUrl;
    } catch (uploadError: any) {
      debug.error('Upload operation failed:', uploadError);
      throw uploadError; // Rethrow to be caught by the outer try/catch
    }
  } catch (error: any) {
    debug.error('Error in uploadSnagPhoto function:', error);
    throw new Error(`Photo upload failed: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Resets a user's progress by deleting all their snags and resetting their progress
 * for both outside and inside checks.
 * 
 * @param userId - The ID of the user whose progress to reset
 */
export const resetUserProgress = async (userId: string) => {
  try {
    debug.log('Resetting user progress for user:', userId);
    
    // First, check if the user has any progress records
    const { data: existingProgress, error: fetchError } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId);
      
    if (fetchError) {
      debug.error('Error fetching existing progress:', fetchError);
      throw new Error(`Failed to fetch existing progress: ${fetchError.message}`);
    }
    
    debug.log('Existing progress records:', existingProgress);
    
    // Delete all snags for the user
    debug.log('Deleting all snags for user:', userId);
    const { error: snagDeleteError } = await supabase
      .from('snags')
      .delete()
      .eq('user_id', userId);
    
    if (snagDeleteError) {
      debug.error('Error deleting snags:', snagDeleteError);
      throw new Error(`Failed to delete snags: ${snagDeleteError.message}`);
    }
    
    debug.log('Successfully deleted all snags for user');
    
    // For outside progress, either update or insert based on whether a record exists
    const outsideProgress = existingProgress?.find(p => p.category_slug === 'outside');
    
    debug.log('Existing outside progress:', outsideProgress);
    
    let outsideResult;
    if (outsideProgress) {
      debug.log('Updating existing outside progress record');
      outsideResult = await supabase
        .from('user_progress')
        .update({
          current_step: 0,
          is_complete: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', outsideProgress.id);
    } else {
      debug.log('Creating new outside progress record');
      outsideResult = await supabase
        .from('user_progress')
        .insert({
          user_id: userId,
          category_slug: 'outside',
          current_step: 0,
          is_complete: false,
          updated_at: new Date().toISOString()
        });
    }
    
    if (outsideResult.error) {
      debug.error('Error resetting outside progress:', outsideResult.error);
      throw new Error(`Failed to reset outside progress: ${outsideResult.error.message}`);
    }
    
    debug.log('Successfully reset outside progress');
    
    // For inside progress, either update or insert based on whether a record exists
    const insideProgress = existingProgress?.find(p => p.category_slug === 'inside');
    
    debug.log('Existing inside progress:', insideProgress);
    
    let insideResult;
    if (insideProgress) {
      debug.log('Updating existing inside progress record');
      insideResult = await supabase
        .from('user_progress')
        .update({
          current_step: 0,
          is_complete: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', insideProgress.id);
    } else {
      debug.log('Creating new inside progress record');
      insideResult = await supabase
        .from('user_progress')
        .insert({
          user_id: userId,
          category_slug: 'inside',
          current_step: 0,
          is_complete: false,
          updated_at: new Date().toISOString()
        });
    }
    
    if (insideResult.error) {
      debug.error('Error resetting inside progress:', insideResult.error);
      throw new Error(`Failed to reset inside progress: ${insideResult.error.message}`);
    }
    
    debug.log('Successfully reset inside progress');
    debug.log('User progress reset complete');
  } catch (error) {
    debug.error('Error in resetUserProgress:', error);
    throw error;
  }
};
