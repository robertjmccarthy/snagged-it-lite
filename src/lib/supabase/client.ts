import { createClient } from '@supabase/supabase-js';
import { debug } from '@/lib/debug';

// These environment variables will need to be set in a .env.local file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-url.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

// Log warning if environment variables are missing
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn('Missing Supabase environment variables. Authentication and data storage features will not work.');
}

/**
 * Create a Supabase client with proper configuration for production use
 * - persistSession: Ensures the user stays logged in across page refreshes
 * - autoRefreshToken: Automatically refreshes the token before it expires
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    headers: {
      'X-Client-Info': 'snagged-it-lite',
    },
  },
});

/**
 * For production applications, it's recommended to use a service role key for storage operations
 * to bypass RLS policies. This should be used carefully and only for specific operations.
 * 
 * NOTE: In a real production environment, you would use a server-side API endpoint to handle
 * file uploads using the service role key, rather than exposing it in the client.
 * 
 * For this application, we're using it directly for simplicity, but in a real production app,
 * you would create a secure API endpoint that handles the upload.
 */
export const getServiceRoleClient = () => {
  // For now, we'll use the regular client
  // In a real production app, this would use the service role key
  return supabase;
};

// Helper function to check if a user is authenticated
export async function isAuthenticated() {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
    return !!data.session;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
}

// Helper function to get the current user
export async function getCurrentUser() {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error || !data.session) {
      return null;
    }
    return data.session.user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}
