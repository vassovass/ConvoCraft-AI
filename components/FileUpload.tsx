import React, { useState, useCallback, useRef } from 'react';
import { UploadIcon } from './Icons';

interface FileUploadProps {
  onFilesSelected: (files: FileList) => void;
  disabled: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFilesSelected, disabled }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0 && !disabled) {
      onFilesSelected(e.dataTransfer.files);
      e.dataTransfer.clearData();
    }
  }, [onFilesSelected, disabled]);
  
  const handleClick = () => {
      fileInputRef.current?.click();
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if(e.target.files && e.target.files.length > 0 && !disabled) {
          onFilesSelected(e.target.files);
      }
  }

  const baseClasses = "flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl transition-colors duration-200";
  const stateClasses = disabled 
    ? "border-gray-600 bg-gray-800 cursor-not-allowed"
    : isDragging
    ? "border-cyan-400 bg-gray-700"
    : "border-gray-500 bg-gray-800 hover:border-cyan-500 hover:bg-gray-700 cursor-pointer";

  return (
    <div
      className={`${baseClasses} ${stateClasses}`}
      onDragEnter={handleDragIn}
      onDragLeave={handleDragOut}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={handleClick}
    >
        <input 
            ref={fileInputRef}
            type="file" 
            multiple 
            className="hidden"
            onChange={handleFileChange}
            disabled={disabled}
            accept="audio/*,video/*,image/*,text/*,.pdf,.doc,.docx,.csv"
        />
        <UploadIcon className={`h-12 w-12 mb-4 ${disabled ? 'text-gray-500' : 'text-gray-400'}`} />
        <p className="text-lg font-semibold text-gray-200">
            Drag & drop files here
        </p>
        <p className="text-gray-400">or click to browse (Audio, Video, Images, Docs)</p>
        {disabled && <p className="mt-2 text-sm text-yellow-400">Processing files, please wait...</p>}
    </div>
  );
};
