import React from 'react';
import { OutputFormat, FORMAT_LABELS } from '../types';

interface FormatSelectorProps {
  selectedFormat: OutputFormat;
  onChange: (format: OutputFormat) => void;
  disabled?: boolean;
}

const FormatSelector: React.FC<FormatSelectorProps> = ({ selectedFormat, onChange, disabled }) => {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-slate-700 mb-2">
        Select Output Format
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {(Object.keys(FORMAT_LABELS) as OutputFormat[]).map((format) => (
          <button
            key={format}
            onClick={() => onChange(format)}
            disabled={disabled}
            className={`
              relative flex items-center justify-center px-4 py-3 border rounded-lg text-sm font-medium transition-all duration-200
              ${selectedFormat === format
                ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-600'
                : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:bg-slate-50'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            {FORMAT_LABELS[format]}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FormatSelector;