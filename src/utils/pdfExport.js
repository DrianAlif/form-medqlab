import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Exact Per-Sheet Sequential PDF Export Engine (jsPDF + html2canvas)
 * - Guarantees EXACT page count (zero blank pages).
 * - Preserves 100% mathematical aspect ratio (zero gepeng / zero stretching).
 * - 300 DPI high-definition capture (scale: 2.5).
 */
export async function handleDownloadPDF({
  containerId = 'pdf-export-container',
  orientation = 'portrait', // 'portrait' | 'landscape'
  filename = 'Dokumen_Applimetis.pdf'
}) {
  const container = document.getElementById(containerId) || document.getElementById('pdf-content');
  if (!container) {
    console.error(`Container with id "${containerId}" not found`);
    return false;
  }

  // 1. Select each discrete page sheet
  let sheets = Array.from(container.querySelectorAll('.pdf-sheet'));
  if (sheets.length === 0) {
    sheets = Array.from(container.querySelectorAll('.pdf-page-portrait, .pdf-page-landscape'));
  }
  if (sheets.length === 0) {
    sheets = [container];
  }

  const pdf = new jsPDF({
    orientation: orientation,
    unit: 'mm',
    format: 'a4',
    compress: true
  });

  const pdfPageWidth = orientation === 'portrait' ? 210 : 297;
  const pdfPageHeight = orientation === 'portrait' ? 297 : 210;

  for (let i = 0; i < sheets.length; i++) {
    const sheet = sheets[i];

    // High resolution render of this specific sheet
    const canvas = await html2canvas(sheet, {
      scale: 2.5, // 300 DPI crisp render
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);

    if (i > 0) {
      pdf.addPage('a4', orientation);
    }

    // Calculate natural proportional dimensions to PREVENT ANY GEPENG / STRETCHING
    const canvasRatio = canvas.height / canvas.width;
    let renderWidth = pdfPageWidth;
    let renderHeight = pdfPageWidth * canvasRatio;
    let xOffset = 0;
    let yOffset = 0;

    if (renderHeight > pdfPageHeight) {
      renderHeight = pdfPageHeight;
      renderWidth = pdfPageHeight / canvasRatio;
      xOffset = (pdfPageWidth - renderWidth) / 2;
    }

    // Add image with strictly preserved aspect ratio
    pdf.addImage(imgData, 'JPEG', xOffset, yOffset, renderWidth, renderHeight, undefined, 'FAST');
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
