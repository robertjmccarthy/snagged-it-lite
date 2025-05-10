'use client';

import React from 'react';
import Card from './Card';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  className?: string;
}

/**
 * FeatureCard component for consistent feature display across the application
 * 
 * @param title - Feature title
 * @param description - Feature description
 * @param icon - Feature icon (SVG or component)
 * @param className - Additional CSS classes to apply
 */
export default function FeatureCard({ 
  title, 
  description, 
  icon,
  className = '' 
}: FeatureCardProps) {
  return (
    <Card variant="feature" className={className}>
      <div className="feature-icon">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-3 text-gray-900">{title}</h3>
      <p className="text-gray-700">{description}</p>
    </Card>
  );
}
