import type { Metadata } from 'next';
import { Inter as GeistSans } from 'next/font/google';
import { JetBrains_Mono as GeistMono } from 'next/font/google';
import { AuthProvider } from '@/contexts/AuthContext';
import './globals.css';

const sans = GeistSans({ 
  subsets: ['latin'],
  variable: '--font-geist-sans',
  display: 'swap',
});

const mono = GeistMono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'SnaggedIt Lite',
  description: 'Document and track home build issues with ease',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${sans.variable} ${mono.variable} font-sans`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
