import { NextResponse } from 'next/server';
import { adminResetUserProgress } from '@/lib/supabase/admin';
import { debug } from '@/lib/debug';

/**
 * API route to reset a user's progress and snags
 * This allows users to start a new snag list
 */
export async function POST(request: Request) {
  try {
    debug.log('Reset API route called');
    
    // Get the user ID from the request body
    const body = await request.json();
    const { userId } = body;
    debug.log('Reset API: Received user ID:', userId);
    
    if (!userId) {
      debug.error('Reset failed: No user ID provided');
      return NextResponse.json(
        { error: 'No user ID provided' },
        { status: 400 }
      );
    }
    
    // Reset the user's progress and snags using admin privileges
    debug.log('Reset API: Attempting to reset progress for user:', userId);
    try {
      await adminResetUserProgress(userId);
      debug.log('Reset API: Progress reset successful');
    } catch (resetError) {
      debug.error('Reset API: Error in resetUserProgress:', resetError);
      return NextResponse.json(
        { error: 'Failed to reset progress', details: resetError instanceof Error ? resetError.message : String(resetError) },
        { status: 500 }
      );
    }
    
    // Return success response
    return NextResponse.json(
      { success: true, message: 'User progress and snags reset successfully' },
      { status: 200 }
    );
  } catch (error) {
    debug.error('Error in reset API route:', error);
    return NextResponse.json(
      { error: 'Failed to reset progress', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
