/**
 * Master PDF Export Engine using html2pdf.js + html2canvas + jsPDF
 * Calibrated for high-DPI rendering, anti-distortion image scaling, and precise page breaks.
 */

export async function exportToPdf(elementId, filename = 'document.pdf', orientation = 'portrait') {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found`);
    return;
  }

  // Dynamically load html2pdf if not already loaded
  const html2pdf = (await import('html2pdf.js')).default;

  const opt = {
    margin: [0, 0, 0, 0],
    filename: filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2.8, // 300 DPI high-definition capture
      useCORS: true,
      allowTaint: true,
      logging: false,
      letterRendering: true,
      scrollY: 0,
      windowWidth: orientation === 'landscape' ? 1280 : 960
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
      avoid: ['.no-break', '.signature-section', 'tr']
    }
  };

  try {
    await html2pdf().set(opt).from(element).save();
    return true;
  } catch (error) {
    console.error('PDF export failed:', error);
    // Fallback to native print dialog
    window.print();
    return false;
  }
}
