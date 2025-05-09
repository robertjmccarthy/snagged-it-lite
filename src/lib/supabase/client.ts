import { createClient } from '@supabase/supabase-js';

// These environment variables will need to be set in a .env.local file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-url.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

// Log warning if environment variables are missing
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn('Missing Supabase environment variables. Authentication and data storage features will not work.');
}

// Create a basic Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
