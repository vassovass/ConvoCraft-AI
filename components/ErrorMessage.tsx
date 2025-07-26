import React, { useState, useRef, useEffect } from 'react';

interface ErrorMessageProps {
  error: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ error }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copyStatus, setCopyStatus] = useState('Copy');
  const detailsRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    if (isExpanded && detailsRef.current) {
      detailsRef.current.focus();
    }
  }, [isExpanded]);

  const handleCopy = async () => {
    if (!navigator.clipboard?.writeText) {
      setCopyStatus('Copy failed');
      setTimeout(() => setCopyStatus('Copy'), 2000);
      return;
    }

    try {
      await navigator.clipboard.writeText(error);
      setCopyStatus('Copied!');
    } catch (err) {
      setCopyStatus('Copy failed');
      console.error('Failed to copy error:', err);
    } finally {
      setTimeout(() => setCopyStatus('Copy'), 2000);
    }
  };

  return (
    <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4" role="alert">
      <div className="flex justify-between items-center">
        <p className="text-red-400 font-semibold">Error</p>
        <div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-gray-400 hover:underline"
            data-expanded={isExpanded}
            aria-controls="error-details"
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </button>
          <button onClick={handleCopy} className="ml-4 text-xs text-gray-400 hover:underline w-16 text-left">
            {copyStatus}
          </button>
        </div>
      </div>
      {isExpanded && (
        <pre
          id="error-details"
          ref={detailsRef}
          tabIndex={-1}
          className="mt-4 text-red-300 whitespace-pre-wrap text-sm font-mono bg-red-900/10 p-2 rounded focus:outline-none"
        >
          {error}
        </pre>
      )}
    </div>
  );
}; 