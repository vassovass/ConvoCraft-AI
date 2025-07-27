
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FileUpload } from './components/FileUpload';
import { TranscriptionResult } from './components/TranscriptionResult';
import { transcribeFile } from './services/aiService';
import { type Transcription, type TranscriptionStatus } from './types';
import { Header } from './components/Header';
import { LogoIcon } from './components/Icons';
import { getBaseName } from './utils';
import { WhatsAppMerger } from './components/WhatsAppMerger';
import { CostWarningModal } from './components/CostWarningModal';
import { Settings } from './components/Settings';
import { saveTextToFile, generateSessionFilename } from './utils/fileSaver';

type ActiveView = 'transcriber' | 'whatsapp' | 'settings';

declare global {
  interface Window {
    showSaveFilePicker?: (options?: {
      suggestedName?: string;
      types?: {
        description: string;
        accept: Record<string, string[]>;
      }[];
    }) => Promise<FileSystemFileHandle>;
  }
}

const App: React.FC = () => {
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [copyButtonText, setCopyButtonText] = useState('Copy Selected');
  const [activeView, setActiveView] = useState<ActiveView>('transcriber');
  
  const [isWarningVisible, setIsWarningVisible] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<FileList | null>(null);
  const [warningMessage, setWarningMessage] = useState('');

  const isProcessing = useMemo(() => transcriptions.some(t => t.status === 'processing'), [transcriptions]);

  const updateTranscription = useCallback((id: string, status: TranscriptionStatus, data?: Partial<Omit<Transcription, 'id' | 'status'>>) => {
    setTranscriptions(prev =>
      prev.map(t => (t.id === id ? { ...t, status, ...data } : t))
    );
  }, []);

  // Effect to process the queue one by one
  useEffect(() => {
    // Don't process if a warning is visible or if a file is already being processed
    if (isWarningVisible || isProcessing) {
      return;
    }

    const pendingItem = transcriptions.find(t => t.status === 'pending');

    if (pendingItem?.originalFile) {
      const processItem = async (item: Transcription) => {
        // Mark as processing, this will prevent the effect from picking up a new file
        updateTranscription(item.id, 'processing');
        try {
          const text = await transcribeFile(item.originalFile!);
          updateTranscription(item.id, 'completed', { transcribedText: text });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
          updateTranscription(item.id, 'error', { errorMessage });
        }
      };

      processItem(pendingItem);
    }
    // This effect correctly re-runs when transcriptions state changes (e.g., on completion),
    // allowing it to find the next pending item.
  }, [transcriptions, isWarningVisible, isProcessing, updateTranscription]);
  
  const addFilesToQueue = (files: FileList) => {
    const newTranscriptions: Transcription[] = Array.from(files).map(file => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      fileName: file.name,
      baseFileName: getBaseName(file.name),
      originalFile: file,
      status: 'pending',
      transcribedText: '',
      errorMessage: '',
    }));
    setTranscriptions(prev => [...prev, ...newTranscriptions]);
  };

  const handleFilesSelected = (selectedFiles: FileList) => {
    const totalSize = Array.from(selectedFiles).reduce((acc, file) => acc + file.size, 0);
    const totalMb = totalSize / 1024 / 1024;
    const fileCount = selectedFiles.length;

    const messages: string[] = [];
    if (fileCount > 10) {
        messages.push(`You are uploading ${fileCount} files.`);
    }
    if (totalMb > 25) {
        messages.push(`The total upload size is ${totalMb.toFixed(2)} MB.`);
    }

    if (messages.length > 0) {
        messages.push("This may incur significant costs depending on your API plan. Do you want to proceed?");
        setWarningMessage(messages.join(' '));
        setPendingFiles(selectedFiles);
        setIsWarningVisible(true);
    } else {
        addFilesToQueue(selectedFiles);
    }
  };

  const confirmUpload = () => {
    if (pendingFiles) {
      addFilesToQueue(pendingFiles);
    }
    setIsWarningVisible(false);
    setPendingFiles(null);
  };

  const cancelUpload = () => {
    setIsWarningVisible(false);
    setPendingFiles(null);
  };
  
  const clearAll = () => {
      setTranscriptions([]);
      setSelectedIds([]);
  }

  const handleToggleSelection = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };
  
  const completedTranscriptions = useMemo(() => 
    transcriptions.filter(t => t.status === 'completed'), 
    [transcriptions]
  );
  
  const allCompletedSelected = useMemo(() => 
    completedTranscriptions.length > 0 && completedTranscriptions.every(t => selectedIds.includes(t.id)),
    [completedTranscriptions, selectedIds]
  );

  const handleSelectAll = () => {
    if (allCompletedSelected) {
      setSelectedIds(prev => prev.filter(id => !completedTranscriptions.some(t => t.id === id)));
    } else {
      setSelectedIds(prev => [...new Set([...prev, ...completedTranscriptions.map(t => t.id)])]);
    }
  };

  const handleCopySelected = () => {
    const selectedToCopy = transcriptions.filter(t =>
      selectedIds.includes(t.id) && t.status === 'completed' && t.transcribedText
    );

    if (selectedToCopy.length === 0) return;

    const textToCopy = selectedToCopy
      .map(t => `${t.baseFileName}: ${t.transcribedText}`)
      .join('\n\n---\n\n');

    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopyButtonText('Copied!');
      setTimeout(() => setCopyButtonText('Copy Selected'), 2000);
    });
  };

  const handleSaveAll = async () => {
    const completed = transcriptions.filter(t => t.status === 'completed' && t.transcribedText);
    if (completed.length === 0) return;

    for (const item of completed) {
        const textToSave = `File: ${item.fileName}\nTranscription: ${item.transcribedText}`;
        const suggestedName = `${item.baseFileName}.txt`;
        await saveTextToFile(textToSave, suggestedName);
    }
  };

  const NavButton: React.FC<{ view: ActiveView; label: string }> = ({ view, label }) => (
    <button
      onClick={() => setActiveView(view)}
      className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors duration-200 ${
        activeView === view
          ? 'bg-cyan-600 text-white'
          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
      }`}
    >
      {label}
    </button>
  );


  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans flex flex-col items-center p-4 sm:p-6 md:p-8">
      <CostWarningModal
          isOpen={isWarningVisible}
          onConfirm={confirmUpload}
          onCancel={cancelUpload}
          message={warningMessage}
      />
      <div className="w-full max-w-4xl">
          <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                  <LogoIcon className="h-10 w-10 text-cyan-400" />
                  <h1 className="text-3xl font-bold tracking-tight text-gray-100">ConvoCraft AI</h1>
              </div>
              <div className="flex items-center gap-2">
                  <button
                      onClick={handleSaveAll}
                      className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={completedTranscriptions.length === 0}
                      title="Save all completed transcriptions to separate files"
                  >
                      Save All
                  </button>
                  {transcriptions.length > 0 && (
                      <button
                          onClick={clearAll}
                          className="px-4 py-2 text-sm font-semibold text-gray-300 bg-gray-700 rounded-md hover:bg-red-600 hover:text-white transition-colors duration-200 disabled:opacity-50"
                          disabled={isProcessing}
                      >
                          Clear All
                      </button>
                  )}
              </div>
          </div>
      
          <Header />
          <main className="mt-8">
              <div className="flex space-x-2 border-b border-gray-700 mb-6">
                 <NavButton view="transcriber" label="Transcribe Files" />
                 <NavButton view="whatsapp" label="WhatsApp Chat Merger" />
                 <NavButton view="settings" label="Settings" />
              </div>

              {activeView === 'transcriber' && (
                <>
                  <FileUpload onFilesSelected={handleFilesSelected} disabled={isProcessing} />
                  
                  {transcriptions.length > 0 && (
                      <div className="mt-8">
                          <div className="flex items-center justify-between bg-gray-800/60 px-4 py-2 rounded-t-lg border-b border-gray-700">
                              <div className="flex items-center gap-3">
                                  <input
                                      type="checkbox"
                                      id="select-all"
                                      className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-cyan-500 focus:ring-cyan-600 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                                      checked={allCompletedSelected}
                                      onChange={handleSelectAll}
                                      disabled={completedTranscriptions.length === 0}
                                  />
                                  <label htmlFor="select-all" className={`text-sm ${completedTranscriptions.length === 0 ? 'text-gray-500' : 'text-gray-300 cursor-pointer'}`}>
                                      Select all completed ({completedTranscriptions.length})
                                  </label>
                              </div>
                              <div className="flex items-center gap-2">
                                  <button
                                      onClick={handleCopySelected}
                                      className="px-4 py-1.5 text-sm font-semibold text-white bg-cyan-600 rounded-md hover:bg-cyan-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                      disabled={selectedIds.length === 0}
                                  >
                                      {copyButtonText} ({selectedIds.length})
                                  </button>
                              </div>
                          </div>
                          <div className="space-y-2 pt-2">
                              {transcriptions.map(item => (
                                  <TranscriptionResult
                                      key={item.id}
                                      transcription={item}
                                      isSelected={selectedIds.includes(item.id)}
                                      onToggleSelection={handleToggleSelection}
                                  />
                              ))}
                          </div>
                      </div>
                  )}

                  {transcriptions.length === 0 && !isProcessing && (
                      <div className="text-center py-10 px-4 border-2 border-dashed border-gray-700 rounded-lg mt-8">
                          <p className="text-gray-400">Your transcribed files will appear here.</p>
                      </div>
                  )}
                </>
              )}
              {activeView === 'whatsapp' && (
                <WhatsAppMerger />
              )}
              {activeView === 'settings' && (
                <Settings />
              )}
          </main>
    </div>
    </div>
  );
};

export default App;
