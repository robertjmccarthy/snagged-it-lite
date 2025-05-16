'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { format } from 'date-fns';

// Import html2pdf dynamically to avoid SSR issues
let html2pdf: any = null;

interface Snag {
  id: string;
  checklist_item?: {
    friendly_text: string;
  };
  note?: string;
  photo_url?: string;
  created_at: string;
}

interface ShareDetails {
  address: string;
  builder_name: string;
  builder_email: string;
  updated_at: string;
  full_name?: string;
}

interface PdfDownloadButtonProps {
  snags: Snag[];
  shareDetails: ShareDetails;
  className?: string;
}

export default function PdfDownloadButton({ snags, shareDetails, className = '' }: PdfDownloadButtonProps) {
  const pdfContentRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  // Keep track of created blob URLs to clean them up later
  const blobUrlRef = useRef<string | null>(null);

  const handleDownload = useCallback(async () => {
    try {
      // Dynamically import html2pdf to avoid SSR issues
      if (!html2pdf) {
        html2pdf = (await import('html2pdf.js')).default;
      }

      // Format the filename with the date
      const dateStr = format(new Date(), 'yyyy-MM-dd');
      const filename = `snag-list-${dateStr}.pdf`;
      
      // Create a temporary div for PDF content
      const tempDiv = document.createElement('div');
      tempDiv.className = 'pdf-content';
      tempDiv.style.padding = '20px';
      tempDiv.style.fontFamily = 'Arial, sans-serif';
      
      // Add SnaggedIt logo using the exact SVG from the app
      const logoContainer = document.createElement('div');
      logoContainer.style.marginBottom = '30px';
      
      // Create the logo using a data URL of the SVG
      const logoImg = document.createElement('img');
      const svgContent = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg width="240" height="60" viewBox="0 0 180 40" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="greenHighlight" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#BBF2D8" />
      <stop offset="100%" stop-color="#BBF2D8" />
    </linearGradient>
  </defs>
  <g>
    <!-- Highlight background that only covers part of the text height -->
    <rect x="10" y="22" width="115" height="9" fill="url(#greenHighlight)" />
    <!-- Text on top of the highlight -->
    <text x="10" y="28" font-family="Arial, sans-serif" font-weight="bold" font-size="24" letter-spacing="-0.5" fill="black">SnaggedIt</text>
  </g>
</svg>`;
      
      // Convert the SVG to a data URL
      const svgBase64 = btoa(svgContent);
      logoImg.src = `data:image/svg+xml;base64,${svgBase64}`;
      logoImg.alt = 'SnaggedIt Logo';
      logoImg.style.width = '240px';
      logoImg.style.height = '60px';
      
      logoContainer.appendChild(logoImg);
      
      // Add a text fallback in case the image doesn't render
      const logoTextFallback = document.createElement('div');
      logoTextFallback.style.display = 'none'; // Hidden by default
      logoTextFallback.textContent = 'SnaggedIt';
      logoTextFallback.style.fontFamily = 'Arial, sans-serif';
      logoTextFallback.style.fontWeight = 'bold';
      logoTextFallback.style.fontSize = '24px';
      logoContainer.appendChild(logoTextFallback);
      
      tempDiv.appendChild(logoContainer);
      
      // Create a container for the details section with light grey background, rounded corners, and light grey outline
      const detailsContainer = document.createElement('div');
      detailsContainer.style.backgroundColor = '#f5f5f5'; // Light grey background
      detailsContainer.style.border = '1px solid #e2e2e2';
      detailsContainer.style.borderRadius = '8px';
      // Set explicit padding for each side to ensure consistency
      detailsContainer.style.paddingTop = '20px';
      detailsContainer.style.paddingRight = '20px';
      detailsContainer.style.paddingBottom = '20px';
      detailsContainer.style.paddingLeft = '20px';
      detailsContainer.style.marginBottom = '30px';
      detailsContainer.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
      detailsContainer.style.boxSizing = 'border-box';
      detailsContainer.style.lineHeight = '1.4';
      detailsContainer.style.display = 'block';
      
      // Add details title inside the container - using a div instead of h2 to avoid browser default spacing
      const detailsTitle = document.createElement('div');
      detailsTitle.textContent = 'Details';
      detailsTitle.style.color = '#333333';
      detailsTitle.style.fontSize = '22px'; // Increased to match Snags heading
      detailsTitle.style.fontWeight = 'bold';
      detailsTitle.style.margin = '0';
      detailsTitle.style.padding = '0';
      detailsTitle.style.lineHeight = '1.2';
      detailsTitle.style.marginBottom = '15px';
      detailsContainer.appendChild(detailsTitle);
      
      // Create the details list inside the container
      const detailsList = document.createElement('ul');
      detailsList.style.listStyleType = 'none';
      detailsList.style.padding = '0';
      detailsList.style.margin = '0';
      
      const details = [
        { label: 'Snag list completed on', value: format(new Date(shareDetails.updated_at), 'MMMM d, yyyy') },
        { label: 'Homeowner', value: shareDetails.full_name || 'Not specified' },
        { label: 'Address', value: shareDetails.address },
        { label: 'Builder', value: shareDetails.builder_name },
        { label: 'Number of snags', value: snags.length.toString() }
      ];
      
      details.forEach(detail => {
        const item = document.createElement('li');
        item.style.marginBottom = '10px';
        item.style.fontSize = '14px';
        
        const label = document.createElement('strong');
        label.textContent = `${detail.label}: `;
        item.appendChild(label);
        
        const value = document.createTextNode(detail.value);
        item.appendChild(value);
        
        detailsList.appendChild(item);
      });
      
      detailsContainer.appendChild(detailsList);
      
      // Append the details container to the main div
      tempDiv.appendChild(detailsContainer);
      
      // Add snag list title
      const snagTitle = document.createElement('div');
      snagTitle.textContent = 'Snags';
      snagTitle.style.color = '#333333';
      snagTitle.style.fontSize = '22px';
      snagTitle.style.fontWeight = 'bold';
      snagTitle.style.marginBottom = '15px';
      snagTitle.style.marginTop = '20px';
      tempDiv.appendChild(snagTitle);
      
      // Create container for all snags
      const snagsContainer = document.createElement('div');
      snagsContainer.style.marginBottom = '30px';
      
      // Process each snag
      for (let index = 0; index < snags.length; index++) {
        const snag = snags[index];
        
        // Create a box for each snag
        const snagBox = document.createElement('div');
        snagBox.style.backgroundColor = '#ffffff';
        snagBox.style.border = '1px solid #e2e2e2';
        snagBox.style.borderRadius = '8px';
        snagBox.style.padding = '20px';
        snagBox.style.marginBottom = '15px';
        snagBox.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
        snagBox.style.boxSizing = 'border-box';
        
        // Add check carried out subheading
        const checkHeading = document.createElement('div');
        checkHeading.textContent = 'Check carried out';
        checkHeading.style.fontWeight = 'bold';
        checkHeading.style.fontSize = '16px';
        checkHeading.style.marginBottom = '8px';
        snagBox.appendChild(checkHeading);
        
        // Add issue text
        const issueText = document.createElement('div');
        issueText.textContent = snag.checklist_item?.friendly_text || 'Snag';
        issueText.style.fontSize = '14px';
        issueText.style.marginBottom = '15px';
        snagBox.appendChild(issueText);
        
        // Add horizontal grey line
        const horizontalLine = document.createElement('div');
        horizontalLine.style.borderBottom = '1px solid #e2e2e2';
        horizontalLine.style.marginBottom = '15px';
        snagBox.appendChild(horizontalLine);
        
        // Add notes section if notes exist
        if (snag.note && snag.note.trim() !== '') {
          const notesHeading = document.createElement('div');
          notesHeading.textContent = 'Notes';
          notesHeading.style.fontWeight = 'bold';
          notesHeading.style.fontSize = '16px';
          notesHeading.style.marginBottom = '8px';
          snagBox.appendChild(notesHeading);
          
          const notesText = document.createElement('div');
          notesText.textContent = snag.note;
          notesText.style.fontSize = '14px';
          notesText.style.marginBottom = '15px';
          snagBox.appendChild(notesText);
        }
        
        // Add photo section if photo exists
        if (snag.photo_url) {
          const photoHeading = document.createElement('div');
          photoHeading.textContent = 'Photo';
          photoHeading.style.fontWeight = 'bold';
          photoHeading.style.fontSize = '16px';
          photoHeading.style.marginBottom = '8px';
          snagBox.appendChild(photoHeading);
          
          // Create the image container
          const imgContainer = document.createElement('div');
          imgContainer.style.textAlign = 'center';
          imgContainer.style.marginBottom = '10px';
          
          // Create the image element
          const img = document.createElement('img');
          img.src = snag.photo_url;
          img.alt = 'Snag photo';
          img.style.maxWidth = '100%';
          img.style.maxHeight = '200px';
          img.style.objectFit = 'contain';
          img.style.margin = '0 auto';
          img.style.display = 'block';
          img.crossOrigin = 'anonymous'; // Handle CORS issues
          
          imgContainer.appendChild(img);
          snagBox.appendChild(imgContainer);
        }
        
        // Add the snag box to the container
        snagsContainer.appendChild(snagBox);
      }
      
      // Add the snags container to the main div
      tempDiv.appendChild(snagsContainer);
      
      // Add footer
      const footer = document.createElement('footer');
      footer.style.borderTop = '1px solid #ddd';
      footer.style.paddingTop = '10px';
      footer.style.fontSize = '12px';
      footer.style.color = '#666';
      footer.style.textAlign = 'left';
      footer.textContent = 'Snag list created using snagged-it.co.uk';
      tempDiv.appendChild(footer);
      
      // Append the temp div to the body temporarily
      document.body.appendChild(tempDiv);
      
      // Generate PDF
      const options = {
        margin: 10,
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true,
          allowTaint: true,
          logging: true
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      
      // Generate PDF as blob for all devices
      const pdfBlob = await html2pdf().from(tempDiv).set(options).outputPdf('blob');
      
      // Create a blob URL
      const blobUrl = URL.createObjectURL(pdfBlob);
      
      // Store the blob URL for cleanup later
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
      }
      blobUrlRef.current = blobUrl;
      
      // Open the PDF in a new tab
      window.open(blobUrl, '_blank');
      
      // Remove the temp div
      document.body.removeChild(tempDiv);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('There was a problem generating your PDF. Please try again later.');
    }
  }, [snags, shareDetails]);

  // Clean up any blob URLs when component unmounts
  useEffect(() => {
    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, []);

  return (
    <button
      onClick={() => {
        setIsLoading(true);
        handleDownload().finally(() => setIsLoading(false));
      }}
      className={`menu-item bg-primary hover:bg-primary-hover ${className} ${isLoading ? 'opacity-70 cursor-wait' : ''}`}
      aria-label="Download your snag list as PDF"
      disabled={isLoading}
    >
      {isLoading ? 'Generating PDF...' : 'Download your snag list (PDF)'}
    </button>
  );
}
