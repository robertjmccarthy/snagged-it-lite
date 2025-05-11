'use client';

import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'dark' | 'text';
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
  disabled?: boolean;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
  'aria-label'?: string;
  'aria-controls'?: string;
  'aria-expanded'?: boolean;
}

/**
 * Button component for consistent styling across the application
 * 
 * @param children - Content to display inside the button
 * @param className - Additional CSS classes to apply
 * @param variant - Button styling variant (primary, secondary, outline, dark, text)
 * @param type - HTML button type
 * @param onClick - Click handler function
 * @param disabled - Whether the button is disabled
 * @param fullWidth - Whether the button should take full width
 * @param size - Button size (sm, md, lg)
 * @param aria-label - Accessible label for the button
 * @param aria-controls - ID of the element controlled by the button
 * @param aria-expanded - Whether the controlled element is expanded
 */
export default function Button({ 
  children, 
  className = '', 
  variant = 'primary',
  type = 'button',
  onClick,
  disabled = false,
  fullWidth = false,
  size = 'md',
  'aria-label': ariaLabel,
  'aria-controls': ariaControls,
  'aria-expanded': ariaExpanded
}: ButtonProps) {
  const baseStyles = 'btn';
  
  const variantStyles = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    outline: 'btn-outline',
    dark: 'btn-dark',
    text: 'btn-text'
  };
  
  const sizeStyles = {
    sm: 'text-base py-2 px-4',
    md: 'text-base py-3 px-6',
    lg: 'text-lg py-4 px-8'
  };
  
  const widthStyle = fullWidth ? 'w-full' : '';
  
  const buttonClasses = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${className}`;
  
  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-controls={ariaControls}
      aria-expanded={ariaExpanded}
    >
      {children}
    </button>
  );
}
