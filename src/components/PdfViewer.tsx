'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface PdfViewerProps {
  pdfUrl: string;
  onClose: () => void;
  filename: string;
}

export default function PdfViewer({ pdfUrl, onClose, filename }: PdfViewerProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Prevent scrolling on the body when modal is open
    document.body.style.overflow = 'hidden';
    
    // Handle escape key to close modal
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    document.addEventListener('keydown', handleEscape);
    
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  // Close when clicking outside the iframe
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && e.target === modalRef.current) {
      onClose();
    }
  };

  // Handle download button click
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle share button click (if Web Share API is available)
  const handleShare = async () => {
    if (navigator.share) {
      try {
        // Convert the blob URL to a file
        const response = await fetch(pdfUrl);
        const blob = await response.blob();
        const file = new File([blob], filename, { type: 'application/pdf' });
        
        await navigator.share({
          title: 'Snag List',
          text: 'Here is my snag list from SnaggedIt Lite',
          files: [file]
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      handleDownload();
    }
  };

  return createPortal(
    <div 
      ref={modalRef}
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl flex flex-col h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Snag List PDF</h2>
          <div className="flex space-x-2">
            <button 
              onClick={handleShare}
              className="px-3 py-1 bg-primary hover:bg-primary-hover text-gray-dark rounded-full text-sm"
              aria-label="Share PDF"
            >
              Share
            </button>
            <button 
              onClick={handleDownload}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-dark rounded-full text-sm"
              aria-label="Download PDF"
            >
              Download
            </button>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Close PDF viewer"
            >
              ✕
            </button>
          </div>
        </div>
        <div className="flex-grow overflow-hidden">
          <iframe 
            src={pdfUrl} 
            className="w-full h-full" 
            title="Snag List PDF"
          />
        </div>
      </div>
    </div>,
    document.body
  );
}
