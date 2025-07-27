export type TranscriptionStatus = 'pending' | 'processing' | 'completed' | 'error';

export interface Transcription {
  id: string;
  fileName: string;
  baseFileName: string;
  originalFile?: File;
  status: TranscriptionStatus;
  transcribedText?: string;
  errorMessage?: string;
}

// Types for the new multi-provider settings

export type ProviderName = 'gemini' | 'openai' | 'claude' | 'groq' | 'custom';

export type VerificationStatus = 'unverified' | 'verifying' | 'verified' | 'error';

export interface ApiProviderConfig {
    name: string;
    apiKey: string;
    baseUrl?: string;
    verificationStatus: VerificationStatus;
    error?: string;
}

export interface AppSettings {
    activeProvider: ProviderName;
    providers: Record<ProviderName, ApiProviderConfig>;
    customTranscriptionPrompt: string;
    defaultDownloadFolder?: string;
}
