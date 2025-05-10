'use client';

import React from 'react';

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

/**
 * SectionTitle component for consistent heading styles across the application
 * 
 * @param title - Main title text
 * @param subtitle - Optional subtitle or description text
 * @param align - Text alignment
 * @param className - Additional CSS classes to apply
 */
export default function SectionTitle({ 
  title, 
  subtitle,
  align = 'center',
  className = '' 
}: SectionTitleProps) {
  const alignmentClasses = {
    'left': 'text-left',
    'center': 'text-center',
    'right': 'text-right'
  };
  
  return (
    <div className={`mb-12 ${alignmentClasses[align]} ${className}`}>
      <h2 className="section-title">{title}</h2>
      {subtitle && <p className="section-text mx-auto">{subtitle}</p>}
    </div>
  );
}
