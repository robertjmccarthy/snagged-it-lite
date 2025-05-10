'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useBuilderShare } from '@/contexts/BuilderShareContext';
import Navigation from '@/components/Navigation';
import Link from 'next/link';
import { debug } from '@/lib/debug';

// List of top UK house builders
const TOP_BUILDERS = [
  'Barratt Homes',
  'Persimmon Homes',
  'Taylor Wimpey',
  'Bellway Homes',
  'Berkeley Group',
  'Redrow Homes',
  'Bovis Homes',
  'Crest Nicholson',
  'Countryside Properties',
  'Galliford Try'
];

export default function BuilderSelectionPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { 
    builderName, 
    setBuilderName, 
    isLoading: shareLoading, 
    error: shareError,
    saveBuilderName 
  } = useBuilderShare();
  
  const [selectedBuilder, setSelectedBuilder] = useState<string>('');
  const [customBuilder, setCustomBuilder] = useState<string>('');
  const [isOtherSelected, setIsOtherSelected] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isPageLoading, setIsPageLoading] = useState(true);
  
  // Protect the route and initialize data
  useEffect(() => {
    if (!loading) {
      if (!user) {
        debug.error('Builder Selection: Not authenticated, redirecting to sign-in');
        router.replace('/signin');
        return;
      }
      
      // If we already have a builder name, pre-select it
      if (builderName) {
        const matchedBuilder = TOP_BUILDERS.find(builder => builder === builderName);
        if (matchedBuilder) {
          setSelectedBuilder(matchedBuilder);
        } else {
          setIsOtherSelected(true);
          setCustomBuilder(builderName);
        }
      }
      
      setIsPageLoading(false);
    }
  }, [loading, user, router, builderName]);
  
  // Handle builder selection
  const handleBuilderChange = (builder: string) => {
    setSelectedBuilder(builder);
    setIsOtherSelected(builder === 'other');
    setLocalError(null);
    
    if (builder !== 'other') {
      setBuilderName(builder);
    }
  };
  
  // Handle custom builder input
  const handleCustomBuilderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomBuilder(e.target.value);
    setLocalError(null);
    
    if (isOtherSelected) {
      setBuilderName(e.target.value);
    }
  };
  
  // Handle continue button click
  const handleContinue = async () => {
    if (isOtherSelected && !customBuilder.trim()) {
      setLocalError('Please enter your builder\'s name');
      return;
    }
    
    if (!selectedBuilder && !isOtherSelected) {
      setLocalError('Please select a builder');
      return;
    }
    
    // Save the builder name and proceed to next step
    await saveBuilderName();
  };
  
  if (loading || isPageLoading) {
    return (
      <main className="flex min-h-screen flex-col">
        <Navigation isAuthenticated={!!user} />
        <div className="flex flex-1 items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </main>
    );
  }
  
  return (
    <main className="flex min-h-screen flex-col">
      <Navigation isAuthenticated={!!user} />
      <div className="flex flex-1 flex-col p-6 animate-fade-in">
        <div className="container mx-auto max-w-md">
          <div className="mb-6 flex items-center">
            <Link 
              href="/snags/summary" 
              className="text-gray-dark hover:text-primary transition-colors flex items-center"
              aria-label="Back to snag summary"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Back
            </Link>
          </div>
          
          <div className="bg-white shadow-sm rounded-xl p-6 md:p-8 border border-gray-100">
            <header className="mb-8 text-center">
              <h1 className="text-2xl md:text-3xl font-bold mb-4">Who is your house builder?</h1>
              <p className="text-gray-dark">
                Select your house builder from the list below or enter a custom name.
              </p>
            </header>
            
            {(shareError || localError) && (
              <div className="bg-error/10 text-error rounded-lg p-4 border border-error/20 mb-6">
                {shareError || localError}
              </div>
            )}
            
            <div className="space-y-6">
              <fieldset>
                <legend className="sr-only">Select your house builder</legend>
                
                {/* List of top builders */}
                <div className="space-y-2">
                  {TOP_BUILDERS.map(builder => (
                    <div key={builder} className="flex items-center">
                      <input
                        id={`builder-${builder.toLowerCase().replace(/\s+/g, '-')}`}
                        name="builder"
                        type="radio"
                        className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                        checked={selectedBuilder === builder}
                        onChange={() => handleBuilderChange(builder)}
                      />
                      <label
                        htmlFor={`builder-${builder.toLowerCase().replace(/\s+/g, '-')}`}
                        className="ml-3 block text-gray-dark"
                      >
                        {builder}
                      </label>
                    </div>
                  ))}
                  
                  {/* Other option */}
                  <div className="flex items-center">
                    <input
                      id="builder-other"
                      name="builder"
                      type="radio"
                      className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                      checked={isOtherSelected}
                      onChange={() => handleBuilderChange('other')}
                    />
                    <label
                      htmlFor="builder-other"
                      className="ml-3 block text-gray-dark"
                    >
                      None of these
                    </label>
                  </div>
                  
                  {/* Custom builder input */}
                  {isOtherSelected && (
                    <div className="mt-3 ml-7">
                      <label htmlFor="custom-builder" className="block text-sm font-medium text-gray-dark mb-1">
                        Please enter your builder's name
                      </label>
                      <input
                        type="text"
                        id="custom-builder"
                        name="custom-builder"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                        value={customBuilder}
                        onChange={handleCustomBuilderChange}
                        placeholder="Enter builder name"
                        aria-required="true"
                      />
                    </div>
                  )}
                </div>
              </fieldset>
              
              <div className="pt-4">
                <button
                  type="button"
                  onClick={handleContinue}
                  disabled={shareLoading || (!selectedBuilder && !isOtherSelected) || (isOtherSelected && !customBuilder.trim())}
                  className="w-full btn btn-primary rounded-pill py-3"
                  aria-label="Continue to next step"
                >
                  {shareLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      Continue
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 ml-2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
