'use client';

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'feature' | 'highlight';
}

/**
 * Card component for consistent styling across the application
 * 
 * @param children - Content to display inside the card
 * @param className - Additional CSS classes to apply
 * @param variant - Card styling variant (default, feature, highlight)
 */
export default function Card({ children, className = '', variant = 'default' }: CardProps) {
  const baseStyles = 'overflow-hidden bg-white';
  
  const variantStyles = {
    default: 'rounded-2xl shadow-lg',
    feature: 'p-6 rounded-2xl',
    highlight: 'rounded-2xl shadow-lg bg-gray-50 p-6'
  };
  
  const cardClasses = `${baseStyles} ${variantStyles[variant]} ${className}`;
  
  return (
    <div className={cardClasses}>
      {children}
    </div>
  );
}
