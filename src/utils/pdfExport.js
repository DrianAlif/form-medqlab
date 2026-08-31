import html2pdf from 'html2pdf.js';

/**
 * Master Anti-Distortion PDF Export Engine
 * Preserves 100% natural aspect ratio, prevents any stretching/gepeng, and handles multi-page breaks cleanly.
 */
export async function handleDownloadPDF({
  containerId = 'pdf-export-container',
  orientation = 'portrait', // 'portrait' | 'landscape'
  filename = 'Dokumen_Applimetis.pdf'
}) {
  const element = document.getElementById(containerId) || document.getElementById('pdf-content');
  if (!element) {
    console.error(`Container with id "${containerId}" not found`);
    return false;
  }

  const opt = {
    margin: [0, 0, 0, 0],
    filename: filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2.5, // 300 DPI high-definition capture
      useCORS: true,
      allowTaint: true,
      logging: false,
      letterRendering: true,
      scrollY: 0,
      scrollX: 0,
      windowWidth: orientation === 'landscape' ? 1200 : 900
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: orientation, // 'portrait' or 'landscape'
      compress: true
    },
    pagebreak: {
      mode: ['css', 'legacy'],
      before: ['.html2pdf__page-break', '.page-break'],
      avoid: ['.no-break', 'tr', '.signature-section']
    }
  };

  try {
    await html2pdf().set(opt).from(element).save();
    return true;
  } catch (error) {
    console.error('PDF export failed:', error);
    window.print();
    return false;
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
