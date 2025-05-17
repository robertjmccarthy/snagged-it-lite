'use client';

import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Layout, Section, Button, Card } from '@/components';

export default function FeaturesPage() {
  const { user, loading } = useAuth();
  
  // Section data for the how it works flow
  const sections = [
    {
      id: 'signup',
      title: 'Sign up',
      description: 'The easiest way to make a snag list and share it with your builder. Start snagging for free today.',
      imagePath: '/images/phone-snag-capture.png',
      imageAlt: 'Person signing up for SnaggedIt Lite',
      iconPath: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
      textLeft: true
    },
    {
      id: 'snagit',
      title: 'Snag it',
      description: 'Add photos and notes for each issue you find in your new home. Our guided checklists help you carry out a thorough inspection aligned with industry standards.',
      imagePath: '/images/phone-snag-capture.png',
      imageAlt: 'Person taking a photo of a wall defect with their phone',
      iconPath: 'M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z',
      textLeft: false
    },
    {
      id: 'sendit',
      title: 'Send it',
      description: 'Download your complete snag list and send it to your builder. They\'ll receive a professional, organised report with photos and notes of each and every snag.',
      imagePath: '/images/phone-snag-capture.png',
      imageAlt: 'Person sending a snag list to their builder',
      iconPath: 'M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5',
      textLeft: true
    },
    {
      id: 'sortit',
      title: 'Sort it',
      description: 'Our guided checklists are aligned to industry standards and warranties so your builder can get right to fixing snags. No disagreements. No delays.',
      imagePath: '/images/phone-snag-capture.png',
      imageAlt: 'Builder reviewing a snag list',
      iconPath: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      textLeft: false
    }
  ];

  return (
    <Layout>
      <div className="animate-fade-in">
        {/* Hero Section */}
        <Section background="light" spacing="md" className="pb-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-left mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">How it works</h1>
              <p className="text-gray-dark text-lg max-w-2xl">
                SnaggedIt makes it easy to document and share new home build issues with your builder. Snag it. Send it. Sort it.
              </p>
            </div>
          </div>
        </Section>
        
        {/* How It Works Sections */}
        {sections.map((section, index) => (
          <Section 
            key={section.id} 
            background={index % 2 === 0 ? "white" : "light"} 
            className={index % 2 !== 0 ? "pb-10 md:pb-12" : ""}
            spacing="lg"
          >
            <div className="container mx-auto max-w-6xl">
              <div className={`flex flex-col ${section.textLeft ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-8 md:gap-16`}>
                {/* Text Content */}
                <div className="w-full md:w-1/2">
                  <div className="mb-6">
                    <div className="bg-gray-light p-4 rounded-full inline-block mb-4">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-8 w-8 text-gray-600" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={1.5} 
                          d={section.iconPath}
                        />
                      </svg>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">{section.title}</h2>
                    <p className="text-lg text-gray-700">
                      {section.description}
                    </p>
                  </div>
                  
                  {section.id === 'signup' && (
                    <div className="mt-6">
                      <Link href="/signup">
                        <Button variant="primary" size="md">Start snagging for free</Button>
                      </Link>
                    </div>
                  )}
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
                        [section.textLeft ? 'right' : 'left']: '1rem'
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
                        src={section.imagePath} 
                        alt={section.imageAlt} 
                        width={800} 
                        height={800}
                        sizes="(max-width: 768px) 80vw, 25rem"
                        className="w-full h-full object-cover rounded-lg" 
                        priority={index === 0}
                        quality={90}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Section>
        ))}
        
        {/* CTA Section */}
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
                Inspect your home with a guided checklist and record any snags as you go - all for free. You only pay £19.99 when you're ready to send your completed snag list to your builder.
              </p>
              <div className="flex justify-center">
                <Link href="/signup">
                  <Button variant="primary" size="md">Start snagging for free</Button>
                </Link>
              </div>
            </div>
          </Card>
        </Section>
      </div>
    </Layout>
  );
}
