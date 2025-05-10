'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthContext';
import { 
  createBuilderShare, 
  getLatestBuilderShare, 
  updateBuilderShare,
  BuilderShareData
} from '@/lib/api/builder-share';
import { debug } from '@/lib/debug';

interface BuilderShareContextType {
  builderName: string;
  setBuilderName: (name: string) => void;
  builderEmail: string;
  setBuilderEmail: (email: string) => void;
  isLoading: boolean;
  error: string | null;
  saveBuilderName: () => Promise<void>;
  saveBuilderEmail: () => Promise<void>;
  currentShareId: string | null;
  resetShareFlow: () => void;
}

const BuilderShareContext = createContext<BuilderShareContextType | undefined>(undefined);

export function BuilderShareProvider({ children }: { children: ReactNode }) {
  const [builderName, setBuilderName] = useState('');
  const [builderEmail, setBuilderEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentShareId, setCurrentShareId] = useState<string | null>(null);
  
  const { user } = useAuth();
  const router = useRouter();
  
  // Load existing builder share data if available
  useEffect(() => {
    async function loadExistingShare() {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const existingShare = await getLatestBuilderShare(user.id);
        
        if (existingShare) {
          debug.log('Found existing builder share', existingShare);
          setBuilderName(existingShare.builder_name || '');
          setBuilderEmail(existingShare.builder_email || '');
          setCurrentShareId(existingShare.id || null);
        }
      } catch (error) {
        debug.error('Error loading existing builder share:', error);
        setError('Failed to load existing data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
    
    loadExistingShare();
  }, [user]);
  
  // Save builder name and navigate to next step
  const saveBuilderName = async () => {
    if (!user) {
      setError('You must be signed in to continue.');
      return;
    }
    
    if (!builderName.trim()) {
      setError('Builder name is required.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      if (currentShareId) {
        // Update existing share
        await updateBuilderShare(currentShareId, { builder_name: builderName });
      } else {
        // Create new share
        const newShare = await createBuilderShare(user.id, builderName, '');
        setCurrentShareId(newShare.id || null);
      }
      
      router.push('/share/builder-email');
    } catch (error) {
      debug.error('Error saving builder name:', error);
      setError('Failed to save builder name. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Save builder email and navigate to next step
  const saveBuilderEmail = async () => {
    if (!user) {
      setError('You must be signed in to continue.');
      return;
    }
    
    if (!builderEmail.trim()) {
      setError('Builder email is required.');
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(builderEmail)) {
      setError('Please enter a valid email address.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      if (currentShareId) {
        // Update existing share
        await updateBuilderShare(currentShareId, { builder_email: builderEmail });
      } else {
        // Create new share with both name and email
        const newShare = await createBuilderShare(user.id, builderName, builderEmail);
        setCurrentShareId(newShare.id || null);
      }
      
      router.push('/share/confirm');
    } catch (error) {
      debug.error('Error saving builder email:', error);
      setError('Failed to save builder email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Reset the share flow
  const resetShareFlow = () => {
    setBuilderName('');
    setBuilderEmail('');
    setCurrentShareId(null);
    setError(null);
  };
  
  const value = {
    builderName,
    setBuilderName,
    builderEmail,
    setBuilderEmail,
    isLoading,
    error,
    saveBuilderName,
    saveBuilderEmail,
    currentShareId,
    resetShareFlow
  };
  
  return (
    <BuilderShareContext.Provider value={value}>
      {children}
    </BuilderShareContext.Provider>
  );
}

export function useBuilderShare() {
  const context = useContext(BuilderShareContext);
  
  if (context === undefined) {
    throw new Error('useBuilderShare must be used within a BuilderShareProvider');
  }
  
  return context;
}
