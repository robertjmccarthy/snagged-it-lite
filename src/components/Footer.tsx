'use client';

import React from 'react';
import Link from 'next/link';

interface FooterProps {
  className?: string;
}

/**
 * Footer component for consistent footer styling across the application
 * 
 * @param className - Additional CSS classes to apply
 */
export default function Footer({ className = '' }: FooterProps) {
  return (
    <footer className={`bg-white py-4 border-t border-gray-200 ${className}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:justify-between">
          <nav className="mb-4 md:mb-0">
            <ul className="flex space-x-2">
              <li>
                <Link href="#" className="menu-item">Terms</Link>
              </li>
              <li>
                <Link href="#" className="menu-item">Privacy</Link>
              </li>
              <li>
                <Link href="#" className="menu-item">Contact</Link>
              </li>
            </ul>
          </nav>
          <div className="flex items-center">
            <p className="text-sm font-normal text-gray-700 py-2 px-3">
              &copy; {new Date().getFullYear()} SnaggedIt. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
