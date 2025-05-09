import Link from 'next/link';
import Navigation from '@/components/Navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

// Mark this page as statically optimized
export const dynamic = 'force-static';

export default async function Home() {
  // Server-side authentication check
  let session = null;
  
  try {
    const supabase = createServerSupabaseClient();
    const { data } = await supabase.auth.getSession();
    session = data.session;
    
    // If user is already logged in, redirect to dashboard
    if (session) {
      redirect('/dashboard');
    }
  } catch (error) {
    console.error('Error checking authentication:', error);
    // Continue rendering the page without authentication
  }

  return (
    <main className="flex min-h-screen flex-col">
      <Navigation isAuthenticated={!!session} />
      
      <div className="container mx-auto flex flex-1 flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-4xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl dark:text-white">
            <span className="block">Document and track</span>
            <span className="block text-primary-600 dark:text-primary-400">home build issues with ease</span>
          </h1>
          <p className="mx-auto mt-3 max-w-md text-base text-gray-500 sm:text-lg md:mt-5 md:max-w-3xl md:text-xl dark:text-gray-400">
            SnaggedIt Lite helps you document, track, and resolve issues during home construction and renovation projects.
          </p>
          <div className="mt-8 flex justify-center space-x-4">
            <Link href="/signup" className="btn btn-primary px-8 py-3 text-base font-medium sm:px-10">
              Get Started
            </Link>
            <Link href="/signin" className="btn btn-outline px-8 py-3 text-base font-medium sm:px-10">
              Sign In
            </Link>
          </div>
        </div>

        <div className="mt-16 w-full max-w-4xl">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-md dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-300">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-bold">Capture Issues</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Take photos and document issues as you walk through your home build or renovation.
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-md dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-300">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-bold">Track Progress</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Monitor the status of each issue from identification to resolution.
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-md dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-300">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-bold">Generate Reports</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Create professional reports to share with contractors, builders, and other stakeholders.
              </p>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-white py-6 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            &copy; {new Date().getFullYear()} SnaggedIt Lite. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
