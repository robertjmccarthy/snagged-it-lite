'use client';

import Link from 'next/link';
import Image from 'next/image';
import Navigation from '@/components/Navigation';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const { user, loading } = useAuth();
  
  // Client-side redirect if user is authenticated
  useEffect(() => {
    if (user && !loading) {
      window.location.href = '/dashboard';
    }
  }, [user, loading]);

  return (
    <main className="flex min-h-screen flex-col">
      <Navigation isAuthenticated={!!user} />
      
      {/* Big-brand hero section */}
      <section className="w-full bg-gray-50 pt-0 pb-14 md:pb-20 overflow-hidden animate-fade-in">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-6">
            {/* Left column - Hero text */}
            <div className="w-full md:w-1/2 md:pr-8 lg:pr-16 mb-12 md:mb-0">
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight text-foreground">
                <span className="block">Check your new home like you own it</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-dark font-light mb-8 max-w-2xl">
                SnaggedIt helps you document, track, and resolve issues during home construction and renovation projects.
              </p>
              <div className="flex">
                <Link href="/signup">
                  <button 
                    className="btn rounded-pill py-2 px-5 text-sm font-semibold whitespace-nowrap active:animate-ripple transition-colors duration-200" 
                    style={{ backgroundColor: '#85E0A3', color: '#333333' }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#6BC288'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#85E0A3'}
                  >
                    Sign up
                  </button>
                </Link>
              </div>
            </div>
            
            {/* Right column - New phone image with stylized background - mobile optimized */}
            <div className="w-full md:w-1/2 flex justify-center md:justify-end">
              <div className="relative">
                {/* Square background with the same color as sign up button, slightly rotated */}
                <div 
                  className="absolute -right-0 md:-right-4 top-4 transform -rotate-3" 
                  style={{ 
                    backgroundColor: '#85E0A3', 
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
        </div>
      </section>

      {/* Snag it · Send it · Sort it section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="sr-only">Key Benefits</h2>
          <div className="-mt-28 md:-mt-24 relative z-10">
            <div className="bg-white rounded-2xl shadow hover:shadow-md transition-shadow duration-300 p-0 overflow-hidden relative">
              <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0">
                {/* Custom dividers with space */}
                <div className="hidden md:block absolute left-1/3 top-6 bottom-6 w-px bg-gray-200"></div>
                <div className="hidden md:block absolute left-2/3 top-6 bottom-6 w-px bg-gray-200"></div>
                {/* Snag it */}
                <article className="p-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full p-4 mb-4" style={{ backgroundColor: '#F3F4F6' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#6B7280" className="h-8 w-8 text-gray-500" style={{ color: '#6B7280 !important', stroke: '#6B7280 !important' }} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Snag it</h3>
                  <p className="text-base text-gray-700">
                    Use our guided checklist to spot and record every issue in your new build. Snap photos, add notes, and organise snags in seconds.
                  </p>
                </article>

                {/* Send it */}
                <article className="p-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full p-4 mb-4" style={{ backgroundColor: '#F3F4F6' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#6B7280" className="h-8 w-8 text-gray-500" style={{ color: '#6B7280 !important', stroke: '#6B7280 !important' }} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Send it</h3>
                  <p className="text-base text-gray-700">
                    Export your complete snag list as a PDF and email it straight to your builder—all without leaving the SnaggedIt app.
                  </p>
                </article>

                {/* Sort it */}
                <article className="p-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full p-4 mb-4" style={{ backgroundColor: '#F3F4F6' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#6B7280" className="h-8 w-8 text-gray-500" style={{ color: '#6B7280 !important', stroke: '#6B7280 !important' }} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Sort it</h3>
                  <p className="text-base text-gray-700">
                    We align to industry standards and warranties so your builder can get right to fixing snags—no confusion, no delay.
                  </p>
                </article>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Industry Standards Section */}
      {/* Industry Standards Section - Dark Green Background in Rounded Box */}
      <section className="pt-4 pb-8 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#31593E] text-white rounded-2xl shadow-lg overflow-hidden">
            <div className="flex flex-col items-center text-center max-w-3xl mx-auto py-12 px-6 md:px-8">
              <div className="mb-6">
                <div className="bg-[#85E0A3] rounded-full p-4 inline-block mb-8">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#1A3B0A" className="w-8 h-8" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                </div>
                <h2 className="text-4xl font-bold text-[#85E0A3] mb-6">Aligned with industry standards & warranty providers</h2>
              </div>
              <p className="text-xl text-white max-w-2xl">
                SnaggedIt guides you through an inspection of your home that follows industry standard best practices and major warranty schemes approved checks - so you and your builder always agree on what needs sorting.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Duplicate Section with Light Grey Background and White Container */}
      <section className="pt-4 pb-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white text-gray-900 rounded-2xl shadow-lg overflow-hidden">
            <div className="flex flex-col items-center text-center max-w-3xl mx-auto py-12 px-6 md:px-8">
              <div className="mb-6">
                <div className="bg-gray-100 rounded-full p-4 inline-block mb-8">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#333333" className="w-8 h-8" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                  </svg>
                </div>
                <h2 className="text-4xl font-bold text-gray-900 mb-6">Get started for free—only pay when you send your snag list</h2>
              </div>
              <p className="text-xl text-gray-700 max-w-2xl mb-8">
                Use SnaggedIt to walk through your entire inspection and record snags at no cost. You only pay £19.99 when you send your list to your builder.
              </p>
              <div className="flex justify-center">
                <Link href="/signup">
                  <button 
                    className="btn rounded-pill py-2 px-5 text-sm font-semibold whitespace-nowrap active:animate-ripple transition-colors duration-200" 
                    style={{ backgroundColor: '#85E0A3', color: '#333333' }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#6BC288'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#85E0A3'}
                  >
                    Sign up for free
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>



      <footer className="bg-white py-4 border-t border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:justify-between">
            <nav className="mb-4 md:mb-0">
              <ul className="flex space-x-2">
                <li>
                  <Link href="#" className="menu-item text-sm font-semibold px-3 py-2 rounded-pill transition-colors duration-200 inline-block" style={{ color: '#333333' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#EDEFEC'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = ''}>Terms</Link>
                </li>
                <li>
                  <Link href="#" className="menu-item text-sm font-semibold px-3 py-2 rounded-pill transition-colors duration-200 inline-block" style={{ color: '#333333' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#EDEFEC'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = ''}>Privacy</Link>
                </li>
                <li>
                  <Link href="#" className="menu-item text-sm font-semibold px-3 py-2 rounded-pill transition-colors duration-200 inline-block" style={{ color: '#333333' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#EDEFEC'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = ''}>Contact</Link>
                </li>
              </ul>
            </nav>
            <div className="flex items-center">
              <p className="text-sm font-normal text-gray-700 py-2 px-3">
                &copy; {new Date().getFullYear()} SnaggedIt. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
