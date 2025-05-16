'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useShare } from '@/contexts/ShareContext';
import Navigation from '@/components/Navigation';
import ClientOnly from '@/components/ClientOnly';
import { debug } from '@/lib/debug';

export default function AddressPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { shareData, updateShareData } = useShare();
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [town, setTown] = useState('');
  const [county, setCounty] = useState('');
  const [postcode, setPostcode] = useState('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with existing data
  useEffect(() => {
    if (shareData.addressDetails) {
      const { line1, line2, town, county, postcode } = shareData.addressDetails;
      setAddressLine1(line1 || '');
      setAddressLine2(line2 || '');
      setTown(town || '');
      setCounty(county || '');
      setPostcode(postcode || '');
    }
  }, [shareData.addressDetails]);

  // Protect the route
  useEffect(() => {
    if (!loading && !user) {
      debug.error('Share Address Page: Not authenticated, redirecting to sign-in');
      router.replace('/signin');
    }
  }, [loading, user, router]);

  // UK postcode validation regex pattern
  const postcodeRegex = /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    const newErrors: {[key: string]: string} = {};
    
    if (!addressLine1.trim()) {
      newErrors.addressLine1 = 'Please enter your address';
    } else if (addressLine1.length > 100) {
      newErrors.addressLine1 = 'Address line is too long';
    }
    
    if (addressLine2 && addressLine2.length > 100) {
      newErrors.addressLine2 = 'Address line is too long';
    }
    
    if (!town.trim()) {
      newErrors.town = 'Please enter your town or city';
    } else if (town.length > 50) {
      newErrors.town = 'Town or city name is too long';
    }
    
    if (county && county.length > 50) {
      newErrors.county = 'County name is too long';
    }
    
    if (!postcode.trim()) {
      newErrors.postcode = 'Please enter your postcode';
    } else if (!postcodeRegex.test(postcode.trim())) {
      newErrors.postcode = 'Please enter a valid UK postcode';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Format the full address for display
      const formattedAddress = [
        addressLine1.trim(),
        addressLine2.trim(),
        town.trim(),
        county.trim(),
        postcode.trim().toUpperCase()
      ].filter(Boolean).join(', ');
      
      // Save both the formatted address and the individual fields
      updateShareData({
        address: formattedAddress,
        addressDetails: {
          line1: addressLine1.trim(),
          line2: addressLine2.trim(),
          town: town.trim(),
          county: county.trim(),
          postcode: postcode.trim().toUpperCase()
        }
      });
      
      // We'll determine navigation in the ClientOnly component
      router.push('/snags/share/builder');
    } catch (error) {
      debug.error('Error saving address:', error);
      setErrors({ general: 'An error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !user) {
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
          <div className="mb-6 flex items-center">
            <button 
              onClick={() => router.back()} 
              className="font-semibold text-sm text-gray-600 underline border-0 bg-transparent p-0 cursor-pointer font-inter flex items-center"
              aria-label="Back"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Back
            </button>
          </div>
          
          <div className="bg-white shadow-sm rounded-xl p-6 md:p-8 border border-gray-100">
            <header className="mb-4">
              <div className="mb-0">

                <h1 className="text-2xl md:text-3xl font-bold mb-2">
                  Your new home address
                </h1>
                <p className="text-base text-gray-600 mb-1">
                  Enter the address of the home you're snagging. It will be added to your snag list.
                </p>
              </div>
            </header>
            
            <div className="mb-2">
              <form onSubmit={handleSubmit} className="space-y-4" autoComplete="on">
                {/* Address fieldset with proper grouping */}
                <fieldset className="space-y-4">
                  <legend className="sr-only">Address details</legend>
                  
                  <div>
                    <input
                      type="text"
                      id="addressLine1"
                      name="address-line1"
                      value={addressLine1}
                      onChange={(e) => {
                        setAddressLine1(e.target.value);
                        setErrors({...errors, addressLine1: ''});
                      }}
                      className={`input ${errors.addressLine1 ? 'input-error' : ''}`}
                      placeholder="Address line 1"
                      aria-describedby={errors.addressLine1 ? "address-line1-error" : undefined}
                      disabled={isSubmitting}
                      autoComplete="address-line1"
                      maxLength={100}
                      required
                    />
                    {errors.addressLine1 && (
                      <p id="address-line1-error" className="form-error">
                        {errors.addressLine1}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <input
                      type="text"
                      id="addressLine2"
                      name="address-line2"
                      value={addressLine2}
                      onChange={(e) => {
                        setAddressLine2(e.target.value);
                        setErrors({...errors, addressLine2: ''});
                      }}
                      className={`input ${errors.addressLine2 ? 'input-error' : ''}`}
                      placeholder="Address line 2 (optional)"
                      aria-describedby={errors.addressLine2 ? "address-line2-error" : undefined}
                      disabled={isSubmitting}
                      autoComplete="address-line2"
                      maxLength={100}
                    />
                    {errors.addressLine2 && (
                      <p id="address-line2-error" className="form-error">
                        {errors.addressLine2}
                      </p>
                    )}
                  </div>
                  
                  <div className="w-full md:w-2/3">
                    <input
                      type="text"
                      id="town"
                      name="address-level2"
                      value={town}
                      onChange={(e) => {
                        setTown(e.target.value);
                        setErrors({...errors, town: ''});
                      }}
                      className={`input ${errors.town ? 'input-error' : ''}`}
                      placeholder="Town or city"
                      aria-describedby={errors.town ? "town-error" : undefined}
                      disabled={isSubmitting}
                      autoComplete="address-level2"
                      maxLength={50}
                      required
                    />
                    {errors.town && (
                      <p id="town-error" className="form-error">
                        {errors.town}
                      </p>
                    )}
                  </div>
                  
                  <div className="w-full md:w-2/3">
                    <input
                      type="text"
                      id="county"
                      name="address-level1"
                      value={county}
                      onChange={(e) => {
                        setCounty(e.target.value);
                        setErrors({...errors, county: ''});
                      }}
                      className={`input ${errors.county ? 'input-error' : ''}`}
                      placeholder="County (optional)"
                      aria-describedby={errors.county ? "county-error" : undefined}
                      disabled={isSubmitting}
                      autoComplete="address-level1"
                      maxLength={50}
                    />
                    {errors.county && (
                      <p id="county-error" className="form-error">
                        {errors.county}
                      </p>
                    )}
                  </div>
                  
                  <div className="w-1/2 md:w-1/4">
                    <input
                      type="text"
                      id="postcode"
                      name="postal-code"
                      value={postcode}
                      onChange={(e) => {
                        setPostcode(e.target.value.toUpperCase());
                        setErrors({...errors, postcode: ''});
                      }}
                      className={`input ${errors.postcode ? 'input-error' : ''}`}
                      placeholder="Postcode"
                      aria-describedby={errors.postcode ? "postcode-error" : undefined}
                      disabled={isSubmitting}
                      autoComplete="postal-code"
                      // No maxLength to allow for international postcodes
                      required
                    />
                    {errors.postcode && (
                      <p id="postcode-error" className="form-error">
                        {errors.postcode}
                      </p>
                    )}
                  </div>
                </fieldset>
                
                {errors.general && (
                  <p className="form-error">
                    {errors.general}
                  </p>
                )}
                
                <div className="flex flex-col md:flex-row md:justify-start gap-3 w-full">
                <ClientOnly>
                  {() => {
                    // This code only runs on the client
                    const searchParams = new URLSearchParams(window.location.search);
                    const returnToConfirm = searchParams.get('returnToConfirm') === 'true';
                    
                    return (
                      <button
                        type="submit"
                        onClick={(e) => {
                          e.preventDefault();
                          handleSubmit(e);
                          // Override the navigation based on returnToConfirm
                          if (returnToConfirm) {
                            setTimeout(() => router.push('/snags/share/confirm'), 0);
                          }
                        }}
                        className="btn btn-primary text-base py-2 px-4 w-full md:w-auto"
                        disabled={isSubmitting}
                        aria-busy={isSubmitting}
                      >
                        {isSubmitting ? 'Saving...' : 'Continue'}
                      </button>
                    );
                  }}
                </ClientOnly>
              </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
