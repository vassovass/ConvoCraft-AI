import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as utils from '../utils';

const downloadFileSpy = vi.spyOn(utils, 'downloadFile').mockImplementation(() => {});

// Mock URL.createObjectURL and URL.revokeObjectURL
global.URL.createObjectURL = vi.fn();
global.URL.revokeObjectURL = vi.fn();

describe('getBaseName', () => {
    it('should remove the extension from a filename', () => {
        expect(utils.getBaseName('test.txt')).toBe('test');
    });

    it('should handle filenames with multiple dots', () => {
        expect(utils.getBaseName('test.tar.gz')).toBe('test.tar');
    });

    it('should handle filenames with no extension', () => {
        expect(utils.getBaseName('test')).toBe('test');
    });
});

describe('parseWaDate', () => {
    it('should parse a standard WhatsApp timestamp', () => {
        const date = utils.parseWaDate('[26/07/2024, 19:59:23]');
        expect(date).toEqual(new Date('2024-07-26T19:59:23'));
    });

    it('should parse a WhatsApp timestamp with AM/PM', () => {
        const date = utils.parseWaDate('[7/26/24, 7:59:23 PM]');
        expect(date).toEqual(new Date('2024-07-26T19:59:23'));
    });

    it('should return null for an invalid timestamp', () => {
        expect(utils.parseWaDate('not a timestamp')).toBeNull();
    });
});

describe('Export Functions', () => {
    beforeEach(() => {
        downloadFileSpy.mockClear();
    });

    const chatContent = '[2024/07/26, 10:30:15] Vasso: Hello';
    const filename = 'test-chat';

    it('should call downloadFile with correct txt content', () => {
        utils.exportAsTxt(chatContent, filename);
        expect(downloadFileSpy).toHaveBeenCalledWith(expect.any(Blob), `${filename}.txt`);
    });

    it('should call downloadFile with correct html content', () => {
        utils.exportAsHtml(chatContent, filename);
        expect(downloadFileSpy).toHaveBeenCalledWith(expect.any(Blob), `${filename}.html`);
    });

    it('should call downloadFile with correct json content', () => {
        utils.exportAsJson(chatContent, filename);
        expect(downloadFileSpy).toHaveBeenCalledWith(expect.any(Blob), `${filename}.json`);
    });

    it('should call downloadFile with correct csv content', () => {
        utils.exportAsCsv(chatContent, filename);
        expect(downloadFileSpy).toHaveBeenCalledWith(expect.any(Blob), `${filename}.csv`);
    });
}); 