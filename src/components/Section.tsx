'use client';

import React from 'react';

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  background?: 'white' | 'light' | 'dark-green';
  spacing?: 'sm' | 'md' | 'lg';
  container?: boolean;
  fullHeight?: boolean;
}

/**
 * Section component for consistent layout and spacing across the application
 * 
 * @param children - Content to display inside the section
 * @param className - Additional CSS classes to apply
 * @param background - Background color variant
 * @param spacing - Vertical spacing size
 * @param container - Whether to wrap content in a container
 * @param fullHeight - Whether the section should take up the full available height
 */
export default function Section({ 
  children, 
  className = '', 
  background = 'white',
  spacing = 'md',
  container = true,
  fullHeight = false
}: SectionProps) {
  const backgroundStyles = {
    'white': 'bg-white',
    'light': 'bg-gray-50',
    'dark-green': 'bg-dark-green text-white'
  };
  
  const spacingStyles = {
    'sm': 'py-6',
    'md': 'py-12',
    'lg': 'pt-8 pb-16 md:pt-10 md:pb-20'
  };
  
  const sectionClasses = `${backgroundStyles[background]} ${spacingStyles[spacing]} ${fullHeight ? 'flex-1 flex flex-col' : ''} ${className}`;
  
  return (
    <section className={sectionClasses}>
      {container ? (
        <div className="container">
          {children}
        </div>
      ) : children}
    </section>
  );
}
