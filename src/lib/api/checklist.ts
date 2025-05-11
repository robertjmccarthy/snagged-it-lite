import { supabase } from '@/lib/supabase/client';
import { debug } from '@/lib/debug';

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

// Get all snags for a specific user and checklist item
export async function getSnags(userId: string, checklistItemId: number): Promise<Snag[]> {
  const { data, error } = await supabase
    .from('snags')
    .select('*')
    .eq('user_id', userId)
    .eq('checklist_item_id', checklistItemId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching snags:', error);
    throw error;
  }

  return data || [];
}

// Create a new snag
export async function createSnag(
  userId: string,
  checklistItemId: number,
  note: string | null,
  photoUrl: string | null
): Promise<Snag> {
  const { data, error } = await supabase
    .from('snags')
    .insert([
      {
        user_id: userId,
        checklist_item_id: checklistItemId,
        note,
        photo_url: photoUrl,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating snag:', error);
    throw error;
  }

  return data;
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
  const { data, error } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('category_slug', categorySlug)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 is "No rows returned" which we handle as null
    console.error('Error fetching user progress:', error);
    throw error;
  }

  return data || null;
}

// Create or update user progress
export async function updateUserProgress(
  userId: string,
  categorySlug: string,
  currentStep: number,
  isComplete: boolean = false
): Promise<UserProgress> {
  try {
    // First check if a record exists
    const existingProgress = await getUserProgress(userId, categorySlug);

    if (existingProgress) {
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
        console.error('Error updating user progress:', error);
        throw error;
      }

      return data;
    } else {
      // Create new record
      const { data, error } = await supabase
        .from('user_progress')
        .insert([
          {
            user_id: userId,
            category_slug: categorySlug,
            current_step: currentStep,
            is_complete: isComplete,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating user progress:', error);
        throw error;
      }

      return data;
    }
  } catch (error) {
    console.error('Error in updateUserProgress:', error);
    throw error;
  }
}

// Get count of snags for a user in a specific category
export async function getSnagCountForCategory(userId: string, categorySlug: string): Promise<number> {
  // First get the category ID
  const { data: categoryData, error: categoryError } = await supabase
    .from('checklist_categories')
    .select('id')
    .eq('slug', categorySlug)
    .single();

  if (categoryError) {
    console.error('Error fetching category ID:', categoryError);
    throw categoryError;
  }

  // Then get all checklist item IDs for this category
  const { data: itemsData, error: itemsError } = await supabase
    .from('checklist_items')
    .select('id')
    .eq('category_id', categoryData.id);

  if (itemsError) {
    console.error('Error fetching checklist items:', itemsError);
    throw itemsError;
  }

  // Extract just the IDs into an array
  const itemIds = itemsData.map(item => item.id);

  // If no items found, return 0
  if (itemIds.length === 0) {
    return 0;
  }

  // Now count the snags
  const { count, error } = await supabase
    .from('snags')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .in('checklist_item_id', itemIds);

  if (error) {
    console.error('Error counting snags for category:', error);
    throw error;
  }

  return count || 0;
}

// Get all snags for a user with checklist item details
export async function getAllUserSnags(userId: string): Promise<any[]> {
  try {
    debug.log(`Fetching all snags for user ${userId}`);
    
    // Basic query without nested relations
    const { data, error } = await supabase
      .from('snags')
      .select('*')
      .eq('user_id', userId)
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
      throw error;
    }

    debug.log(`Successfully updated snag ${snagId}`);
    return data;
  } catch (error) {
    debug.error('Error in updateSnag function:', error);
    throw error;
  }
}

// Upload a photo to Supabase Storage
export async function uploadSnagPhoto(userId: string, file: File): Promise<string> {
  try {
    // Check if the file is valid
    if (!file || file.size === 0) {
      throw new Error('Invalid file: File is empty or undefined');
    }
    
    // Create a more reliable file extension extraction
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const sanitizedUserId = userId.replace(/[^a-zA-Z0-9]/g, '_'); // Sanitize user ID for storage path
    const fileName = `${sanitizedUserId}/${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`; // Path within the bucket
    
    // Log the upload attempt
    debug.log(`Attempting to upload file to storage bucket 'snags'`, {
      userId: sanitizedUserId,
      fileName,
      fileType: file.type,
      fileSize: file.size
    });
    
    // Upload the file
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('snags')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true, // Use upsert to avoid conflicts
        contentType: file.type // Explicitly set content type
      });
    
    if (uploadError) {
      debug.error('Error uploading photo to Supabase storage:', uploadError);
      throw uploadError;
    }
    
    debug.log('File uploaded successfully', uploadData);
    
    // Get the public URL
    const { data } = supabase.storage.from('snags').getPublicUrl(filePath);
    
    if (!data || !data.publicUrl) {
      throw new Error('Failed to get public URL for uploaded file');
    }
    
    // Verify the URL is valid and accessible
    const publicUrl = data.publicUrl;
    debug.log('Generated public URL:', publicUrl);
    
    // Add cache-busting parameter to prevent browser caching issues
    const cacheBustedUrl = `${publicUrl}?t=${Date.now()}`;
    return cacheBustedUrl;
  } catch (error) {
    debug.error('Error in uploadSnagPhoto function:', error);
    throw error;
  }
}
