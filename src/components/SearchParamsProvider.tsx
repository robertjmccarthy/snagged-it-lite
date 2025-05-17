'use client';

import { Suspense, ReactNode } from 'react';

interface SearchParamsProviderProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * SearchParamsProvider component to wrap content that uses useSearchParams
 * This addresses the Next.js error: "useSearchParams() should be wrapped in a suspense boundary"
 */
export default function SearchParamsProvider({ 
  children, 
  fallback = <div>Loading...</div> 
}: SearchParamsProviderProps) {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
}
