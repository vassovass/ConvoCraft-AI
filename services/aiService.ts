import { type ProviderName, type ApiProviderConfig } from '../types';
import { getDefaultSettings } from '../utils';
import { generateSilentAudioFile } from '../utils';

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

export const verifyApiKey = async (provider: ApiProviderConfig): Promise<{ success: boolean; error?: string }> => {
    const { name, apiKey, baseUrl } = provider;

    // For providers other than Gemini we still require a key on the client.
    if (name !== 'gemini' && !apiKey) {
        return { success: false, error: 'API key is missing.' };
    }

    try {
        switch (name) {
            case 'gemini':
                // Gemini requests are proxied through our backend; the key is never sent from the browser.
                // Therefore we treat Gemini as always "verified" on the client side.
                return { success: true };
            case 'openai':
                const whisperTest = async () => {
                    const silentAudio = await generateSilentAudioFile();
                    const formData = new FormData();
                    formData.append('file', silentAudio);
                    formData.append('model', 'whisper-1');
                    
                    const whisperUrl = baseUrl || 'https://api.openai.com/v1/audio/transcriptions';
                    const res = await fetch(whisperUrl, {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${apiKey}` },
                        body: formData,
                    });
                    if (!res.ok) throw new Error(`Whisper transcription test failed with status ${res.status}`);
                };
                await whisperTest();
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
    const settings = getDefaultSettings(); // Use getDefaultSettings directly
    const { activeProvider, providers, customTranscriptionPrompt } = settings;
    const providerConfig = providers[activeProvider];

    // Only require an API key on the client for providers that actually need one from the browser.
    if (activeProvider !== 'gemini' && (!providerConfig || !providerConfig.apiKey)) {
        throw new Error(`API key for active provider (${activeProvider}) is not configured. Please go to Settings.`);
    }

    try {
        switch (activeProvider) {
            case 'gemini':
                const formData = new FormData();
                formData.append('file', file);
                formData.append('prompt', customTranscriptionPrompt);

                const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/gemini/transcribe`, {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || `Proxy server returned status ${response.status}`);
                }
                
                const data = await response.json();
                const text = data.text;

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
        }
    } catch (error) {
        throw handleApiError(error, activeProvider);
    }
};

export const processChatWithAI = async (chatContent: string, userPrompt: string): Promise<string> => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    const response = await fetch(`${apiUrl}/api/gemini`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: `${userPrompt}\n\nHere is the chat log:\n\n${chatContent}` }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Proxy server returned status ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
                if (text === null || text === undefined || text.trim() === '') {
                  throw new Error("AI analysis resulted in an empty response.");
                }
                return text;
};