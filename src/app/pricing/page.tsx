'use client';

import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function PricingPage() {
  const { user, loading } = useAuth();

  return (
    <main className="flex min-h-screen flex-col overflow-x-hidden">
      <Navigation isAuthenticated={!!user} />
      
      <div className="flex-1 animate-fade-in">
        <section className="py-12 md:py-20 px-6">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
              <p className="text-gray-dark text-lg max-w-2xl mx-auto">
                Share your snag list with your builder with just one payment.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-8 md:p-10">
                <div className="flex flex-col md:flex-row items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Share Your Snag List</h2>
                    <p className="text-gray-dark">One-time payment, no subscriptions</p>
                  </div>
                  <div className="mt-4 md:mt-0">
                    <div className="text-3xl font-bold text-primary-dark">£19.99</div>
                    <div className="text-sm text-gray-dark">per snag list</div>
                  </div>
                </div>
                
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4">What's included:</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-success flex-shrink-0 mt-0.5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span><strong>PDF Export</strong> - Professional-looking snag list document</span>
                    </li>
                    <li className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-success flex-shrink-0 mt-0.5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span><strong>Email Delivery</strong> - Sent directly to your builder and yourself</span>
                    </li>
                    <li className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-success flex-shrink-0 mt-0.5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span><strong>Unlimited Revisions</strong> - Update your snag list as many times as needed before sending</span>
                    </li>
                    <li className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-success flex-shrink-0 mt-0.5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span><strong>Secure Storage</strong> - All your snags and photos stored safely</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-100 mb-8">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium">Only pay when you're ready to share</span>
                  </div>
                  <p className="text-sm text-gray-dark mt-2">
                    Creating and managing your snag list is completely free. You only pay when you want to share it with your builder.
                  </p>
                </div>
                
                <div className="text-center">
                  <Link 
                    href={user ? "/dashboard" : "/signup"} 
                    className="btn btn-primary rounded-pill px-8 py-3 text-center inline-block"
                    aria-label="Get started with SnaggedIt Lite"
                  >
                    Get Started
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="mt-12 text-center text-gray-dark">
              <p>Have questions about pricing? <a href="mailto:support@snaggedit.com" className="text-primary hover:underline">Contact our support team</a></p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
