import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Check if environment variables are available
if (typeof process.env.NEXT_PUBLIC_SUPABASE_URL === 'undefined' || 
    typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === 'undefined') {
  console.warn('Missing Supabase environment variables for server components.');
}

export const createServerSupabaseClient = () => {
  return createServerComponentClient({
    cookies: cookies
  });
};
