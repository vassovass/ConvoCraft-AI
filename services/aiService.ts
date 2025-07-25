import { GoogleGenAI } from "@google/genai";
import { type AppSettings, type ProviderName, type ApiProviderConfig } from '../types';
import { getDefaultSettings } from '../utils';

const handleApiError = (error: unknown, providerName?: ProviderName): Error => {
    console.error(`Error calling ${providerName || 'AI'} API:`, error);
    if (error instanceof Error) {
        if (error.message.toLowerCase().includes("api key") || error.message.includes('401') || error.message.includes('403')) {
            return new Error(`API key for ${providerName} is invalid or missing. Please check it in Settings.`);
        }
        if (error.message.includes("400")) {
            return new Error("The file format may be unsupported or the file is corrupt. Please try a different file.");
        }
        return new Error(`API Error (${providerName}): ${error.message}`);
    }
    return new Error("An unknown error occurred during AI processing.");
};

const getSettings = (): AppSettings => {
    try {
        const settingsStr = localStorage.getItem('appSettings');
        if (settingsStr) {
            return JSON.parse(settingsStr);
        }
    } catch (e) {
        console.error("Failed to parse settings from localStorage", e);
    }
    return getDefaultSettings();
};

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result) {
        resolve((reader.result as string).split(',')[1]);
      } else {
        reject(new Error("Failed to read file."));
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
  
  return {
    inlineData: {
      data: await base64EncodedDataPromise,
      mimeType: file.type,
    },
  };
};

export const verifyApiKey = async (provider: ApiProviderConfig): Promise<{ success: boolean; error?: string }> => {
    const { name, apiKey, baseUrl } = provider;
    if (!apiKey) {
        return { success: false, error: 'API key is missing.' };
    }

    try {
        switch (name) {
            case 'gemini':
                const ai = new GoogleGenAI({ apiKey });
                // A very small, inexpensive call to test the key
                await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: 'test' });
                return { success: true };
            case 'openai':
                const openaiUrl = baseUrl || 'https://api.openai.com/v1/models';
                const openAiRes = await fetch(openaiUrl, { headers: { 'Authorization': `Bearer ${apiKey}` } });
                if (!openAiRes.ok) throw new Error(`Server responded with ${openAiRes.status}`);
                return { success: true };
            case 'claude':
                const claudeUrl = baseUrl || 'https://api.anthropic.com/v1/messages';
                // Claude requires a more complex body, but a bad request with a valid key will give a specific error
                const claudeRes = await fetch(claudeUrl, {
                    method: 'POST',
                    headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
                    body: JSON.stringify({ "model": "claude-3-haiku-20240307", "max_tokens": 1, "messages": [{"role": "user", "content": "test"}] })
                });
                if (!claudeRes.ok && claudeRes.status !== 400) throw new Error(`Authentication failed with status ${claudeRes.status}`);
                 if (claudeRes.status === 400) return { success: true }; // Bad request on valid key is a pass
                return { success: true };
            case 'groq':
                const groqUrl = baseUrl || 'https://api.groq.com/openai/v1/models';
                const groqRes = await fetch(groqUrl, { headers: { 'Authorization': `Bearer ${apiKey}` } });
                if (!groqRes.ok) throw new Error(`Server responded with ${groqRes.status}`);
                return { success: true };
            case 'custom':
                 if (!baseUrl) return { success: false, error: 'Base URL is required for custom provider.' };
                 const customRes = await fetch(baseUrl, { headers: { 'Authorization': `Bearer ${apiKey}` } });
                 if (!customRes.ok) throw new Error(`Server responded with ${customRes.status}`);
                 return { success: true };
            default:
                return { success: false, error: 'Unknown provider.' };
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred';
        console.error(`Verification failed for ${name}:`, message);
        return { success: false, error: message };
    }
};


export const transcribeFile = async (file: File): Promise<string> => {
    const settings = getSettings();
    const { activeProvider, providers, customTranscriptionPrompt } = settings;
    const providerConfig = providers[activeProvider];

    if (!providerConfig || !providerConfig.apiKey) {
        throw new Error(`API key for active provider (${activeProvider}) is not configured. Please go to Settings.`);
    }

    try {
        switch (activeProvider) {
            case 'gemini':
                const ai = new GoogleGenAI({ apiKey: providerConfig.apiKey });
                const model = 'gemini-2.5-flash';
                const prompt = customTranscriptionPrompt;
                const filePart = await fileToGenerativePart(file);

                const response = await ai.models.generateContent({
                    model: model,
                    contents: { parts: [{ text: prompt }, filePart] },
                });

                const text = response.text;
                if (text === null || text === undefined || text.trim() === '') {
                  throw new Error("Transcription resulted in an empty response from the AI provider.");
                }
                return text;
            
            // Placeholder for other providers
            case 'openai':
            case 'claude':
            case 'groq':
            case 'custom':
                throw new Error(`Transcription using ${activeProvider} is not yet implemented in this version.`);

            default:
                 throw new Error(`Unsupported provider: ${activeProvider}`);
        }
    } catch (error) {
        throw handleApiError(error, activeProvider);
    }
};

export const processChatWithAI = async (chatContent: string, userPrompt: string): Promise<string> => {
    const settings = getSettings();
    const { activeProvider, providers } = settings;
    const providerConfig = providers[activeProvider];
    
    if (!providerConfig || !providerConfig.apiKey) {
        throw new Error(`API key for active provider (${activeProvider}) is not configured. Please go to Settings.`);
    }

    try {
        switch (activeProvider) {
            case 'gemini':
                const ai = new GoogleGenAI({ apiKey: providerConfig.apiKey });
                const model = 'gemini-2.5-flash';

                const systemInstruction = "You are an expert chat analyst. Your task is to process the following chat log based on the user's request. Be concise, accurate, and directly address the user's prompt.";
                const fullPrompt = `${userPrompt}\n\nHere is the chat log:\n\n${chatContent}`;

                const response = await ai.models.generateContent({
                    model,
                    contents: fullPrompt,
                    config: {
                        systemInstruction,
                    }
                });
                
                const text = response.text;
                if (text === null || text === undefined || text.trim() === '') {
                  throw new Error("AI analysis resulted in an empty response.");
                }
                return text;

            // Placeholder for other providers
            case 'openai':
            case 'claude':
            case 'groq':
            case 'custom':
                throw new Error(`Chat analysis using ${activeProvider} is not yet implemented in this version.`);
            
            default:
                throw new Error(`Unsupported provider: ${activeProvider}`);
        }

    } catch (error) {
        throw handleApiError(error, activeProvider);
    }
};