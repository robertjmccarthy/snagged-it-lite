'use client';

import { useCallback, useRef } from 'react';
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
}

interface PdfDownloadButtonProps {
  snags: Snag[];
  shareDetails: ShareDetails;
  className?: string;
}

export default function PdfDownloadButton({ snags, shareDetails, className = '' }: PdfDownloadButtonProps) {
  const pdfContentRef = useRef<HTMLDivElement>(null);

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
      
      // Add title and date
      const title = document.createElement('h1');
      title.textContent = 'Snag List Report';
      title.style.textAlign = 'center';
      title.style.color = '#31593E';
      title.style.fontSize = '24px';
      title.style.marginBottom = '5px';
      tempDiv.appendChild(title);
      
      const dateElement = document.createElement('p');
      dateElement.textContent = `Generated on ${format(new Date(), 'MMMM d, yyyy')}`;
      dateElement.style.textAlign = 'center';
      dateElement.style.color = '#333333';
      dateElement.style.fontSize = '12px';
      dateElement.style.marginTop = '0';
      dateElement.style.marginBottom = '30px';
      tempDiv.appendChild(dateElement);
      
      // Add property details
      const detailsTitle = document.createElement('h2');
      detailsTitle.textContent = 'Property Details';
      detailsTitle.style.color = '#333333';
      detailsTitle.style.fontSize = '18px';
      detailsTitle.style.marginBottom = '10px';
      tempDiv.appendChild(detailsTitle);
      
      const detailsList = document.createElement('ul');
      detailsList.style.listStyleType = 'none';
      detailsList.style.padding = '0';
      detailsList.style.marginBottom = '30px';
      
      const details = [
        { label: 'Address', value: shareDetails.address },
        { label: 'Builder', value: shareDetails.builder_name },
        { label: 'Builder Email', value: shareDetails.builder_email },
        { label: 'Shared on', value: format(new Date(shareDetails.updated_at), 'MMMM d, yyyy') },
        { label: 'Total Snags', value: snags.length.toString() }
      ];
      
      details.forEach(detail => {
        const item = document.createElement('li');
        item.style.marginBottom = '8px';
        item.style.fontSize = '12px';
        
        const label = document.createElement('strong');
        label.textContent = `${detail.label}: `;
        item.appendChild(label);
        
        const value = document.createTextNode(detail.value);
        item.appendChild(value);
        
        detailsList.appendChild(item);
      });
      
      tempDiv.appendChild(detailsList);
      
      // Add snag table
      const snagTitle = document.createElement('h2');
      snagTitle.textContent = 'Recorded Snags';
      snagTitle.style.color = '#333333';
      snagTitle.style.fontSize = '18px';
      snagTitle.style.marginBottom = '10px';
      tempDiv.appendChild(snagTitle);
      
      const table = document.createElement('table');
      table.style.width = '100%';
      table.style.borderCollapse = 'collapse';
      table.style.marginBottom = '30px';
      
      // Create table header
      const thead = document.createElement('thead');
      const headerRow = document.createElement('tr');
      ['Issue', 'Notes', 'Date Recorded'].forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        th.style.backgroundColor = '#85E0A3';
        th.style.color = '#333333';
        th.style.padding = '8px';
        th.style.textAlign = 'left';
        th.style.border = '1px solid #ddd';
        headerRow.appendChild(th);
      });
      thead.appendChild(headerRow);
      table.appendChild(thead);
      
      // Create table body
      const tbody = document.createElement('tbody');
      
      // Process each snag
      for (let index = 0; index < snags.length; index++) {
        const snag = snags[index];
        const isEven = index % 2 === 0;
        
        // Create a row for snag details
        const row = document.createElement('tr');
        row.style.backgroundColor = isEven ? '#f2f2f2' : 'white';
        
        // Issue column
        const issueCell = document.createElement('td');
        issueCell.textContent = snag.checklist_item?.friendly_text || 'Snag';
        issueCell.style.padding = '8px';
        issueCell.style.border = '1px solid #ddd';
        row.appendChild(issueCell);
        
        // Notes column
        const notesCell = document.createElement('td');
        notesCell.textContent = snag.note || 'No notes';
        notesCell.style.padding = '8px';
        notesCell.style.border = '1px solid #ddd';
        row.appendChild(notesCell);
        
        // Date column
        const dateCell = document.createElement('td');
        dateCell.textContent = format(new Date(snag.created_at), 'MMM d, yyyy');
        dateCell.style.padding = '8px';
        dateCell.style.border = '1px solid #ddd';
        row.appendChild(dateCell);
        
        tbody.appendChild(row);
        
        // If the snag has a photo, add a row for it
        if (snag.photo_url) {
          // Create a row for the photo
          const photoRow = document.createElement('tr');
          photoRow.style.backgroundColor = isEven ? '#f2f2f2' : 'white';
          
          // Create a cell that spans all columns
          const photoCell = document.createElement('td');
          photoCell.colSpan = 3;
          photoCell.style.padding = '8px';
          photoCell.style.border = '1px solid #ddd';
          photoCell.style.textAlign = 'center';
          
          // Create the image element
          const img = document.createElement('img');
          img.src = snag.photo_url;
          img.alt = 'Snag photo';
          img.style.maxWidth = '100%';
          img.style.maxHeight = '200px';
          img.style.objectFit = 'contain';
          img.style.margin = '10px auto';
          img.style.display = 'block';
          img.crossOrigin = 'anonymous'; // Handle CORS issues
          
          photoCell.appendChild(img);
          photoRow.appendChild(photoCell);
          tbody.appendChild(photoRow);
        }
      }
      
      table.appendChild(tbody);
      tempDiv.appendChild(table);
      
      // Add footer
      const footer = document.createElement('footer');
      footer.style.borderTop = '1px solid #ddd';
      footer.style.paddingTop = '10px';
      footer.style.fontSize = '10px';
      footer.style.color = '#666';
      footer.style.textAlign = 'center';
      footer.textContent = 'Generated by SnaggedIt Lite - www.snaggedit.com';
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
      
      await html2pdf().from(tempDiv).set(options).save();
      
      // Remove the temp div
      document.body.removeChild(tempDiv);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('There was a problem generating your PDF. Please try again later.');
    }
  }, [snags, shareDetails]);

  return (
    <button
      onClick={handleDownload}
      className={`menu-item bg-primary hover:bg-primary-hover ${className}`}
      aria-label="Download snag list as PDF"
    >
      Download snag list (PDF)
    </button>
  );
}
