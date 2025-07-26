import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { ErrorMessage } from '../components/ErrorMessage';

describe('ErrorMessage', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('renders the error message and control buttons', () => {
        render(<ErrorMessage error="Test error" />);
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /expand/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /copy/i })).toBeInTheDocument();
    });

    it('expands and collapses the error details on click', () => {
        render(<ErrorMessage error="Detailed error message" />);
        const expandButton = screen.getByRole('button', { name: /expand/i });
        fireEvent.click(expandButton);
        expect(screen.getByText('Detailed error message')).toBeInTheDocument();
        const collapseButton = screen.getByRole('button', { name: /collapse/i });
        fireEvent.click(collapseButton);
        expect(screen.queryByText('Detailed error message')).not.toBeInTheDocument();
    });

    it('copies the error message to the clipboard', async () => {
        Object.defineProperty(navigator, 'clipboard', {
            value: {
                writeText: vi.fn().mockResolvedValue(undefined),
                readText: vi.fn().mockResolvedValue(''),
                read: vi.fn().mockResolvedValue([]),
                write: vi.fn().mockResolvedValue(undefined),
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
                dispatchEvent: vi.fn(),
            },
            writable: true,
        });
        render(<ErrorMessage error="Test error" />);
        const copyButton = screen.getByText('Copy');
        await act(async () => {
            fireEvent.click(copyButton);
        });
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Test error');
    });

    it('handles empty error messages gracefully', () => {
        render(<ErrorMessage error="" />);
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /expand/i })).toBeInTheDocument();
    });

    it('handles long error messages correctly', () => {
        const longError = 'a'.repeat(1000);
        render(<ErrorMessage error={longError} />);
        const expandButton = screen.getByRole('button', { name: /expand/i });
        fireEvent.click(expandButton);
        expect(screen.getByText(longError)).toBeInTheDocument();
    });

    it('provides feedback when clipboard API fails', async () => {
        Object.defineProperty(navigator, 'clipboard', {
            value: {
                writeText: vi.fn().mockRejectedValue(new Error('Clipboard failed')),
                readText: vi.fn().mockResolvedValue(''),
                read: vi.fn().mockResolvedValue([]),
                write: vi.fn().mockResolvedValue(undefined),
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
                dispatchEvent: vi.fn(),
            },
            writable: true,
        });
        render(<ErrorMessage error="Test error" />);
        const copyButton = screen.getByText('Copy');
        await act(async () => {
            fireEvent.click(copyButton);
        });
        expect(await screen.findByText('Copy failed')).toBeInTheDocument();
    });

    it.skip('expands and collapses with keyboard interactions', () => {
        render(<ErrorMessage error="Keyboard test" />);
        const expandButton = screen.getByRole('button', { name: /expand/i });
        act(() => {
            fireEvent.keyDown(expandButton, { key: 'Enter', code: 'Enter' });
        });
        expect(screen.getByText(/Keyboard test/)).toBeInTheDocument();
        const collapseButton = screen.getByRole('button', { name: /collapse/i });
        act(() => {
            fireEvent.keyDown(collapseButton, { key: ' ', code: 'Space' });
        });
        expect(screen.queryByText(/Keyboard test/)).not.toBeInTheDocument();
    });
}); 