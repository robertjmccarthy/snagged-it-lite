'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { debug } from '@/lib/debug';

export default function SharePage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  // Redirect to the first step of the share flow
  useEffect(() => {
    if (!loading) {
      if (!user) {
        debug.error('Share Page: Not authenticated, redirecting to sign-in');
        router.replace('/signin');
      } else {
        // Redirect to the first step
        router.replace('/snags/share/name');
      }
    }
  }, [loading, user, router]);

  // This page is just a redirect, so we don't need to render anything
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
}
