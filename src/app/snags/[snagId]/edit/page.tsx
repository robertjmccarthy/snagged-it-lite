'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import Link from 'next/link';
import { debug } from '@/lib/debug';
import { getSnagById, updateSnag, uploadSnagPhoto } from '@/lib/api/checklist';

interface EditSnagPageProps {
  params: {
    snagId: string;
  };
}

export default function EditSnagPage({ params }: EditSnagPageProps) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [note, setNote] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [originalPhotoUrl, setOriginalPhotoUrl] = useState<string | null>(null);
  const [snag, setSnag] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const snagId = params.snagId;

  // Protect the route and load snag data
  useEffect(() => {
    async function initializeSnagEdit() {
      if (!loading) {
        if (!user) {
          debug.error('Edit Snag: Not authenticated, redirecting to sign-in');
          router.replace('/signin');
          return;
        }

        try {
          // Get the snag data
          debug.log(`Fetching snag ${snagId} for editing`);
          const snagData = await getSnagById(user.id, snagId);
          
          if (!snagData) {
            debug.error(`Snag not found with ID ${snagId}, redirecting to summary`);
            router.replace('/snags/summary');
            return;
          }
          
          debug.log(`Found snag for editing:`, snagData);
          setSnag(snagData);
          setNote(snagData.note || '');
          
          if (snagData.photo_url) {
            setPhotoPreview(snagData.photo_url);
            setOriginalPhotoUrl(snagData.photo_url);
          }
          
          setIsLoading(false);
        } catch (error) {
          debug.error('Error initializing snag edit:', error);
          setError('Failed to load snag data. Please try again.');
          setIsLoading(false);
        }
      }
    }

    initializeSnagEdit();
  }, [user, loading, router, snagId]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    debug.log('New photo file selected:', { 
      name: file.name, 
      type: file.type, 
      size: `${(file.size / 1024).toFixed(2)} KB` 
    });

    // Check file type
    if (!file.type.startsWith('image/')) {
      const errorMsg = 'Please select an image file';
      debug.error(errorMsg, { fileType: file.type });
      setError(errorMsg);
      return;
    }

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      const errorMsg = 'Image size should be less than 5MB';
      debug.error(errorMsg, { fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB` });
      setError(errorMsg);
      return;
    }

    setPhotoFile(file);
    setError(null);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      debug.log('New photo preview created');
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleTakePhoto = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    setOriginalPhotoUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !snag) {
      debug.error('Cannot submit: user or snag is missing', { 
        hasUser: !!user, 
        hasSnag: !!snag 
      });
      return;
    }
    
    if (!note && !photoPreview) {
      const errorMsg = 'Please add a note or upload a photo';
      debug.error(errorMsg);
      setError(errorMsg);
      return;
    }

    setIsSaving(true);
    setError(null);
    debug.log('Starting snag update process', { 
      snagId, 
      hasNewPhoto: !!photoFile,
      hasNote: !!note.trim()
    });

    try {
      let photoUrl = originalPhotoUrl;
      
      // Upload new photo if one was selected
      if (photoFile) {
        debug.log('Uploading new photo...');
        try {
          photoUrl = await uploadSnagPhoto(user.id, photoFile);
          debug.log('New photo uploaded successfully', { photoUrl });
        } catch (photoError) {
          debug.error('Photo upload failed, continuing with note only', photoError);
          // Continue with just the note if photo upload fails
        }
      }

      // Update the snag
      debug.log('Updating snag record...');
      await updateSnag(
        user.id,
        snagId,
        note.trim() || null,
        photoUrl
      );
      debug.log('Snag updated successfully');

      // Navigate back to the summary page
      debug.log('Navigating back to summary page');
      router.push('/snags/summary');
    } catch (error) {
      debug.error('Error updating snag:', error);
      setError('Failed to update snag. Please try again.');
      setIsSaving(false);
    }
  };

  if (loading || isLoading) {
    return (
      <main className="flex min-h-screen flex-col overflow-x-hidden">
        <Navigation isAuthenticated={!!user} />
        <div className="flex flex-1 items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </main>
    );
  }

  if (error && !note && !photoPreview) {
    return (
      <main className="flex min-h-screen flex-col overflow-x-hidden">
        <Navigation isAuthenticated={!!user} />
        <div className="flex flex-1 flex-col p-6 animate-fade-in">
          <div className="container mx-auto max-w-4xl">
            <div className="bg-white shadow-sm rounded-xl p-6 md:p-8 border border-gray-100">
              <div className="text-center py-8">
                <div className="text-error mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mx-auto">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                </div>
                <h1 className="text-xl font-bold mb-4">Error</h1>
                <p className="mb-6 text-gray-dark">{error}</p>
                <Link href="/snags/summary" className="btn btn-primary rounded-pill py-2 px-6">
                  Go Back to Summary
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col overflow-x-hidden">
      <Navigation isAuthenticated={!!user} />
      <div className="flex flex-1 flex-col p-6 animate-fade-in">
        <div className="container mx-auto max-w-4xl">
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
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-xl md:text-2xl font-bold">Edit Snag</h1>
            </div>
            
            {snag && (
              <div className="bg-primary/10 rounded-lg p-6 mb-8 border border-primary/10">
                <h2 className="font-semibold mb-3 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-primary">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Check item:
                </h2>
                <p className="text-lg">{snag.checklist_item?.friendly_text || 'Unknown item'}</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-error/10 text-error rounded-lg p-4 border border-error/20">
                  {error}
                </div>
              )}
              
              <div>
                <label htmlFor="note" className="block font-medium mb-2">Note</label>
                <textarea
                  id="note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={4}
                  placeholder="Describe the issue..."
                ></textarea>
              </div>
              
              <div>
                <label className="block font-medium mb-2">Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  ref={fileInputRef}
                  className="hidden"
                />
                
                {photoPreview ? (
                  <div className="mt-2">
                    <div className="relative">
                      <img 
                        src={photoPreview} 
                        alt="Preview" 
                        className="rounded-lg w-full max-h-64 object-cover"
                      />
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="absolute top-2 right-2 bg-error text-white rounded-full p-1"
                        aria-label="Remove photo"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleTakePhoto}
                    className="w-full flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg p-6 hover:border-primary transition-colors"
                  >
                    <div className="text-center">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 mx-auto text-gray-dark mb-2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                      </svg>
                      <p className="text-gray-dark">Click to take a photo or upload an image</p>
                    </div>
                  </button>
                )}
              </div>
              
              <div className="flex justify-between pt-4">
                <Link
                  href="/snags/summary"
                  className="btn btn-outline rounded-pill px-6 py-2"
                >
                  Cancel
                </Link>
                
                <button
                  type="submit"
                  disabled={isSaving}
                  className="btn btn-primary rounded-pill px-6 py-2"
                >
                  {isSaving ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      Save Changes
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 ml-2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
