import { createClient } from '@supabase/supabase-js';

// Environment variables with fallbacks to prevent build errors
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Check for missing environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables');
}

// Create a type for our Supabase client to ensure consistent typing
type TypedSupabaseClient = ReturnType<typeof createClient>;

// Create clients with consistent types
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Helper function to get the appropriate client
export function getSupabase(useAdmin = false): TypedSupabaseClient {
  return useAdmin ? supabaseAdmin : supabaseClient;
}
