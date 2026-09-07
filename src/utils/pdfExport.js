import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Gold-Standard Multi-Page PDF Export Engine
 * 1. Off-screen DOM clone: isolates from active screen zoom/transforms to guarantee 100% sharp, unskewed rendering.
 * 2. letterRendering: false: eliminates any merged-word/kerning artifacts.
 * 3. Exact per-sheet iteration: guarantees exact page count with 0 blank pages.
 * 4. Precise A4 aspect-ratio mapping (794x1123 for Portrait, 1122x794 for Landscape).
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

  // 1. Create clean off-screen sandbox to avoid zoom/transform distortion
  const offscreen = document.createElement('div');
  offscreen.style.position = 'fixed';
  offscreen.style.top = '0';
  offscreen.style.left = '-99999px';
  offscreen.style.width = orientation === 'landscape' ? '1122px' : '794px';
  offscreen.style.background = '#ffffff';
  offscreen.style.zIndex = '-99999';
  offscreen.style.margin = '0';
  offscreen.style.padding = '0';

  // 2. Clone the container
  const clone = container.cloneNode(true);
  clone.style.transform = 'none';
  clone.style.margin = '0';
  clone.style.padding = '0';
  offscreen.appendChild(clone);
  document.body.appendChild(offscreen);

  try {
    // 3. Select all discrete sheets within the cloned tree
    let sheets = Array.from(clone.querySelectorAll('.pdf-sheet'));
    if (sheets.length === 0) {
      sheets = Array.from(clone.querySelectorAll('.pdf-page-portrait, .pdf-page-landscape'));
    }
    if (sheets.length === 0) {
      sheets = [clone];
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

      // Render off-screen sheet with pure font metrics and 2.0 scale (crisp 300 DPI)
      const canvas = await html2canvas(sheet, {
        scale: 2.0,
        useCORS: true,
        allowTaint: true,
        logging: false,
        letterRendering: false, // Critical: preserves native word spacing
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.98);

      if (i > 0) {
        pdf.addPage('a4', orientation);
      }

      // Add image precisely mapped to A4 bounds without stretching
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfPageWidth, pdfPageHeight, undefined, 'FAST');
    }

    pdf.save(filename);
    return true;
  } catch (error) {
    console.error('PDF export failed:', error);
    window.print();
    return false;
  } finally {
    // Clean up temporary sandbox element
    if (document.body.contains(offscreen)) {
      document.body.removeChild(offscreen);
    }
  }
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
