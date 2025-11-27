
declare global {
  interface Window {
    pdfjsLib: any;
  }
}

export const extractTextFromPdf = async (base64Pdf: string): Promise<string> => {
  if (!window.pdfjsLib) {
    throw new Error("PDF.js library not loaded");
  }

  // Set the worker source
  window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

  try {
    // Convert base64 to binary
    const binaryString = window.atob(base64Pdf);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Load the document
    const loadingTask = window.pdfjsLib.getDocument({ data: bytes });
    const pdf = await loadingTask.promise;

    let fullText = '';
    const totalPages = pdf.numPages;

    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      // Join text items with a space, but try to respect newlines based on Y position roughly
      // For simple extraction, joining items with space and checking for empty strings is the baseline
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');

      fullText += `--- Page ${pageNum} ---\n\n${pageText}\n\n`;
    }

    return fullText;

  } catch (error) {
    console.error("PDF Extraction Error:", error);
    throw new Error("Failed to extract text from this PDF. The file might be corrupted or password protected.");
  }
};
