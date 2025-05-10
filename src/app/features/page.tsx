'use client';

import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function FeaturesPage() {
  const { user, loading } = useAuth();

  // Feature data
  const features = [
    {
      title: 'Step-by-Step Checks',
      description: 'Guided outside & inside inspection workflows that ensure you don\'t miss anything important.',
      icon: '/icons/checklist.svg',
      alt: 'Checklist icon'
    },
    {
      title: 'Photo & Notes',
      description: 'Attach images and detailed comments to any issue for clear communication with your builder.',
      icon: '/icons/camera.svg',
      alt: 'Camera icon'
    },
    {
      title: 'Offline Support',
      description: 'Continue your inspection without cell service. Data syncs when you\'re back online.',
      icon: '/icons/offline.svg',
      alt: 'Offline icon'
    },
    {
      title: 'Secure Storage',
      description: 'All data & photos stored safely in our secure database with enterprise-grade encryption.',
      icon: '/icons/secure.svg',
      alt: 'Security icon'
    },
    {
      title: 'PDF Export',
      description: 'One-click snag list PDF generation, ready to share with your builder.',
      icon: '/icons/pdf.svg',
      alt: 'PDF document icon'
    },
    {
      title: 'Builder Email',
      description: 'Send your snag list directly to your builder from the app with just a few clicks.',
      icon: '/icons/email.svg',
      alt: 'Email icon'
    }
  ];

  return (
    <main className="flex min-h-screen flex-col overflow-x-hidden">
      <Navigation isAuthenticated={!!user} />
      
      <div className="flex-1 animate-fade-in">
        <section className="py-12 md:py-20 px-6">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">Key Features</h1>
              <p className="text-gray-dark text-lg max-w-2xl mx-auto">
                SnaggedIt Lite provides everything you need to document and share home build issues.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              {features.map((feature, index) => (
                <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-full">
                  <div className="flex items-start mb-4">
                    <div className="bg-primary/10 p-3 rounded-lg mr-4">
                      {/* Fallback to SVG if image is not available */}
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-6 w-6 text-primary" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d={
                            feature.title === 'Step-by-Step Checks' ? "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" :
                            feature.title === 'Photo & Notes' ? "M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z M15 13a3 3 0 11-6 0 3 3 0 016 0z" :
                            feature.title === 'Offline Support' ? "M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" :
                            feature.title === 'Secure Storage' ? "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" :
                            feature.title === 'PDF Export' ? "M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" :
                            "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          }
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                      <p className="text-gray-dark">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="bg-primary/10 rounded-xl p-8 md:p-10 mb-12">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">Mobile-First Design</h2>
                <p className="text-gray-dark">
                  SnaggedIt Lite is designed for use on-site, with a responsive interface that works perfectly on your phone.
                </p>
              </div>
              
              <div className="flex justify-center">
                <Image 
                  src="/images/mobile-preview.png" 
                  alt="SnaggedIt Lite mobile app preview" 
                  width={300} 
                  height={600}
                  className="rounded-xl shadow-lg border border-gray-200"
                  style={{ objectFit: 'contain' }}
                  // Fallback for missing image
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            </div>
            
            <div className="text-center">
              <Link 
                href={user ? "/dashboard" : "/signup"} 
                className="btn btn-primary rounded-pill px-8 py-3 text-center inline-block"
                aria-label="Get started with SnaggedIt Lite"
              >
                Get Started
              </Link>
              
              <div className="mt-6">
                <Link 
                  href="/pricing" 
                  className="text-primary hover:underline"
                  aria-label="View pricing information"
                >
                  View pricing →
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
