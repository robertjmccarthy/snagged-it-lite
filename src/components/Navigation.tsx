'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import Image from 'next/image';

interface NavigationProps {
  isAuthenticated: boolean;
}

export default function Navigation({ isAuthenticated }: NavigationProps) {
  const { signOut } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = () => {
    try {
      setIsLoggingOut(true);
      console.log('Navigation: Redirecting to logout page');
      
      // Redirect to the dedicated logout page that handles everything
      window.location.replace('/logout');
    } catch (error) {
      console.error('Error navigating to logout page:', error);
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="py-4 border-b border-gray-100 bg-white">
      <div className="container">
        <div className="flex items-center justify-between">
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <Image 
                src="/logo.svg" 
                alt="SnaggedIt Logo" 
                width={140} 
                height={35} 
                className="py-1"
              />
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link href="/dashboard" className="text-gray-dark hover:text-primary transition-colors duration-200 px-3 py-2">
                  Dashboard
                </Link>
                <button
                  onClick={handleSignOut}
                  disabled={isLoggingOut}
                  className="btn btn-outline rounded-pill py-2 px-4 text-sm font-medium"
                  aria-label="Sign out"
                >
                  {isLoggingOut ? 'Signing out...' : 'Sign out'}
                </button>
              </>
            ) : (
              <>
                <Link href="/signin">
                  <button className="btn btn-outline rounded-pill py-2 px-5 text-sm font-medium whitespace-nowrap">
                    Sign in
                  </button>
                </Link>
                <Link href="/signup">
                  <button className="btn btn-primary rounded-pill py-2 px-5 text-sm font-medium whitespace-nowrap">
                    Sign up
                  </button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-dark hover:text-primary hover:bg-gray-50 focus:outline-none transition-colors duration-200"
              aria-controls="mobile-menu"
              aria-expanded={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {/* Icon when menu is closed */}
              <svg
                className={`${isMobileMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              {/* Icon when menu is open */}
              <svg
                className={`${isMobileMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:hidden border-t border-gray-100 mt-3 animate-fade-in`} id="mobile-menu">
        <div className="container py-3">
          {isAuthenticated ? (
            <div className="flex flex-col space-y-3">
              <Link href="/dashboard" className="block py-2 text-base font-medium text-gray-dark hover:text-primary transition-colors duration-200">
                Dashboard
              </Link>
              <div className="pt-2 border-t border-gray-100">
                <button
                  onClick={handleSignOut}
                  disabled={isLoggingOut}
                  className="btn btn-outline rounded-pill py-2 px-4 text-sm font-medium w-full mt-2"
                  aria-label="Sign out"
                >
                  {isLoggingOut ? 'Signing out...' : 'Sign out'}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col space-y-3 py-2">
              <Link href="/signin" className="block">
                <button className="btn btn-outline rounded-pill py-2 px-4 text-sm font-medium w-full">
                  Sign in
                </button>
              </Link>
              <Link href="/signup" className="block">
                <button className="btn btn-primary rounded-pill py-2 px-4 text-sm font-medium w-full">
                  Sign up
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
