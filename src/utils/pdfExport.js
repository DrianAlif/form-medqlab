import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * High-Precision Multi-Page Sequential Canvas PDF Renderer (jsPDF + html2canvas)
 * Renders each A4 page container individually to guarantee 100% precision, zero vertical slicing, and exact (0,0) placement.
 */
export async function handleDownloadPDF({
  containerId = 'pdf-export-container',
  orientation = 'portrait', // 'portrait' | 'landscape'
  filename = 'Dokumen_Applimetis.pdf'
}) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container with id "${containerId}" not found`);
    return false;
  }

  // Find all page sheets in container
  const targetSelector = orientation === 'portrait'
    ? '.pdf-page-portrait, .pdf-page-container'
    : '.pdf-page-landscape, .pdf-page-container';
  
  let pages = Array.from(container.querySelectorAll(targetSelector));

  // If no child pages found, use the container itself
  if (pages.length === 0) {
    pages = [container];
  }

  const pdf = new jsPDF({
    orientation: orientation,
    unit: 'mm',
    format: 'a4',
    compress: true
  });

  const pdfWidth = orientation === 'portrait' ? 210 : 297;
  const pdfHeight = orientation === 'portrait' ? 297 : 210;

  for (let i = 0; i < pages.length; i++) {
    const pageElement = pages[i];

    const canvas = await html2canvas(pageElement, {
      scale: 2.5, // 300 DPI crisp output
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);

    if (i > 0) {
      pdf.addPage('a4', orientation);
    }

    // Lock image exactly to sheet bounds (0, 0, pdfWidth, pdfHeight)
    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
  }

  pdf.save(filename);
  return true;
}

/**
 * Browser Native Print Trigger with Auto-Orientation Lock
 */
export function handlePrintDocument(orientation = 'portrait') {
  document.body.setAttribute('data-form-orientation', orientation);
  window.print();
}

/**
 * Backward compatibility alias
 */
export async function exportToPdf(elementId, filename = 'document.pdf', orientation = 'portrait') {
  return await handleDownloadPDF({
    containerId: elementId,
    filename: filename,
    orientation: orientation
  });
}
