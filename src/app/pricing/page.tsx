'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import { Layout, Section, Button, Card } from '@/components';

export default function PricingPage() {
  const { user, loading } = useAuth();

  return (
    <Layout>
      <div className="animate-fade-in">
        {/* Hero Section */}
        <Section background="light" spacing="md" className="pb-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-left mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Pay when you're ready to share</h1>
              <p className="text-gray-dark text-lg max-w-2xl">
                Start inspecting your home for free. You only pay when you're ready to share your snag list with your builder. One payment, no subscriptions.
              </p>
            </div>
          </div>
        </Section>
            
        {/* Pricing Section */}
        <Section background="white" spacing="lg">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
              {/* Text Content */}
              <div className="w-full md:w-1/2">
                <div className="mb-6">
                  <div className="text-3xl font-bold text-primary-dark mb-6">Share your snag list for £19.99</div>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-4">What's included:</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary flex-shrink-0 mt-0.5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span><strong>Guided checklists</strong> - Helping you inspect your home to industry standards</span>
                    </li>
                    <li className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary flex-shrink-0 mt-0.5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span><strong>Easy snagging</strong> - Add photos and notes to each and every snag you find</span>
                    </li>
                    <li className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary flex-shrink-0 mt-0.5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span><strong>Professional report</strong> - Download your snag list as a PDF inspection report to share with your builder</span>
                    </li>
                  </ul>
                </div>
                
                <div className="mt-6">
                  <Link href="/signup">
                    <Button variant="primary" size="md">Start snagging for free</Button>
                  </Link>
                </div>
              </div>
              
              {/* Image */}
              <div className="w-full md:w-1/2">
                <div className="relative">
                  {/* Background square with primary color */}
                  <div 
                    className="absolute transform -rotate-3" 
                    style={{ 
                      backgroundColor: 'var(--primary)', 
                      zIndex: 0, 
                      width: 'min(80vw, 25rem)', 
                      height: 'min(80vw, 25rem)',
                      maxWidth: '25rem',
                      maxHeight: '25rem',
                      top: '1rem',
                      right: '1rem'
                    }}
                  ></div>
                  
                  {/* Image with rotation */}
                  <div 
                    className="relative overflow-hidden transform rotate-[8deg]" 
                    style={{ 
                      zIndex: 1, 
                      position: 'relative', 
                      width: 'min(80vw, 25rem)', 
                      height: 'min(80vw, 25rem)',
                      maxWidth: '25rem',
                      maxHeight: '25rem'
                    }}
                  >
                    <Image 
                      src="/images/phone-snag-capture.png" 
                      alt="Sharing a snag list with your builder" 
                      width={800} 
                      height={800}
                      sizes="(max-width: 768px) 80vw, 25rem"
                      className="w-full h-full object-cover rounded-lg" 
                      priority
                      quality={90}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Section>
        {/* CTA Section */}
        <Section background="light" spacing="sm" className="-mt-6 md:-mt-8">
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
                Our guided checklists follow industry standards and align with warranty providers, making it easy for you and your builder to agree on what needs fixing.
              </p>
              <div className="flex justify-center">
                <Link href="/features">
                  <Button variant="primary" size="md">Find out how it works</Button>
                </Link>
              </div>
            </div>
          </div>
          
          {/* Support team contact removed */}
        </Section>
      </div>
    </Layout>
  );
}
