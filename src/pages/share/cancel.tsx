'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import Link from 'next/link';

export default function CancelPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col">
        <Navigation isAuthenticated={!!user} />
        <div className="flex flex-1 items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col">
      <Navigation isAuthenticated={!!user} />
      <div className="flex flex-1 flex-col p-6 animate-fade-in">
        <div className="container mx-auto max-w-md">
          <div className="bg-white shadow-sm rounded-xl p-6 md:p-8 border border-gray-100">
            <div className="flex justify-center mb-6">
              <div className="bg-warning/20 rounded-full p-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-warning">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
              </div>
            </div>
            
            <h1 className="text-2xl font-bold text-center mb-4">Payment Cancelled</h1>
            
            <p className="text-gray-dark text-center mb-6">
              Your payment was cancelled and your snag list has not been shared with your builder.
            </p>
            
            <div className="space-y-4">
              <Link 
                href="/share/confirm" 
                className="btn btn-primary w-full"
              >
                Try Again
              </Link>
              
              <Link 
                href="/snags" 
                className="btn btn-outline w-full"
              >
                Return to Snags
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
