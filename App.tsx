import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import FormatSelector from './components/FormatSelector';
import { RefreshIcon, DownloadIcon, AlertIcon, CheckIcon } from './components/Icons';
import { OutputFormat, FileData, ConversionState } from './types';
import { extractTextFromPdf } from './services/localPdf';
import { downloadContent } from './utils/fileUtils';

const App: React.FC = () => {
  const [fileData, setFileData] = useState<FileData | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<OutputFormat>(OutputFormat.TXT);
  const [state, setState] = useState<ConversionState>({
    isUploading: false,
    isProcessing: false,
    progress: 0,
    error: null,
    result: null,
  });

  const handleFileSelect = (data: FileData) => {
    setFileData(data);
    setState(prev => ({ ...prev, result: null, error: null })); // Reset result on new file
  };

  const handleConvert = async () => {
    if (!fileData) return;

    setState(prev => ({
      ...prev,
      isProcessing: true,
      error: null,
      result: null,
      progress: 10
    }));

    try {
      // Start fake progress
      const progressInterval = setInterval(() => {
        setState(prev => ({
            ...prev,
            progress: prev.progress < 90 ? prev.progress + (Math.random() * 15) : prev.progress
        }));
      }, 300);

      // Perform local extraction
      const textResult = await extractTextFromPdf(fileData.base64);
      
      clearInterval(progressInterval);
      
      setState({
        isUploading: false,
        isProcessing: false,
        progress: 100,
        error: null,
        result: textResult
      });

    } catch (error) {
      setState({
        isUploading: false,
        isProcessing: false,
        progress: 0,
        error: error instanceof Error ? error.message : "Conversion failed",
        result: null
      });
    }
  };

  const handleDownload = () => {
    if (state.result && fileData) {
      downloadContent(state.result, selectedFormat, fileData.file.name);
    }
  };

  const handleReset = () => {
    setFileData(null);
    setState({
      isUploading: false,
      isProcessing: false,
      progress: 0,
      error: null,
      result: null,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl">
            PDF to Text <span className="text-indigo-600">Extractor</span>
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Extract text from your PDF files instantly. 
            Runs 100% in your browser - no data leaves your device.
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
          <div className="p-6 sm:p-8 space-y-8">
            
            {/* Step 1: Upload */}
            <div className={`transition-all duration-300 ${state.result ? 'opacity-50 pointer-events-none' : ''}`}>
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                <span className="bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded mr-2">1</span>
                Upload PDF Document
              </h2>
              <FileUpload 
                onFileSelect={handleFileSelect} 
                selectedFileName={fileData?.file.name || null} 
              />
            </div>

            {/* Step 2: Format Selection */}
            <div className={`transition-all duration-300 ${!fileData || state.result ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                <span className="bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded mr-2">2</span>
                Choose Output Format
              </h2>
              <FormatSelector 
                selectedFormat={selectedFormat} 
                onChange={setSelectedFormat} 
                disabled={!fileData || state.isProcessing || !!state.result}
              />
            </div>

            {/* Step 3: Action Area */}
            {state.error && (
               <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                 <AlertIcon className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                 <div>
                   <h3 className="text-sm font-semibold text-red-800">Extraction Failed</h3>
                   <p className="text-sm text-red-700 mt-1">{state.error}</p>
                 </div>
               </div>
            )}

            {!state.result ? (
              <div className="pt-4">
                <button
                  onClick={handleConvert}
                  disabled={!fileData || state.isProcessing}
                  className={`
                    w-full py-4 px-6 rounded-xl text-white font-bold text-lg shadow-lg transition-all duration-200 flex items-center justify-center gap-2
                    ${!fileData || state.isProcessing
                      ? 'bg-slate-300 cursor-not-allowed shadow-none'
                      : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-200 hover:-translate-y-0.5'
                    }
                  `}
                >
                  {state.isProcessing ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Extracting Text... {Math.floor(state.progress)}%
                    </>
                  ) : (
                    <>
                      Extract Text Now
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                    <CheckIcon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-green-800 mb-2">Extraction Complete!</h3>
                  <p className="text-green-700 mb-6">
                    Text extracted successfully. Ready to download as <strong>{selectedFormat}</strong>.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={handleDownload}
                      className="flex-1 py-3 px-6 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                    >
                      <DownloadIcon className="w-5 h-5" />
                      Download {selectedFormat}
                    </button>
                    <button
                      onClick={handleReset}
                      className="flex-1 py-3 px-6 bg-white border border-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors hover:border-slate-300 flex items-center justify-center gap-2"
                    >
                      <RefreshIcon className="w-4 h-4" />
                      Convert Another
                    </button>
                  </div>
                </div>

                {/* Preview Section */}
                <div className="mt-8">
                    <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Preview (First 500 chars)</h4>
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 font-mono text-xs text-slate-600 overflow-x-auto whitespace-pre-wrap max-h-48 shadow-inner text-left">
                        {state.result.slice(0, 500)}...
                    </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Footer info */}
        <div className="mt-8 text-center text-slate-500 text-sm">
          <p>Browser-based extraction. Your files are processed locally and never uploaded to a server.</p>
        </div>
      </div>
    </div>
  );
};

export default App;