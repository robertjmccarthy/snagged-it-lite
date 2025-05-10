import { createClient } from '@supabase/supabase-js';

// Create a Supabase client with admin privileges for server-side operations
// This should only be used in API routes, not in client-side code
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Log warning if environment variables are missing
if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('Missing Supabase admin environment variables. Server-side operations may fail.');
}

// Create a Supabase admin client with service role key
export const supabaseAdmin = createClient(
  supabaseUrl || '',
  supabaseServiceKey || ''
);
