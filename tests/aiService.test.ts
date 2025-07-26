import { describe, it, expect, vi, beforeEach } from 'vitest';
import { verifyApiKey, transcribeFile, processChatWithAI } from '../services/aiService';
import { type ApiProviderConfig } from '../types';

// Mock fetch
global.fetch = vi.fn();

// Mock generateSilentAudioFile
vi.mock('../utils', async (importOriginal) => {
    const original = await importOriginal<typeof import('../utils')>();
    return {
        ...original,
        generateSilentAudioFile: vi.fn().mockResolvedValue(new File([''], 'silent.wav')),
        getDefaultSettings: vi.fn().mockReturnValue({
            activeProvider: 'gemini',
            providers: {
                gemini: { name: 'gemini', apiKey: 'test-key', verificationStatus: 'verified' },
                openai: { name: 'openai', apiKey: '', verificationStatus: 'unverified' },
                claude: { name: 'claude', apiKey: '', verificationStatus: 'unverified' },
                groq: { name: 'groq', apiKey: '', verificationStatus: 'unverified' },
                custom: { name: 'custom', apiKey: '', baseUrl: '', verificationStatus: 'unverified' },
            },
            customTranscriptionPrompt: 'Transcribe this file.'
        })
    };
});

describe('verifyApiKey', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns error if API key is missing', async () => {
        const provider: ApiProviderConfig = { name: 'gemini', apiKey: '', verificationStatus: 'unverified' };
        const result = await verifyApiKey(provider);
        expect(result).toEqual({ success: false, error: 'API key is missing.' });
    });

    it('verifies gemini provider successfully', async () => {
        const provider: ApiProviderConfig = { name: 'gemini', apiKey: 'test-key', verificationStatus: 'unverified' };
        const result = await verifyApiKey(provider);
        expect(result).toEqual({ success: true });
    });

    it('verifies openai provider successfully', async () => {
        (fetch as any).mockResolvedValue({ ok: true });
        const provider: ApiProviderConfig = { name: 'openai', apiKey: 'test-key', verificationStatus: 'unverified' };
        const result = await verifyApiKey(provider);
        expect(result).toEqual({ success: true });
        expect(fetch).toHaveBeenCalledWith('https://api.openai.com/v1/audio/transcriptions', expect.any(Object));
    });

    it('handles openai verification failure', async () => {
        (fetch as any).mockResolvedValue({ ok: false, status: 401 });
        const provider: ApiProviderConfig = { name: 'openai', apiKey: 'test-key', verificationStatus: 'unverified' };
        const result = await verifyApiKey(provider);
        expect(result.success).toBe(false);
        expect(result.error).toContain('401');
    });
});

describe('transcribeFile', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('transcribes a file successfully', async () => {
        (fetch as any).mockResolvedValue({ 
            ok: true,
            json: () => Promise.resolve({ text: 'transcribed text' })
        });
        const file = new File([''], 'test.mp3', { type: 'audio/mpeg' });
        const result = await transcribeFile(file);
        expect(result).toBe('transcribed text');
    });

    it('handles transcription failure', async () => {
        (fetch as any).mockResolvedValue({ ok: false, status: 500 });
        const file = new File([''], 'test.mp3', { type: 'audio/mpeg' });
        await expect(transcribeFile(file)).rejects.toThrow();
    });
});

describe('processChatWithAI', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('processes chat with AI successfully', async () => {
        (fetch as any).mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ candidates: [{ content: { parts: [{ text: 'AI response' }] } }] })
        });
        const result = await processChatWithAI('chat content', 'prompt');
        expect(result).toBe('AI response');
    });

    it('handles AI processing failure', async () => {
        (fetch as any).mockResolvedValue({ ok: false, status: 500 });
        await expect(processChatWithAI('chat content', 'prompt')).rejects.toThrow();
    });
}); 