'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function Logout() {
  const [status, setStatus] = useState('Signing out...');

  useEffect(() => {
    const performSignOut = async () => {
      try {
        // Clear any localStorage items that might be related to auth
        try {
          localStorage.removeItem('supabase.auth.token');
          localStorage.removeItem('sb-refresh-token');
          localStorage.removeItem('sb-access-token');
          // Clear any other Supabase-related items
          Object.keys(localStorage).forEach(key => {
            if (key.startsWith('sb-') || key.includes('supabase')) {
              localStorage.removeItem(key);
            }
          });
        } catch (e) {
          console.log('No localStorage access or item not found');
        }

        // Sign out from Supabase
        await supabase.auth.signOut();
        
        // Clear cookies by setting them to expire
        document.cookie.split(";").forEach(function(c) {
          document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });
        
        setStatus('Successfully signed out. Redirecting...');
        
        // Redirect to sign-in page after a short delay
        setTimeout(() => {
          // Use replace to prevent back navigation
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-white animate-fade-in">
      <div className="w-full max-w-md space-y-8 p-10">
        <div className="text-center">
          <div className="mb-6 flex justify-center">
            <div className="bg-primary/10 p-4 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-primary">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {status}
          </h2>
          <p className="text-gray-dark mb-6">You'll be redirected to the sign-in page shortly.</p>
          <div className="mt-4 flex justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
