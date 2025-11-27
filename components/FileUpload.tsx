import React, { useCallback, useState } from 'react';
import { UploadIcon, FileIcon, CheckIcon } from './Icons';
import { FileData } from '../types';
import { fileToBase64 } from '../utils/fileUtils';

interface FileUploadProps {
  onFileSelect: (data: FileData) => void;
  selectedFileName: string | null;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, selectedFileName }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processFile = async (file: File) => {
    setError(null);
    if (file.type !== 'application/pdf') {
      setError('Only PDF files are supported.');
      return;
    }
    // Limit file size to 20MB for safety (Gemini supports up to 2GB but browser handling large base64 strings can be tricky)
    if (file.size > 20 * 1024 * 1024) {
      setError('File size too large (Max 20MB).');
      return;
    }

    try {
      const base64 = await fileToBase64(file);
      onFileSelect({ file, base64 });
    } catch (e) {
        console.error(e);
      setError('Error reading file.');
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onFileSelect]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer
          ${isDragging 
            ? 'border-indigo-500 bg-indigo-50' 
            : selectedFileName 
              ? 'border-green-400 bg-green-50' 
              : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'
          }
        `}
      >
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="flex flex-col items-center justify-center space-y-4">
          {selectedFileName ? (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                <CheckIcon className="w-8 h-8" />
              </div>
              <div>
                <p className="text-lg font-medium text-green-700">Ready to convert</p>
                <p className="text-sm text-green-600 mt-1 flex items-center justify-center gap-2">
                  <FileIcon className="w-4 h-4" />
                  {selectedFileName}
                </p>
                <p className="text-xs text-slate-400 mt-2">Click or drag to change file</p>
              </div>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                <UploadIcon className="w-8 h-8" />
              </div>
              <div>
                <p className="text-lg font-medium text-slate-700">Drop your PDF here</p>
                <p className="text-sm text-slate-500 mt-1">or click to browse</p>
              </div>
              <p className="text-xs text-slate-400">Supports PDF files up to 20MB</p>
            </>
          )}
        </div>
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center gap-1 animate-pulse">
           <span className="font-bold">!</span> {error}
        </p>
      )}
    </div>
  );
};

export default FileUpload;