'use client';

import React from 'react';
import Navigation from './Navigation';
import Footer from './Footer';
import { useAuth } from '@/contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
  hideFooter?: boolean;
}

/**
 * Layout component for consistent page structure across the application
 * 
 * @param children - Page content
 * @param hideFooter - Option to hide the footer (for specific pages)
 */
export default function Layout({ children, hideFooter = false }: LayoutProps) {
  const { user } = useAuth();
  
  return (
    <main className="flex min-h-screen flex-col">
      <Navigation isAuthenticated={!!user} />
      <div className="flex-grow">
        {children}
      </div>
      {!hideFooter && <Footer />}
    </main>
  );
}
