
import { OutputFormat, FORMAT_MIME_TYPES, FORMAT_EXTENSIONS } from '../types';

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // Remove the Data-URI prefix (e.g. "data:application/pdf;base64,")
        const base64String = reader.result.split(',')[1];
        resolve(base64String);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = (error) => reject(error);
  });
};

export const downloadContent = (content: string, format: OutputFormat, originalFileName: string) => {
  const mimeType = FORMAT_MIME_TYPES[format];
  const extension = FORMAT_EXTENSIONS[format];
  
  let finalContent = content;

  // For DOC, wrap in basic HTML
  if (format === OutputFormat.DOC) {
      finalContent = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head><meta charset='utf-8'><title>Export Document</title></head>
        <body><pre>${content}</pre></body>
        </html>
      `;
  }
  
  // For CSV, just use the raw text, but maybe ensure newlines are respected
  if (format === OutputFormat.CSV) {
      // Very basic text-to-csv: put everything in one column or just dump text
      // Ideally, we'd split by newlines
      finalContent = content; 
  }

  const blob = new Blob([finalContent], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  const baseName = originalFileName.replace(/\.[^/.]+$/, "");
  link.download = `${baseName}_extracted${extension}`;
  
  document.body.appendChild(link);
  link.click();
  
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
