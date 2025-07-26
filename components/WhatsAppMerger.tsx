

import React, { useState, useRef, useEffect } from 'react';
import { UploadIcon, SparklesIcon } from './Icons';
import { exportAsTxt, exportAsHtml, exportAsJson, exportAsCsv } from '../utils';
import { transcribeFile, processChatWithAI } from '../services/aiService';
import { Loader } from './Loader';
import DOMPurify from 'dompurify';
import { ErrorMessage } from './ErrorMessage';

interface WhatsAppMergerProps {}

const AiPromptButton: React.FC<{onClick: () => void, children: React.ReactNode}> = ({ onClick, children }) => (
    <button onClick={onClick} className="px-3 py-1.5 text-sm font-semibold text-cyan-200 bg-cyan-800/50 rounded-md hover:bg-cyan-700/70 transition-colors">
        {children}
    </button>
);

const Section: React.FC<{title: string, step: number, children: React.ReactNode}> = ({ title, step, children }) => (
    <div className="flex flex-col space-y-3 bg-gray-800/50 p-4 rounded-lg border border-gray-700 h-full">
        <h3 className="text-lg font-semibold text-gray-100">
            <span className="text-cyan-400 font-bold">{step}.</span> {title}
        </h3>
        {children}
    </div>
);


export const WhatsAppMerger: React.FC<WhatsAppMergerProps> = () => {
  const [chatLog, setChatLog] = useState<string>('');
  const [transcriptionsText, setTranscriptionsText] = useState<string>('');
  const [mergedChat, setMergedChat] = useState<string>('');
  const [mergedCount, setMergedCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State for AI processing
  const AI_STORAGE_KEY = 'convocraft-ai-analysis';
  const CHAT_STORAGE_KEY = 'convocraft-chat-data';
  const [aiEnabled, setAiEnabled] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [aiResult, setAiResult] = useState('');

  // load persisted state
  useEffect(() => {
    // Load AI analysis state
    const aiRaw = localStorage.getItem(AI_STORAGE_KEY);
    if (aiRaw) {
        try {
            const { enabled, prompt, result } = JSON.parse(aiRaw);
            setAiEnabled(enabled ?? false);
            setCustomPrompt(prompt ?? '');
            setAiResult(result ?? '');
        } catch (e) {
            console.error(e);
        }
    }
    
    // Load chat data state
    const chatRaw = localStorage.getItem(CHAT_STORAGE_KEY);
    if (chatRaw) {
        try {
            const { chat, transcriptions, merged } = JSON.parse(chatRaw);
            setChatLog(chat ?? '');
            setTranscriptionsText(transcriptions ?? '');
            setMergedChat(merged ?? '');
        } catch (e) {
            console.error(e);
        }
    }
  }, []);

  // persist on change
  useEffect(() => {
    const aiHandler = setTimeout(() => {
        const data = JSON.stringify({ enabled: aiEnabled, prompt: customPrompt, result: aiResult });
        localStorage.setItem(AI_STORAGE_KEY, data);
    }, 500); // 500ms debounce delay
    
    const chatHandler = setTimeout(() => {
        const data = JSON.stringify({ chat: chatLog, transcriptions: transcriptionsText, merged: mergedChat });
        localStorage.setItem(CHAT_STORAGE_KEY, data);
    }, 500);

    return () => {
        clearTimeout(aiHandler);
        clearTimeout(chatHandler);
    };
}, [aiEnabled, customPrompt, aiResult, chatLog, transcriptionsText, mergedChat]);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [aiError, setAiError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && typeof event.target.result === 'string') {
          setChatLog(event.target.result);
        }
      };
      reader.readAsText(file);
    }
  };
  
  const handleMerge = () => {
    const transcriptionMap = new Map<string, string>();
    const transcriptionLines = transcriptionsText.split('\n');
    for (const line of transcriptionLines) {
        if (line.trim() === '' || line.trim() === '---') continue;

        const separatorIndex = line.indexOf(':');
        if (separatorIndex > 0) {
            const fileName = line.substring(0, separatorIndex).trim();
            const text = line.substring(separatorIndex + 1).trim();
            if (fileName && text) {
                // Remove potential extension for better matching
                const baseFileName = fileName.split('.').slice(0, -1).join('.') || fileName;
                transcriptionMap.set(baseFileName, text);
            }
        }
    }

    if (!chatLog) {
      setMergedChat('');
      setMergedCount(0);
      return;
    }
    
    // This regex now supports both bracketed and non-bracketed WhatsApp timestamp formats.
    const placeholderRegex = /(^\[?[^\]\n]+\]? .*?:) (PTT-\d{8}-WA\d{4}|AUD-\d{8}-WA\d{4}|WhatsApp Audio .*?)\..*? \(file attached\)/;

    let count = 0;
    const lines = chatLog.split('\n');
    const newLines: string[] = [];
    let i = 0;

    while (i < lines.length) {
        const line = lines[i];
        const match = line.match(placeholderRegex);
        
        if (match) {
            const lineStart = match[1]; 
            const baseFileName = match[2];
            
            if (transcriptionMap.has(baseFileName)) {
                count++;
                const transcribedText = transcriptionMap.get(baseFileName);
                newLines.push(`${lineStart.trim()} ${baseFileName}: ${transcribedText} (file transcribed)`);
                
                // Check if the next line is just the filename and skip it if so
                if (i + 1 < lines.length && lines[i + 1].trim().startsWith(baseFileName)) {
                    i++; // This increments i, so the next loop iteration will skip the filename line
                }
            } else {
                // No transcription found, keep original line
                newLines.push(line);
            }
        } else {
            // No match, just a regular chat line
            newLines.push(line);
        }
        i++;
    }

    setMergedChat(newLines.join('\n'));
    setMergedCount(count);
  };


  const handleAiProcess = async (prompt: string) => {
    if (!mergedChat || !prompt) return;
    setIsAiProcessing(true);
    setAiError('');
    setAiResult('');

    const attempts = 2;
    for (let i = 0; i < attempts; i++) {
      try {
        const result = await processChatWithAI(mergedChat, prompt)
        setAiResult(result);
        break; // success
      } catch (err) {
        if (i === attempts - 1) {
          console.error('AI processing failed:', err);
          setAiError(err instanceof Error ? err.message : 'An unknown error occurred. See console for details.');
        } else {
          // small back-off before retry
          await new Promise(r => setTimeout(r, 1000));
        }
      }
    }
    setIsAiProcessing(false);
  };

  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const baseFilename = `whatsapp-chat-${ts}`;

  return (
    <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Section step={1} title="Add WhatsApp Chat Log">
                <p className="text-sm text-gray-400">
                    Paste your chat content or upload the <code>.txt</code> file. 
                    <a href="https://faq.whatsapp.com/1180414079177245" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline ml-1">Learn how</a>.
                </p>
                <textarea
                  value={chatLog}
                  onChange={(e) => setChatLog(e.target.value)}
                  placeholder="Paste your exported WhatsApp chat text here..."
                  className="w-full flex-grow p-3 bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition min-h-[200px]"
                />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-700 text-white font-semibold rounded-md hover:bg-gray-600 transition-colors h-fit w-full"
                >
                    <UploadIcon className="w-5 h-5" />
                    Upload Chat File (.txt)
                </button>
                <label htmlFor="file-upload" className="sr-only">Upload Chat File</label>
                <input
                    id="file-upload"
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".txt"
                    onChange={handleFileChange}
                />
            </Section>

            <Section step={2} title="Add Transcribed Audio Text">
                 <p className="text-sm text-gray-400">
                    Paste your transcribed text below. Each item should be on a new line in the format:
                </p>
                 <code className="text-xs text-cyan-300 bg-gray-900 p-2 rounded-md">
                   filename.opus: The transcribed text...
                 </code>
                <textarea
                  value={transcriptionsText}
                  onChange={(e) => setTranscriptionsText(e.target.value)}
                  placeholder="PTT-20240101-WA0001: Hello this is a test.
PTT-20240101-WA0002: This is another test..."
                  className="w-full flex-grow p-3 bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition min-h-[200px]"
                />
            </Section>
        </div>

        <div className="text-center py-4">
            <button
                onClick={handleMerge}
                disabled={!chatLog || !transcriptionsText}
                className="px-8 py-3 text-lg font-semibold text-white bg-cyan-600 rounded-md hover:bg-cyan-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-cyan-500/30"
            >
                Merge Chat
            </button>
        </div>
      
      {mergedChat && (
        <div className="space-y-6 pt-6 border-t-2 border-gray-700">
            <Section step={3} title="Review and Export Merged Chat">
                {mergedCount > 0 ? (
                    <p className="text-sm text-green-400/90">
                        Successfully found and merged {mergedCount} {mergedCount === 1 ? 'transcription' : 'transcriptions'} into your chat log.
                    </p>
                ) : (
                    <p className="text-sm text-yellow-400/90">
                        No matching transcriptions were found in the chat log. Please check your filenames.
                    </p>
                )}
                 <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 h-96 overflow-y-auto">
                    <pre className="text-gray-300 whitespace-pre-wrap text-sm font-sans">{mergedChat}</pre>
                </div>
                 <div className="mt-4 flex flex-wrap gap-3">
                    <button onClick={() => exportAsTxt(mergedChat, baseFilename)} disabled={!mergedChat} className="px-4 py-2 text-sm font-semibold text-white bg-gray-600 rounded-md hover:bg-gray-500 disabled:opacity-50">Export as TXT</button>
                    <button onClick={() => exportAsHtml(mergedChat, baseFilename)} disabled={!mergedChat} className="px-4 py-2 text-sm font-semibold text-white bg-gray-600 rounded-md hover:bg-gray-500 disabled:opacity-50">Export as HTML</button>
                    <button onClick={() => exportAsJson(mergedChat, baseFilename)} disabled={!mergedChat} className="px-4 py-2 text-sm font-semibold text-white bg-gray-600 rounded-md hover:bg-gray-500 disabled:opacity-50">Export as JSON</button>
                    <button onClick={() => exportAsCsv(mergedChat, baseFilename)} disabled={!mergedChat} className="px-4 py-2 text-sm font-semibold text-white bg-gray-600 rounded-md hover:bg-gray-500 disabled:opacity-50">Export as CSV</button>
                </div>
            </Section>

            <Section step={4} title="Advanced AI Processing">
                <div className="flex items-center gap-3">
                    <input 
                        id="ai-enabled"
                        type="checkbox"
                        checked={aiEnabled}
                        onChange={(e) => setAiEnabled(e.target.checked)}
                        className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-cyan-500 focus:ring-cyan-600"
                    />
                    <label htmlFor="ai-enabled" className="text-gray-300">Enable AI Chat Analysis</label>
                </div>
                
                {aiEnabled && (
                    <div className="space-y-4 pl-4 border-l-2 border-cyan-800/50 mt-4">
                        <p className="text-sm text-yellow-300/80">
                            <strong>Note:</strong> Using this feature will send your merged chat to your configured AI provider's API and may incur costs.
                        </p>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Prompt Suggestions</label>
                            <div className="flex flex-wrap gap-2">
                               <AiPromptButton onClick={() => handleAiProcess("Provide a concise summary of this conversation.")}>Summarize</AiPromptButton>
                               <AiPromptButton onClick={() => handleAiProcess("Extract all key points and action items from this chat into a bulleted list.")}>Key Points & Actions</AiPromptButton>
                               <AiPromptButton onClick={() => handleAiProcess("Analyze the sentiment of this conversation.")}>Analyze Sentiment</AiPromptButton>
                               <AiPromptButton onClick={() => handleAiProcess("Create a JSON object containing a timeline of events discussed in the chat.")}>Create JSON Timeline</AiPromptButton>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="custom-prompt" className="block text-sm font-medium text-gray-300 mb-2">Or, write your own custom prompt:</label>
                            <textarea
                                id="custom-prompt"
                                value={customPrompt}
                                onChange={(e) => setCustomPrompt(e.target.value)}
                                placeholder="e.g., 'Translate this conversation to Spanish.'"
                                className="w-full h-24 p-3 bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                            />
                             <button 
                                onClick={() => handleAiProcess(customPrompt)}
                                disabled={!customPrompt || isAiProcessing}
                                className="mt-2 px-4 py-2 text-sm font-semibold text-white bg-cyan-600 rounded-md hover:bg-cyan-500 disabled:opacity-50 flex items-center gap-2"
                             >
                                {isAiProcessing && <Loader className="w-4 h-4" />}
                                Generate with Custom Prompt
                            </button>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-300">Result:</label>
                            <div className="bg-gray-900/70 border border-gray-700 rounded-lg p-4 min-h-48 overflow-y-auto">
                               {isAiProcessing ? (
                                 <div className="flex items-center gap-3 text-gray-400">
                                    <Loader className="w-5 h-5" />
                                    <span>Thinking...</span>
                                 </div>
                               ) : aiError ? (
                                <ErrorMessage error={aiError} />
                               ) : aiResult ? (
                                <p className="text-gray-300 whitespace-pre-wrap text-sm font-sans" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(aiResult) }} />
                               ) : (
                                 <p className="text-gray-500">The AI-generated result will appear here.</p>
                               )}
                            </div>
                            <div className="flex gap-3 mt-2">
                              <button onClick={() => {setAiEnabled(false); setCustomPrompt(''); setAiResult(''); setAiError(''); localStorage.removeItem(AI_STORAGE_KEY);}} className="px-3 py-1 text-xs font-semibold bg-red-600 text-white rounded-md hover:bg-red-500">Clear All</button>
                              <button onClick={() => {const combined = `${mergedChat}\n\n--- AI Result ---\n${aiResult}`; const name=`chat-with-ai-${new Date().toISOString().replace(/[:.]/g,'-')}`; exportAsTxt(combined,name);}} disabled={!aiResult} className="px-3 py-1 text-xs font-semibold bg-cyan-600 text-white rounded-md hover:bg-cyan-500 disabled:opacity-50">Save All</button>
                            </div>
                        </div>
                    </div>
                )}
            </Section>
        </div>
      )}
       {!mergedChat && (
        <div className="text-center py-10 px-4 border-2 border-dashed border-gray-700 rounded-lg mt-8">
            <p className="text-gray-400">Your merged chat will appear here after you click "Merge Chat".</p>
        </div>
      )}
    </div>
  );
};
