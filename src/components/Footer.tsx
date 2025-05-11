'use client';

import React from 'react';
import Link from 'next/link';

interface FooterProps {
  className?: string;
}

export default function Footer({ className = '' }: FooterProps) {
  return (
    <footer className={`bg-white border-t border-gray-200 ${className}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-4 md:h-14 md:py-0 flex items-center">
          <div className="w-full flex flex-col md:flex-row justify-between">
            {/* Left side - Links */}
            <div className="flex items-center mb-3 md:mb-0 self-start md:self-auto">
              <Link 
                href="#" 
                className="text-sm text-gray-dark hover:text-gray-800 transition-colors duration-200 no-underline mr-6"
              >
                Terms
              </Link>
              <Link 
                href="#" 
                className="text-sm text-gray-dark hover:text-gray-800 transition-colors duration-200 no-underline mr-6"
              >
                Privacy
              </Link>
              <Link 
                href="#" 
                className="text-sm text-gray-dark hover:text-gray-800 transition-colors duration-200 no-underline"
              >
                Contact
              </Link>
            </div>
            
            {/* Right side - Copyright */}
            <div className="flex items-center self-start md:self-auto">
              <span className="text-sm text-gray-700 m-0 text-left">
                &copy; 2025 SnaggedIt. All rights reserved.
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
