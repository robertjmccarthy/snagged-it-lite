import React, { ReactNode } from 'react';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ShareLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export default function ShareLayout({ children, title, subtitle }: ShareLayoutProps) {
  const { user } = useAuth();

  return (
    <main className="flex min-h-screen flex-col overflow-x-hidden">
      <Navigation isAuthenticated={!!user} />
      
      <div className="fixed inset-0 bg-[#BBF2D7] -z-10"></div>
      <style jsx global>{`
        body {
          background-color: #BBF2D7;
        }
      `}</style>
      
      <div className="flex flex-1 flex-col p-6 animate-fade-in">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-white shadow-sm rounded-xl p-6 md:p-8 border border-gray-100">
            <header className="mb-8">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                {title}
              </h1>
              {subtitle && (
                <p className="text-gray-dark">
                  {subtitle}
                </p>
              )}
            </header>
            
            {children}
          </div>
        </div>
      </div>
    </main>
  );
}
