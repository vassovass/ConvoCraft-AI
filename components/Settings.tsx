import React, { useState, useEffect, useCallback } from 'react';
import { type AppSettings, type ProviderName, type ApiProviderConfig } from '../types';
import { getDefaultSettings, DEFAULT_PROMPT } from '../utils';
import { verifyApiKey } from '../services/aiService';
import { EyeIcon, EyeSlashIcon, CheckCircleIcon, ErrorIcon } from './Icons';
import { Loader } from './Loader';

interface ProviderConfigSectionProps {
    providerName: ProviderName;
    config: ApiProviderConfig;
    isCustom: boolean;
    onUpdate: (name: ProviderName, field: keyof ApiProviderConfig, value: string) => void;
    onVerify: (name: ProviderName) => void;
}

const providerNotes: Record<ProviderName, string> = {
    gemini: 'Great all-around model for text and multimodal tasks.',
    openai: 'Recommended for high-accuracy audio transcription with Whisper.',
    claude: 'Strong model for nuanced text generation and analysis.',
    groq: 'High-speed inference for real-time applications.',
    custom: 'For use with any OpenAI-compatible API endpoint.'
};

const ProviderConfigSection: React.FC<ProviderConfigSectionProps> = ({ providerName, config, isCustom, onUpdate, onVerify }) => {
    const [showApiKey, setShowApiKey] = useState(false);
    const providerDisplayName = providerName.charAt(0).toUpperCase() + providerName.slice(1);

    const renderStatus = () => {
        switch (config.verificationStatus) {
            case 'verifying':
                return <div className="flex items-center gap-2 text-yellow-400"><Loader className="w-4 h-4"/> Verifying...</div>;
            case 'verified':
                return <div className="flex items-center gap-2 text-green-400"><CheckCircleIcon className="w-5 h-5"/> Verified</div>;
            case 'error':
                return <div className="flex items-center gap-2 text-red-400" title={config.error}><ErrorIcon className="w-5 h-5"/> Error</div>;
            case 'unverified':
            default:
                return <div className="text-gray-400">Unverified</div>;
        }
    }

    return (
        <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600 space-y-3">
            <h4 className="font-semibold text-lg text-gray-200">{providerDisplayName}</h4>
            <p className="text-xs text-gray-400 -mt-2">{providerNotes[providerName]}</p>
            
            {isCustom && (
                <div>
                    <label htmlFor={`${providerName}-baseUrl`} className="block text-sm font-medium text-gray-300 mb-1">Base URL</label>
                    <input
                        id={`${providerName}-baseUrl`}
                        type="text"
                        value={config.baseUrl || ''}
                        onChange={(e) => onUpdate(providerName, 'baseUrl', e.target.value)}
                        placeholder="e.g., https://api.example.com/v1"
                        className="w-full p-2 bg-gray-800 border border-gray-500 rounded-md focus:ring-2 focus:ring-cyan-500"
                    />
                </div>
            )}

            <div>
                <label htmlFor={`${providerName}-apiKey`} className="block text-sm font-medium text-gray-300 mb-1">API Key</label>
                <div className="relative">
                    <input
                        id={`${providerName}-apiKey`}
                        type={showApiKey ? 'text' : 'password'}
                        value={config.apiKey}
                        onChange={(e) => onUpdate(providerName, 'apiKey', e.target.value)}
                        placeholder={`Enter your ${providerDisplayName} API Key`}
                        className="w-full p-2 pr-10 bg-gray-800 border border-gray-500 rounded-md focus:ring-2 focus:ring-cyan-500"
                    />
                    <button onClick={() => setShowApiKey(!showApiKey)} className="absolute inset-y-0 right-0 px-3 text-gray-400 hover:text-white">
                        {showApiKey ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            <div className="flex items-center justify-between pt-2">
                <button
                    onClick={() => onVerify(providerName)}
                    disabled={config.verificationStatus === 'verifying' || !config.apiKey}
                    className="px-3 py-1.5 text-sm font-semibold text-white bg-cyan-700 rounded-md hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Verify Key
                </button>
                <div className="text-sm">{renderStatus()}</div>
            </div>
             {config.verificationStatus === 'error' && config.error && (
                <p className="text-xs text-red-300/80 bg-red-900/20 p-2 rounded-md">Error: {config.error}</p>
            )}
        </div>
    );
};

export const Settings: React.FC = () => {
    const [settings, setSettings] = useState<AppSettings>(getDefaultSettings());
    const [saveStatus, setSaveStatus] = useState('');

    useEffect(() => {
        try {
            const savedSettings = localStorage.getItem('appSettings');
            if (savedSettings) {
                // Merge saved settings with defaults to ensure all keys are present
                const loadedSettings = JSON.parse(savedSettings);
                const defaultSettings = getDefaultSettings();
                const mergedSettings = {
                    ...defaultSettings,
                    ...loadedSettings,
                    providers: {
                        ...defaultSettings.providers,
                        ...loadedSettings.providers,
                    }
                };
                setSettings(mergedSettings);
            }
        } catch(e) {
            console.error("Could not load settings, using defaults.", e);
            setSettings(getDefaultSettings());
        }
    }, []);

    const handleUpdate = useCallback((providerName: ProviderName, field: keyof ApiProviderConfig, value: string) => {
        setSettings(prev => ({
            ...prev,
            providers: {
                ...prev.providers,
                [providerName]: {
                    ...prev.providers[providerName],
                    [field]: value,
                    verificationStatus: 'unverified', // Reset verification status on change
                    error: ''
                },
            },
        }));
    }, []);

    const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setSettings(prev => ({ ...prev, customTranscriptionPrompt: e.target.value }));
    };

    const handleResetPrompt = () => {
        setSettings(prev => ({ ...prev, customTranscriptionPrompt: DEFAULT_PROMPT }));
    };

    const handleVerify = useCallback(async (providerName: ProviderName) => {
        setSettings(prev => ({
            ...prev,
            providers: { ...prev.providers, [providerName]: { ...prev.providers[providerName], verificationStatus: 'verifying', error: '' } }
        }));
        
        const result = await verifyApiKey(settings.providers[providerName]);
        
        setSettings(prev => ({
            ...prev,
            providers: {
                ...prev.providers,
                [providerName]: {
                    ...prev.providers[providerName],
                    verificationStatus: result.success ? 'verified' : 'error',
                    error: result.error || '',
                },
            },
        }));
    }, [settings.providers]);

    const handleSaveSettings = () => {
        try {
            localStorage.setItem('appSettings', JSON.stringify(settings));
            setSaveStatus('Settings saved successfully!');
            setTimeout(() => setSaveStatus(''), 3000);
        } catch (e) {
            setSaveStatus('Error saving settings.');
            console.error(e);
        }
    };

    const handleActiveProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSettings(prev => ({...prev, activeProvider: e.target.value as ProviderName}));
    }

    const providerOrder: ProviderName[] = ['gemini', 'openai', 'claude', 'groq', 'custom'];

    return (
        <div className="space-y-8 bg-gray-800/50 p-6 rounded-lg">
            
            <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-100">API Provider Configuration</h3>
                <p className="text-sm text-yellow-300/80 bg-yellow-900/20 p-3 rounded-lg border border-yellow-700/50">
                    <strong>Security Warning:</strong> Your API keys are stored in your browser's local storage. While convenient for this client-side application, be cautious and avoid using this app on public or untrusted computers.
                </p>
                
                <div>
                    <label htmlFor="active-provider" className="block text-sm font-medium text-gray-300 mb-2">Active AI Provider</label>
                    <div className="flex items-center gap-2">
                        <select
                            id="active-provider"
                            value={settings.activeProvider}
                            onChange={handleActiveProviderChange}
                            className="w-full p-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:ring-2 focus:ring-cyan-500"
                        >
                            {providerOrder.map(name => (
                               <option key={name} value={name}>{name.charAt(0).toUpperCase() + name.slice(1)}</option>
                            ))}
                        </select>
                        <button 
                            onClick={() => alert('For best results, use a model specialized for transcription, like OpenAI\'s Whisper. Gemini is a great general-purpose choice. Refer to the README for more details.')} 
                            className="text-gray-400 hover:text-white"
                            title="Learn more about choosing an AI provider"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Select which provider to use for transcription and analysis.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                    {providerOrder.map(name => (
                        <ProviderConfigSection
                            key={name}
                            providerName={name}
                            config={settings.providers[name]}
                            isCustom={name === 'custom'}
                            onUpdate={handleUpdate}
                            onVerify={handleVerify}
                        />
                    ))}
                </div>
            </div>

            <div className="pt-6 border-t border-gray-700">
                <h3 className="text-xl font-semibold text-gray-100 mb-2">Default Transcription Prompt</h3>
                <p className="text-gray-400 mb-4 text-sm">
                    Customize the default instructions given to the AI for file transcriptions. This is used by the active provider.
                </p>
                <textarea
                    value={settings.customTranscriptionPrompt}
                    onChange={handlePromptChange}
                    className="w-full h-48 p-3 bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition text-gray-200"
                    aria-label="Default Transcription Prompt"
                />
            </div>
            
            <div className="flex items-center gap-4 mt-4 pt-6 border-t border-gray-700">
                <button onClick={handleSaveSettings} className="px-6 py-2 text-base font-semibold text-white bg-cyan-600 rounded-md hover:bg-cyan-500 transition-colors">
                    Save All Settings
                </button>
                 <button onClick={handleResetPrompt} className="px-4 py-2 text-sm font-semibold text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors">
                    Reset Prompt
                </button>
                {saveStatus && <p className="text-sm text-green-400 animate-pulse">{saveStatus}</p>}
            </div>

        </div>
    );
};