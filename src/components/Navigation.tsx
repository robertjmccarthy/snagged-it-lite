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
    <header className="py-4 border-b border-gray-200 bg-white">
      <div className="container">
        <div className="flex items-center justify-between">
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <Image 
                src="/logo.svg" 
                alt="SnaggedIt Logo" 
                width={140} 
                height={35} 
                priority
                className="py-1"
              />
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {isAuthenticated ? (
              <>
                <Link href="/dashboard" className="menu-item text-sm font-medium px-3 py-2 rounded-pill transition-colors duration-200" style={{ color: '#333333' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#EDEFEC'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = ''}>
                  Dashboard
                </Link>
                <button
                  onClick={handleSignOut}
                  disabled={isLoggingOut}
                  className="menu-item text-sm font-medium px-3 py-2 rounded-pill transition-colors duration-200"
                  style={{ color: '#333333', border: 'none', background: 'transparent', cursor: 'pointer' }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#EDEFEC'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = ''}
                  aria-label="Sign out"
                >
                  {isLoggingOut ? 'Signing out...' : 'Sign out'}
                </button>
              </>
            ) : (
              <>
                <Link href="/features" className="menu-item text-sm font-medium px-3 py-2 rounded-pill transition-colors duration-200" style={{ color: '#333333' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#EDEFEC'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = ''}>
                  Features
                </Link>
                <Link href="/pricing" className="menu-item text-sm font-medium px-3 py-2 rounded-pill transition-colors duration-200" style={{ color: '#333333' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#EDEFEC'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = ''}>
                  Pricing
                </Link>
                <Link href="/signin" className="menu-item text-sm font-medium px-3 py-2 rounded-pill transition-colors duration-200" style={{ color: '#333333' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#EDEFEC'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = ''}>
                  Sign in
                </Link>
                <Link href="/signup">
                  <button 
                    className="btn rounded-pill py-2 px-5 text-sm font-medium whitespace-nowrap active:animate-ripple transition-colors duration-200" 
                    style={{ backgroundColor: '#85E0A3', color: '#333333' }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#6BC288'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#85E0A3'}
                  >
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
              className="inline-flex items-center justify-center p-2 rounded-pill text-gray-dark focus:outline-none transition-colors duration-200"
              style={{ backgroundColor: '#EDEFEC' }}
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
      <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:hidden border-t border-gray-200 mt-3 animate-fade-in`} id="mobile-menu">
        <div className="container py-3">
          {isAuthenticated ? (
            <div className="flex flex-col space-y-3">
              <Link href="/dashboard" className="menu-item block py-2 text-sm font-medium rounded-pill px-3 transition-colors duration-200" style={{ color: '#333333' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#EDEFEC'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = ''}>
                Dashboard
              </Link>
              <div className="pt-2 border-t border-gray-200">
                <button
                  onClick={handleSignOut}
                  disabled={isLoggingOut}
                  className="menu-item text-sm font-medium py-2 px-3 rounded-pill transition-colors duration-200 w-full mt-2 text-left"
                  style={{ color: '#333333', border: 'none', background: 'transparent', cursor: 'pointer' }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#EDEFEC'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = ''}  
                  aria-label="Sign out"
                >
                  {isLoggingOut ? 'Signing out...' : 'Sign out'}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col space-y-3 py-2">
              <Link href="/features" className="menu-item block py-2 text-sm font-medium rounded-pill px-3 transition-colors duration-200" style={{ color: '#333333' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#EDEFEC'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = ''}>
                Features
              </Link>
              <Link href="/pricing" className="menu-item block py-2 text-sm font-medium rounded-pill px-3 transition-colors duration-200" style={{ color: '#333333' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#EDEFEC'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = ''}>
                Pricing
              </Link>
              <Link href="/signin" className="menu-item block py-2 text-sm font-medium rounded-pill px-3 transition-colors duration-200" style={{ color: '#333333' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#EDEFEC'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = ''}>
                Sign in
              </Link>
              <div className="pt-2 border-t border-gray-200 mt-2">
                <Link href="/signup" className="block mt-3">
                  <button 
                    className="btn rounded-pill py-2 px-4 text-sm font-medium w-full active:animate-ripple transition-colors duration-200" 
                    style={{ backgroundColor: '#85E0A3', color: '#333333' }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#6BC288'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#85E0A3'}
                  >
                    Sign up
                  </button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
