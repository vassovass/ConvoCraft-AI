import { type AppSettings } from './types';

export const getBaseName = (fileName: string): string => {
  return fileName.split('.').slice(0, -1).join('.');
};

const downloadFile = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const exportAsTxt = (content: string, filename: string) => {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  downloadFile(blob, `${filename}.txt`);
};

export const exportAsHtml = (content: string, filename: string) => {
  const lines = content.split('\n');
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${filename}</title>
      <style>
        body { font-family: sans-serif; line-height: 1.6; padding: 20px; background-color: #f4f4f4; color: #333; }
        .message { margin-bottom: 10px; padding: 10px; border-radius: 8px; }
        .message strong { color: #0056b3; }
        .message.transcribed { background-color: #e6f7ff; border-left: 4px solid #1890ff; }
      </style>
    </head>
    <body>
      <h1>${filename}</h1>
      ${lines.map(line => {
          const isTranscribed = line.includes('(file transcribed)');
          return `<div class="message ${isTranscribed ? 'transcribed' : ''}">${line.replace(/\[(.*?)\]/g, '<strong>[$1]</strong>')}</div>`;
      }).join('')}
    </body>
    </html>
  `;
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  downloadFile(blob, `${filename}.html`);
};

const parseChatForJsonCsv = (chatContent: string): {timestamp: string, sender: string, message: string}[] => {
    const lines = chatContent.split('\n');
    const messages: {timestamp: string, sender: string, message: string}[] = [];
    const messageRegex = /\[(.*?)\] (.*?): (.*)/;

    for (const line of lines) {
        const match = line.match(messageRegex);
        if (match) {
            messages.push({
                timestamp: match[1],
                sender: match[2],
                message: match[3],
            });
        }
    }
    return messages;
};

export const exportAsJson = (content: string, filename: string) => {
  const messages = parseChatForJsonCsv(content);
  const jsonString = JSON.stringify(messages, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
  downloadFile(blob, `${filename}.json`);
};

export const exportAsCsv = (content: string, filename:string) => {
  const messages = parseChatForJsonCsv(content);
  if (messages.length === 0) return;

  const headers = 'timestamp,sender,message';
  const csvRows = messages.map(msg => {
    const timestamp = `"${msg.timestamp.replace(/"/g, '""')}"`;
    const sender = `"${msg.sender.replace(/"/g, '""')}"`;
    const message = `"${msg.message.replace(/"/g, '""')}"`;
    return [timestamp, sender, message].join(',');
  });

  const csvContent = [headers, ...csvRows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
  downloadFile(blob, `${filename}.csv`);
};


// Date filtering utilities
export const parseWaDate = (timestamp: string): Date | null => {
    // Attempt to parse formats like [25/07/2024, 19:59:23] or [7/25/24, 7:59:23 PM]
    try {
        // More robust regex to handle different date/time formats
        const match = timestamp.match(/\[(.*?)(?:, (.*?))?\]/);
        if (!match) return null;

        // Combine date and time parts for parsing
        const dateTimeString = `${match[1]} ${match[2] || ''}`.trim();

        // This is a bit of a gamble, as Date.parse is implementation-dependent
        // It works for many common formats like MM/DD/YYYY and DD/MM/YYYY
        // but can be ambiguous. For a production app, a library like date-fns would be better.
        let date = new Date(dateTimeString);
        
        // Check if the date is invalid. This can happen for DD/MM/YYYY on US systems.
        if (isNaN(date.getTime())) {
            // Try swapping day and month
            const parts = dateTimeString.split(/[\s,/]+/); // split by space, comma, or slash
             if (parts.length >= 3) {
                // Assuming format DD/MM/YYYY ...
                const swappedDateStr = [parts[1], parts[0], parts[2], ...parts.slice(3)].join(' ');
                date = new Date(swappedDateStr);
            }
        }
        
        return isNaN(date.getTime()) ? null : date;
    } catch (e) {
        return null;
    }
};

export const filterChatByDate = (chatLog: string, filter: string): string => {
    if (filter === 'all') return chatLog;

    const now = new Date();
    let startDate: Date;

    switch (filter) {
        case '24h':
            startDate = new Date(now.getTime() - (24 * 60 * 60 * 1000));
            break;
        case '7d':
            startDate = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
            break;
        case '30d':
            startDate = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
            break;
        default:
            return chatLog;
    }

    const lines = chatLog.split('\n');
    const filteredLines = lines.filter(line => {
        const timestampMatch = line.match(/^(\[.*?\])/);
        if (!timestampMatch) return true; // Keep lines without timestamps (e.g., multiline messages)

        const date = parseWaDate(timestampMatch[1]);
        return date ? date >= startDate : true; // Keep lines where date can't be parsed
    });

    return filteredLines.join('\n');
};


// Default settings and prompts for the application
export const DEFAULT_PROMPT = "Your task is to transcribe the content of the provided file with the highest accuracy. For audio or video files, provide a verbatim transcription of all spoken words. You should not change any wording, but you are expected to add appropriate punctuation and capitalization to ensure the text is readable and grammatically correct. For images, provide a detailed description and meticulously transcribe any text visible within the image. For documents (such as plain text, CSV, or code), you must return the exact text content without any modifications or commentary.";

export const getDefaultSettings = (): AppSettings => ({
  activeProvider: 'gemini',
  customTranscriptionPrompt: DEFAULT_PROMPT,
  providers: {
    gemini: { name: 'gemini', apiKey: '', verificationStatus: 'unverified', error: '' },
    openai: { name: 'openai', apiKey: '', baseUrl: '', verificationStatus: 'unverified', error: '' },
    claude: { name: 'claude', apiKey: '', baseUrl: '', verificationStatus: 'unverified', error: '' },
    groq: { name: 'groq', apiKey: '', baseUrl: '', verificationStatus: 'unverified', error: '' },
    custom: { name: 'custom', apiKey: '', baseUrl: '', verificationStatus: 'unverified', error: '' },
  },
});

function loadSettings(): AppSettings {
    const saved = localStorage.getItem('convocraft-settings');
    if (saved) {
        try {
            // Merge saved settings with defaults to ensure all keys are present
            const savedSettings = JSON.parse(saved);
            return { ...getDefaultSettings(), ...savedSettings };
        } catch (e) {
            console.error("Failed to parse settings from localStorage, using defaults.", e);
        }
    }
    return getDefaultSettings();
}