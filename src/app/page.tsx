'use client';

import Link from 'next/link';
import Navigation from '@/components/Navigation';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const { user, loading } = useAuth();
  
  // Client-side redirect if user is authenticated
  useEffect(() => {
    if (user && !loading) {
      window.location.href = '/dashboard';
    }
  }, [user, loading]);

  return (
    <main className="flex min-h-screen flex-col">
      <Navigation isAuthenticated={!!user} />
      
      <div className="container mx-auto flex flex-1 flex-col items-center justify-center px-4 py-12 animate-fade-in">
        <div className="w-full max-w-4xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            <span className="block">Document and track</span>
            <span className="block text-primary">home build issues with ease</span>
          </h1>
          <p className="mx-auto mt-6 max-w-md text-base text-gray-dark sm:text-lg md:mt-8 md:max-w-3xl md:text-xl">
            SnaggedIt Lite helps you document, track, and resolve issues during home construction and renovation projects.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link href="/signup" className="btn btn-primary px-8 py-3 text-base font-medium rounded-pill">
              Get Started
            </Link>
            <Link href="/signin" className="btn btn-outline px-8 py-3 text-base font-medium rounded-pill">
              Sign In
            </Link>
          </div>
        </div>

        <div className="mt-20 w-full max-w-4xl">
          <h2 className="text-2xl font-bold text-center mb-10">Key Features</h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition-shadow duration-300 animate-slide-in">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-7 w-7">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                </svg>
              </div>
              <h3 className="mb-3 text-xl font-bold">Capture Issues</h3>
              <p className="text-gray-dark">
                Take photos and document issues as you walk through your home build or renovation.
              </p>
            </div>

            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition-shadow duration-300 animate-slide-in" style={{animationDelay: '100ms'}}>
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success/10 text-success">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-7 w-7">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="mb-3 text-xl font-bold">Track Progress</h3>
              <p className="text-gray-dark">
                Monitor the status of each issue from identification to resolution.
              </p>
            </div>

            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition-shadow duration-300 animate-slide-in" style={{animationDelay: '200ms'}}>
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-info/10 text-info">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-7 w-7">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
                </svg>
              </div>
              <h3 className="mb-3 text-xl font-bold">Generate Reports</h3>
              <p className="text-gray-dark">
                Create professional reports to share with contractors, builders, and other stakeholders.
              </p>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-white py-8 border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center">
            <p className="text-center text-sm text-gray-dark mb-2">
              &copy; {new Date().getFullYear()} SnaggedIt Lite. All rights reserved.
            </p>
            <div className="flex space-x-4 mt-2">
              <a href="#" className="text-gray hover:text-primary transition-colors duration-200">Terms</a>
              <a href="#" className="text-gray hover:text-primary transition-colors duration-200">Privacy</a>
              <a href="#" className="text-gray hover:text-primary transition-colors duration-200">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
