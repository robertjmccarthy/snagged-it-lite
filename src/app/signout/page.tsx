'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function SignOut() {
  const [status, setStatus] = useState('Signing out...');

  useEffect(() => {
    const performSignOut = async () => {
      try {
        // Clear any local state first
        localStorage.removeItem('supabase.auth.token');
        
        // Sign out from Supabase with global scope to invalidate on all devices
        const { error } = await supabase.auth.signOut({
          scope: 'global'
        });
        
        if (error) {
          console.error('Error during sign out:', error);
          setStatus('Error signing out. Redirecting...');
        } else {
          setStatus('Successfully signed out. Redirecting...');
        }
        
        // Redirect to sign-in page after a short delay
        setTimeout(() => {
          // Use replace to prevent back navigation to this page
          window.location.replace('/signin');
        }, 500);
      } catch (err) {
        console.error('Exception during sign out:', err);
        setStatus('Error signing out. Redirecting...');
        
        // Still redirect even if there was an error
        setTimeout(() => {
          window.location.replace('/signin');
        }, 500);
      }
    };

    performSignOut();
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md space-y-8 p-10">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            {status}
          </h2>
          <div className="mt-8 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
