
import React from 'react';

interface CostWarningModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  message: string;
}

export const CostWarningModal: React.FC<CostWarningModalProps> = ({ isOpen, onConfirm, onCancel, message }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      aria-labelledby="cost-warning-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md border border-yellow-500/50">
        <h2 id="cost-warning-title" className="text-xl font-bold text-yellow-300 mb-4">Usage Warning</h2>
        <p className="text-gray-300 mb-6">
            {message}
        </p>
        <div className="text-xs text-gray-400 mb-6">
            <p>
                You are responsible for all costs incurred with your API key. Please monitor your usage in your AI provider's dashboard.
            </p>
        </div>
        <div className="flex justify-end gap-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-semibold text-gray-200 bg-gray-600 rounded-md hover:bg-gray-500 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-semibold text-white bg-yellow-600 rounded-md hover:bg-yellow-500 transition-colors"
          >
            I Understand, Proceed
          </button>
        </div>
      </div>
    </div>
  );
};
