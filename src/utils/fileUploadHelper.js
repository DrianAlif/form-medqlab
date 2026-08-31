import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker using unpkg / cdnjs worker url
if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
}

/**
 * Converts an uploaded File (Image or PDF) into one or more Image Data URL objects
 * @param {File} file 
 * @returns {Promise<Array<{id: string, name: string, dataUrl: string, caption: string}>>}
 */
export async function processUploadedFile(file) {
  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

  if (isPdf) {
    return await convertPdfToImages(file);
  } else {
    return await convertImageToDataUrl(file);
  }
}

/**
 * Process normal image files
 */
function convertImageToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      resolve([
        {
          id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          name: file.name,
          dataUrl: event.target.result,
          caption: file.name.replace(/\.[^/.]+$/, "")
        }
      ]);
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Render all pages of a PDF into high-res PNG Data URLs
 */
async function convertPdfToImages(file) {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  const pageCount = pdf.numPages;
  const results = [];

  for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 2.0 }); // 2x scale for sharp text

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({
      canvasContext: context,
      viewport: viewport
    }).promise;

    const dataUrl = canvas.toDataURL('image/png', 0.95);
    const baseName = file.name.replace(/\.[^/.]+$/, "");
    const caption = pageCount > 1 ? `${baseName} (Hal. ${pageNum})` : baseName;

    results.push({
      id: `att-${Date.now()}-${pageNum}-${Math.random().toString(36).substr(2, 5)}`,
      name: file.name,
      dataUrl: dataUrl,
      caption: caption
    });
  }

  return results;
}
