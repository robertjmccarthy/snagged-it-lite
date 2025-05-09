import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon\.ico|public).*)',
  ],
};

export async function middleware(req: NextRequest) {
  try {
    // Create a response object that we'll modify and return
    const res = NextResponse.next();
    
    // Create Supabase client with middleware helper
    const supabase = createMiddlewareClient({ req, res });

    // Check if we have Supabase environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.warn('Missing Supabase environment variables in middleware');
      return res;
    }

    // Refresh the session - this will set new cookies if the session was expired
    // But don't rely on this for redirects - let the client-side auth context handle that
    await supabase.auth.getSession();
    
    // Just return the response with the refreshed session cookies
    // The client-side auth context will handle redirects based on auth state
    return res;
  } catch (error) {
    console.error('Middleware error:', error);
    // If there's an error, just continue to the page
    return NextResponse.next();
  }
}
