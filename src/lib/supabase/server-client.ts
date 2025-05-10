import { createClient } from '@supabase/supabase-js';

// Initialize Supabase with server-side credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Check for missing environment variables
if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment');
}

// Create a Supabase client with the service role key for server operations
export const serverSupabase = createClient(supabaseUrl, supabaseServiceKey);
