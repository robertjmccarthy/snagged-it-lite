'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { debug } from '@/lib/debug';

/**
 * Component that handles resetting a user's progress
 * This allows users to start a new snag list
 */
export default function ResetProgress() {
  const router = useRouter();
  const { user } = useAuth();
  const [isResetting, setIsResetting] = useState(false);

  const handleReset = async () => {
    try {
      if (!user) {
        debug.error('Cannot reset progress: No authenticated user');
        alert('You must be logged in to reset your progress.');
        return;
      }

      setIsResetting(true);
      debug.log('Initiating progress reset for user:', user.id);
      
      // Step 1: Delete all snags for the user
      debug.log('Deleting all snags for user...');
      const { error: snagDeleteError } = await supabase
        .from('snags')
        .delete()
        .eq('user_id', user.id);
      
      if (snagDeleteError) {
        debug.error('Error deleting snags:', snagDeleteError);
        throw new Error(`Failed to delete snags: ${snagDeleteError.message}`);
      }
      
      debug.log('Successfully deleted all snags');
      
      // Step 2: Get the existing progress records
      debug.log('Fetching existing progress records...');
      const { data: progressRecords, error: fetchError } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id);
      
      if (fetchError) {
        debug.error('Error fetching progress records:', fetchError);
        throw new Error(`Failed to fetch progress records: ${fetchError.message}`);
      }
      
      debug.log('Found progress records:', progressRecords);
      
      // Step 3: Reset outside progress
      const outsideProgress = progressRecords?.find(p => p.category_slug === 'outside');
      
      if (outsideProgress) {
        debug.log('Resetting outside progress...');
        const { error: updateError } = await supabase
          .from('user_progress')
          .update({
            current_step: 0,
            is_complete: false,
            updated_at: new Date().toISOString()
          })
          .eq('id', outsideProgress.id);
        
        if (updateError) {
          debug.error('Error updating outside progress:', updateError);
          throw new Error(`Failed to update outside progress: ${updateError.message}`);
        }
        
        debug.log('Successfully reset outside progress');
      }
      
      // Step 4: Reset inside progress
      const insideProgress = progressRecords?.find(p => p.category_slug === 'inside');
      
      if (insideProgress) {
        debug.log('Resetting inside progress...');
        const { error: updateError } = await supabase
          .from('user_progress')
          .update({
            current_step: 0,
            is_complete: false,
            updated_at: new Date().toISOString()
          })
          .eq('id', insideProgress.id);
        
        if (updateError) {
          debug.error('Error updating inside progress:', updateError);
          throw new Error(`Failed to update inside progress: ${updateError.message}`);
        }
        
        debug.log('Successfully reset inside progress');
      }
      
      debug.log('Progress reset successful, refreshing dashboard');
      
      // Force a hard reload to ensure all state is reset
      router.refresh();
      window.location.href = '/dashboard?reset=' + Date.now();
    } catch (error) {
      debug.error('Error resetting progress:', error);
      alert('Failed to reset progress. Please try again.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <button
      className="menu-item bg-primary hover:bg-primary-hover"
      onClick={handleReset}
      disabled={isResetting}
      aria-label="Start a new snag list"
    >
      {isResetting ? 'Starting new list...' : 'Start a new snag list'}
    </button>
  );
}
