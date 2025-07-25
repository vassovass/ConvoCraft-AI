
import React, { useState } from 'react';
import { type Transcription } from '../types';
import { FileIcon, CheckIcon, ErrorIcon, CopyIcon, CheckCircleIcon } from './Icons';
import { Loader } from './Loader';

interface TranscriptionResultProps {
  transcription: Transcription;
  isSelected: boolean;
  onToggleSelection: (id: string) => void;
}

export const TranscriptionResult: React.FC<TranscriptionResultProps> = ({ transcription, isSelected, onToggleSelection }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent toggling selection when clicking the copy button
    if (transcription.transcribedText) {
      const textToCopy = `${transcription.baseFileName}: ${transcription.transcribedText}`;
      navigator.clipboard.writeText(textToCopy).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };
  
  const handleRowClick = () => {
    if (transcription.status === 'completed') {
      onToggleSelection(transcription.id);
    }
  };

  const renderStatusIcon = () => {
    switch (transcription.status) {
      case 'processing':
        return <Loader className="h-5 w-5 text-cyan-400" />;
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-400" />;
      case 'error':
        return <ErrorIcon className="h-5 w-5 text-red-400" />;
      case 'pending':
      default:
        // Render a placeholder to maintain alignment
        return <div className="h-5 w-5" />;
    }
  };

  const isSelectable = transcription.status === 'completed';

  return (
    <div 
        className={`p-4 rounded-lg shadow-md transition-all duration-200 ease-in-out border ${
            isSelected 
            ? 'bg-gray-700/80 border-cyan-500' 
            : 'bg-gray-800/50 border-transparent hover:bg-gray-700/60'
        } ${isSelectable ? 'cursor-pointer' : 'cursor-default'}`}
        onClick={handleRowClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center h-6">
            {isSelectable ? (
              <input
                  type="checkbox"
                  className="h-4 w-4 rounded bg-gray-600 border-gray-500 text-cyan-500 focus:ring-cyan-600 cursor-pointer"
                  checked={isSelected}
                  readOnly // The parent div click handler manages the state
              />
            ) : (
               <div className="w-4 h-4" /> // Placeholder for alignment
            )}
          </div>
          <FileIcon className="h-6 w-6 text-gray-400 flex-shrink-0" />
          <p className="font-medium text-gray-200 truncate" title={transcription.fileName}>
            {transcription.fileName}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {renderStatusIcon()}
          {transcription.status === 'completed' && transcription.transcribedText && (
            <button
              onClick={handleCopy}
              className="p-1 rounded-md text-gray-400 hover:bg-gray-600 hover:text-white transition-colors z-10"
              title="Copy to clipboard"
            >
              {copied ? <CheckIcon className="h-5 w-5 text-green-400" /> : <CopyIcon className="h-5 w-5" />}
            </button>
          )}
        </div>
      </div>

      {transcription.status === 'completed' && transcription.transcribedText && (
        <div className="mt-3 pl-14">
          <p className="text-gray-300 whitespace-pre-wrap selection:bg-cyan-500/30">
            <span className="font-semibold text-cyan-400">{transcription.baseFileName}:</span> {transcription.transcribedText}
          </p>
        </div>
      )}

      {transcription.status === 'error' && transcription.errorMessage && (
        <div className="mt-3 pl-14">
          <p className="text-red-400 text-sm">
            <span className="font-semibold">Error:</span> {transcription.errorMessage}
          </p>
        </div>
      )}
    </div>
  );
};
