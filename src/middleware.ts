import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
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
    const { data } = await supabase.auth.getSession();
    const session = data?.session;

    // Protected routes that require authentication
    const protectedRoutes = ['/dashboard'];
    const isProtectedRoute = protectedRoutes.some(route => 
      req.nextUrl.pathname.startsWith(route)
    );

    // Authentication routes that should redirect to dashboard if already logged in
    const authRoutes = ['/signin', '/signup'];
    const isAuthRoute = authRoutes.some(route => 
      req.nextUrl.pathname.startsWith(route)
    );

    // Redirect if accessing protected route without session
    if (isProtectedRoute && !session) {
      const redirectUrl = new URL('/signin', req.url);
      redirectUrl.searchParams.set('redirectedFrom', req.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Redirect if accessing auth routes with active session
    if (isAuthRoute && session) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    return res;
  } catch (error) {
    console.error('Middleware error:', error);
    // If there's an error, just continue to the page
    return NextResponse.next();
  }
}
