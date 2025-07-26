import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { WhatsAppMerger } from '../components/WhatsAppMerger';

// Mock the utils module to prevent actual file exports during tests
vi.mock('../utils', async (importOriginal) => {
    const original = await importOriginal<typeof import('../utils')>();
    return {
        ...original,
        exportAsTxt: vi.fn(),
        exportAsHtml: vi.fn(),
        exportAsJson: vi.fn(),
        exportAsCsv: vi.fn(),
    };
});

// Mock the services module to prevent actual API calls
vi.mock('../services/aiService', () => ({
    transcribeFile: vi.fn(),
    processChatWithAI: vi.fn(),
}));

describe('WhatsAppMerger', () => {
  it('renders the main sections', () => {
    render(<WhatsAppMerger />);
    
    const heading1 = screen.getByRole('heading', { level: 3, name: /Add WhatsApp Chat Log/i });
    const heading2 = screen.getByRole('heading', { level: 3, name: /Add Transcribed Audio Text/i });

    expect(heading1).toBeInTheDocument();
    expect(heading2).toBeInTheDocument();
    expect(screen.getByText('Merge Chat')).toBeInTheDocument();
  });

  it('merges chat log with transcriptions correctly', () => {
    render(<WhatsAppMerger />);

    const chatLogInput = screen.getByPlaceholderText('Paste your exported WhatsApp chat text here...');
    const transcriptionsInput = screen.getByPlaceholderText(/PTT-20240101-WA0001: Hello this is a test./);

    fireEvent.change(chatLogInput, { target: { value: '[2024/07/26, 10:30:15] Vasso: PTT-20240726-WA0001.opus (file attached)' } });
    fireEvent.change(transcriptionsInput, { target: { value: 'PTT-20240726-WA0001: This is the transcription.' } });

    const mergeButton = screen.getByText('Merge Chat');
    fireEvent.click(mergeButton);

    const expectedOutput = /\[2024\/07\/26, 10:30:15\] Vasso: PTT-20240726-WA0001: This is the transcription\. \(file transcribed\)/;
    const mergedChat = screen.getByText(expectedOutput);
    expect(mergedChat).toBeInTheDocument();
  });
}); 