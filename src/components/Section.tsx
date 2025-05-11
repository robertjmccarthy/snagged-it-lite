'use client';

import React from 'react';

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  background?: 'white' | 'light' | 'dark-green';
  spacing?: 'sm' | 'md' | 'lg';
  container?: boolean;
}

/**
 * Section component for consistent layout and spacing across the application
 * 
 * @param children - Content to display inside the section
 * @param className - Additional CSS classes to apply
 * @param background - Background color variant
 * @param spacing - Vertical spacing size
 * @param container - Whether to wrap content in a container
 */
export default function Section({ 
  children, 
  className = '', 
  background = 'white',
  spacing = 'md',
  container = true
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
  
  const sectionClasses = `${backgroundStyles[background]} ${spacingStyles[spacing]} ${className}`;
  
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
