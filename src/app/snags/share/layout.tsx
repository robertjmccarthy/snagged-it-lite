'use client';

import { ReactNode } from 'react';
import { ShareProvider } from '@/contexts/ShareContext';

export default function ShareLayout({ children }: { children: ReactNode }) {
  return (
    <ShareProvider>
      {children}
    </ShareProvider>
  );
}
