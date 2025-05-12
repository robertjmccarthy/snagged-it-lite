'use client';

import { useState, useEffect, ReactNode } from 'react';

type ChildrenFunction = () => ReactNode;

interface ClientOnlyProps {
  children: ReactNode | ChildrenFunction;
  fallback?: ReactNode;
}

/**
 * ClientOnly component to ensure content only renders on the client side
 * This helps prevent hydration errors with hooks like useSearchParams
 */
export default function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return <>{fallback}</>;
  
  return typeof children === 'function' 
    ? <>{(children as ChildrenFunction)()}</> 
    : <>{children}</>;
}
