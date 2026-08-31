/**
 * High quality client-side PDF export engine using html2pdf.js
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
      scale: 2.5, // Crisp high-DPI rendering
      useCORS: true,
      logging: false,
      letterRendering: true,
      scrollY: 0,
      windowWidth: orientation === 'landscape' ? 1200 : 900
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: orientation // 'portrait' or 'landscape'
    },
    pagebreak: { mode: ['css', 'legacy'], before: '.html2pdf__page-break' }
  };

  try {
    await html2pdf().set(opt).from(element).save();
    return true;
  } catch (error) {
    console.error('PDF export failed:', error);
    // Fallback to print
    window.print();
    return false;
  }
}
