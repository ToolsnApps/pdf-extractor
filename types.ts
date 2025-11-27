export enum OutputFormat {
  TXT = 'TXT',
  DOC = 'DOC',
  CSV = 'CSV',
  JSON = 'JSON',
  MD = 'MD'
}

export interface ConversionState {
  isUploading: boolean;
  isProcessing: boolean;
  progress: number; // 0 to 100
  error: string | null;
  result: string | null;
}

export interface FileData {
  file: File;
  base64: string;
}

export const FORMAT_LABELS: Record<OutputFormat, string> = {
  [OutputFormat.TXT]: 'Plain Text (.txt)',
  [OutputFormat.DOC]: 'Microsoft Word (.doc)',
  [OutputFormat.CSV]: 'Excel Spreadsheet (.csv)',
  [OutputFormat.JSON]: 'JSON Data (.json)',
  [OutputFormat.MD]: 'Markdown (.md)',
};

export const FORMAT_MIME_TYPES: Record<OutputFormat, string> = {
  [OutputFormat.TXT]: 'text/plain',
  [OutputFormat.DOC]: 'application/msword', 
  [OutputFormat.CSV]: 'text/csv',
  [OutputFormat.JSON]: 'application/json',
  [OutputFormat.MD]: 'text/markdown',
};

export const FORMAT_EXTENSIONS: Record<OutputFormat, string> = {
  [OutputFormat.TXT]: '.txt',
  [OutputFormat.DOC]: '.doc',
  [OutputFormat.CSV]: '.csv',
  [OutputFormat.JSON]: '.json',
  [OutputFormat.MD]: '.md',
};