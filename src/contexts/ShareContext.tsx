import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the shape of the share data
export interface AddressDetails {
  line1: string;
  line2?: string;
  town: string;
  county?: string;
  postcode: string;
}

export interface ShareData {
  fullName: string;
  address: string;
  addressDetails?: AddressDetails;
  builderType: string; // One of the top 10 builders or 'other'
  builderName: string; // Custom builder name if 'other' is selected
  builderEmail: string;
}

// Define the context type
interface ShareContextType {
  shareData: ShareData;
  updateShareData: (data: Partial<ShareData>) => void;
  resetShareData: () => void;
}

// Initial state
const initialShareData: ShareData = {
  fullName: '',
  address: '',
  addressDetails: undefined,
  builderType: '',
  builderName: '',
  builderEmail: '',
};

// Create the context
const ShareContext = createContext<ShareContextType | undefined>(undefined);

// Provider component
export function ShareProvider({ children }: { children: ReactNode }) {
  const [shareData, setShareData] = useState<ShareData>(initialShareData);

  const updateShareData = (data: Partial<ShareData>) => {
    setShareData(prevData => ({
      ...prevData,
      ...data,
    }));
  };

  const resetShareData = () => {
    setShareData(initialShareData);
  };

  return (
    <ShareContext.Provider value={{ shareData, updateShareData, resetShareData }}>
      {children}
    </ShareContext.Provider>
  );
}

// Custom hook to use the share context
export function useShare() {
  const context = useContext(ShareContext);
  if (context === undefined) {
    throw new Error('useShare must be used within a ShareProvider');
  }
  return context;
}
