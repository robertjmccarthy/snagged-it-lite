'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components';

type ConsentType = 'all' | 'essential' | 'declined' | null;

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  // No longer showing details

  useEffect(() => {
    // Check if user has already consented
    const cookieConsent = localStorage.getItem('cookie-consent');
    if (!cookieConsent) {
      // Show banner after a short delay for better UX
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptAllCookies = () => {
    localStorage.setItem('cookie-consent', 'all');
    setShowBanner(false);
  };

  const acceptEssentialOnly = () => {
    localStorage.setItem('cookie-consent', 'essential');
    // Disable Google Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any)['ga-disable-G-B06G9BTCYV'] = true;
    }
    setShowBanner(false);
  };

  const declineCookies = () => {
    localStorage.setItem('cookie-consent', 'declined');
    // Disable Google Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any)['ga-disable-G-B06G9BTCYV'] = true;
    }
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-50 px-4 py-4">
      <div className="container mx-auto">
        <div className="flex flex-col items-start justify-between gap-4">
          <div className="flex-1 w-full">
            <h3 className="font-bold text-lg mb-2">We value your privacy</h3>
            <p className="text-gray-dark mb-4">
              SnaggedIt uses cookies to improve your experience and analyse usage to improve the app. 
              <Link href="/cookie-policy" className="text-primary hover:underline ml-1">
                Read our cookie policy
              </Link>
            </p>
          </div>
          <div className="flex flex-wrap gap-3 w-full">
            <Button 
              onClick={acceptAllCookies}
              className="btn-primary"
            >
              Accept All Cookies
            </Button>
            <Button 
              onClick={acceptEssentialOnly}
              className="btn-outline"
            >
              Accept Essential Only
            </Button>
            <Button 
              onClick={declineCookies}
              className="btn-outline"
            >
              Decline All
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
