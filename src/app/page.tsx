'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Layout, 
  Section, 
  Button, 
  Card, 
  FeatureCard,
  SectionTitle
} from '@/components';

export default function Home() {
  const { user, loading } = useAuth();
  
  // Client-side redirect if user is authenticated
  useEffect(() => {
    if (user && !loading) {
      window.location.href = '/dashboard';
    }
  }, [user, loading]);

  return (
    <Layout>
      {/* Hero section */}
      <Section background="light" spacing="lg" className="overflow-hidden animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-3">
          {/* Left column - Hero text */}
          <div className="w-full md:w-1/2 md:pr-8 lg:pr-16 mb-12 md:mb-0">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight text-foreground">
              <span className="block">Inspect your new home, like you own it</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-dark font-light mb-8 max-w-2xl">
            The easiest way to snag issues with your new home and send them straight to your builder - all in one app.
            </p>
            <div className="flex">
              <Link href="/signup">
                <Button variant="primary" size="md">Sign up</Button>
              </Link>
            </div>
          </div>
          
          {/* Right column - Phone image with stylized background */}
          <div className="w-full md:w-1/2 flex justify-center md:justify-end">
            <div className="relative">
              {/* Square background with the same color as sign up button, slightly rotated */}
              <div 
                className="absolute -right-0 md:-right-4 top-4 transform -rotate-3" 
                style={{ 
                  backgroundColor: 'var(--primary)', 
                  zIndex: 0, 
                  width: 'min(80vw, 25.6rem)', 
                  height: 'min(80vw, 25.6rem)',
                  maxWidth: '25.6rem',
                  maxHeight: '25.6rem'
                }}
              ></div>
              
              {/* Phone image in a square format, attached to the right edge, rotated 8 degrees */}
              <div 
                className="relative overflow-hidden transform rotate-[8deg]" 
                style={{ 
                  zIndex: 1, 
                  position: 'relative', 
                  width: 'min(80vw, 25.6rem)', 
                  height: 'min(80vw, 25.6rem)',
                  maxWidth: '25.6rem',
                  maxHeight: '25.6rem'
                }}
              >
                <Image 
                  src="/images/phone-snag-capture.png" 
                  alt="Person taking a photo of a wall defect with their phone" 
                  width={800} 
                  height={800}
                  sizes="(max-width: 768px) 80vw, 25.6rem"
                  className="w-full h-full object-cover" 
                  priority
                  quality={90}
                />
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Features section */}
      <Section background="white" spacing="lg">
        <h2 className="sr-only">Key Benefits</h2>
        <div className="-mt-28 md:-mt-24 relative z-10">
          <Card className="p-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
              {/* Snag it */}
              <article className="p-6">
                <div className="feature-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#6B7280" className="h-8 w-8 text-gray-500" style={{ color: '#6B7280 !important', stroke: '#6B7280' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Snag it</h3>
                <p className="text-base text-gray-700">
                  Take photos and add notes for each issue you find in your new home. Create a comprehensive list of all snags.
                </p>
              </article>

              {/* Send it */}
              <article className="p-6 border-t md:border-t-0 md:border-l border-gray-100">
                <div className="feature-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#6B7280" className="h-8 w-8 text-gray-500" style={{ color: '#6B7280 !important', stroke: '#6B7280' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Send it</h3>
                <p className="text-base text-gray-700">
                  Share your complete snag list with your builder with one click. They'll receive a professional, organized report.
                </p>
              </article>

              {/* Sort it */}
              <article className="p-6 border-t md:border-t-0 md:border-l border-gray-100">
                <div className="feature-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#6B7280" className="h-8 w-8 text-gray-500" style={{ color: '#6B7280 !important', stroke: '#6B7280' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Sort it</h3>
                <p className="text-base text-gray-700">
                  We align to industry standards and warranties so your builder can get right to fixing snags—no confusion, no delay.
                </p>
              </article>
            </div>
          </Card>
        </div>
      </Section>

      {/* Industry Standards Section */}
      <Section background="white" spacing="sm">
        <div className="bg-dark-green text-white rounded-2xl shadow-lg overflow-hidden">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto py-12 px-6 md:px-8">
            <div className="mb-6">
              <div className="bg-primary rounded-full p-4 inline-block mb-8">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#333333" className="w-8 h-8" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
                </svg>
              </div>
              <h2 className="text-4xl font-bold mb-6">Aligned with industry standards & warranty providers</h2>
            </div>
            <p className="text-xl max-w-2xl mb-8">
            Our guided checklists follow industry standards and aligns with warranty providers, making it easy for you and your builder to agree on what needs fixing.
            </p>
          </div>
        </div>
      </Section>

      {/* Pricing Section */}
      <Section background="light" spacing="md">
        <Card className="overflow-hidden">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto py-12 px-6 md:px-8">
            <div className="mb-6">
              <div className="bg-gray-100 rounded-full p-4 inline-block mb-8">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#333333" className="w-8 h-8" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                </svg>
              </div>
              <h2 className="section-title">Start snagging for free</h2>
            </div>
            <p className="section-text">
            Inspect your home with a guided checklist and record any snags as you go - all for free. You only pay £19.99 when you’re ready to send your completed snag list to your builder.
            </p>
            <div className="flex justify-center">
              <Link href="/signup">
                <Button variant="primary" size="md">Sign up for free</Button>
              </Link>
            </div>
          </div>
        </Card>
      </Section>
    </Layout>
  );
}
