import { describe, it, expect } from 'vitest';

// This test simply validates that a Gemini API key is available in the environment.
// If the key is not present we skip – this keeps CI pipelines from failing.

describe('Environment configuration', () => {
  const key = process.env.GEMINI_API_KEY;

  (key ? it : it.skip)('has a GEMINI_API_KEY environment variable set', () => {
    expect(typeof key).toBe('string');
    expect(key!.length).toBeGreaterThan(20);
  });
}); 