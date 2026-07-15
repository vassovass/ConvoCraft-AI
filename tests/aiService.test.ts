import { describe, it, expect, vi, beforeEach } from 'vitest';
import { verifyApiKey, transcribeFile, processChatWithAI } from '../services/aiService';
import { type ApiProviderConfig } from '../types';

// Mock fetch
global.fetch = vi.fn();

const mockSettings = vi.hoisted(() => ({
    activeProvider: 'gemini',
    providers: {
        gemini: { name: 'gemini', apiKey: '', verificationStatus: 'verified' },
        elevenlabs: { name: 'elevenlabs', apiKey: '', verificationStatus: 'unverified' },
        openai: { name: 'openai', apiKey: '', verificationStatus: 'unverified' },
        claude: { name: 'claude', apiKey: '', verificationStatus: 'unverified' },
        groq: { name: 'groq', apiKey: '', verificationStatus: 'unverified' },
        custom: { name: 'custom', apiKey: '', baseUrl: '', verificationStatus: 'unverified' },
    },
    customTranscriptionPrompt: 'Transcribe this file.'
}));

// Mock generateSilentAudioFile and settings loaders
vi.mock('../utils', async (importOriginal) => {
    const original = await importOriginal<typeof import('../utils')>();
    return {
        ...original,
        generateSilentAudioFile: vi.fn().mockResolvedValue(new File([''], 'silent.wav')),
        getDefaultSettings: vi.fn(() => mockSettings),
        loadAppSettings: vi.fn(() => mockSettings),
    };
});

import { loadAppSettings } from '../utils';

describe('verifyApiKey', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('verifies gemini provider successfully even with no client key', async () => {
        const provider: ApiProviderConfig = { name: 'gemini', apiKey: '', verificationStatus: 'unverified' };
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

    it('verifies elevenlabs via the backend health endpoint', async () => {
        (fetch as any).mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ status: 'ok', providers: { gemini: true, elevenlabs: true } })
        });
        const provider: ApiProviderConfig = { name: 'elevenlabs', apiKey: '', verificationStatus: 'unverified' };
        const result = await verifyApiKey(provider);
        expect(result).toEqual({ success: true });
        expect(fetch).toHaveBeenCalledWith('http://localhost:3001/health');
    });

    it('reports elevenlabs as unavailable when the backend has no key', async () => {
        (fetch as any).mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ status: 'ok', providers: { gemini: true, elevenlabs: false } })
        });
        const provider: ApiProviderConfig = { name: 'elevenlabs', apiKey: '', verificationStatus: 'unverified' };
        const result = await verifyApiKey(provider);
        expect(result.success).toBe(false);
        expect(result.error).toContain('ELEVENLABS_API_KEY');
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

    it('transcribes with elevenlabs through the backend proxy', async () => {
        (loadAppSettings as any).mockReturnValueOnce({ ...mockSettings, activeProvider: 'elevenlabs' });
        (fetch as any).mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ text: 'scribe transcript' })
        });
        const file = new File([''], 'note.ogg', { type: 'audio/ogg' });
        const result = await transcribeFile(file);
        expect(result).toBe('scribe transcript');
        expect(fetch).toHaveBeenCalledWith('http://localhost:3001/api/elevenlabs/transcribe', expect.objectContaining({ method: 'POST' }));
    });

    it('rejects non-audio/video files for elevenlabs', async () => {
        (loadAppSettings as any).mockReturnValueOnce({ ...mockSettings, activeProvider: 'elevenlabs' });
        const file = new File([''], 'photo.png', { type: 'image/png' });
        await expect(transcribeFile(file)).rejects.toThrow(/audio and video only/);
        expect(fetch).not.toHaveBeenCalled();
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