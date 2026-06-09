import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

// Non-interactive verification of GEMINI_API_KEY for use in automation/launchers.
(async () => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error('[Error] GEMINI_API_KEY is missing. Please set it in your environment (e.g., .env file).');
    process.exit(1);
  }

  // Validate the typical format of a Gemini API key: starts with AIzaSy and 33 more chars
  const keyFormat = /^AIzaSy[A-Za-z0-9_\-]{33}$/;
  if (!keyFormat.test(apiKey)) {
    console.error('[Error] GEMINI_API_KEY appears to have an invalid format. It should be 39 characters long and start with "AIzaSy".');
    console.error('[Info] Please double-check that you copied the entire key correctly from Google AI Studio.');
    process.exit(1);
  }

  console.log('[Info] GEMINI_API_KEY found. Performing a test API call to verify...');

  try {
    const ai = new GoogleGenAI({ apiKey });
    const res = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Say OK',
    });

    const text = res?.text?.trim?.() ?? '';
    if (text.length > 0) {
      console.log('\n[Success] Gemini API key is working correctly!');
      console.log('--------------------------------------------------');
      console.log('Test Response:', text);
      console.log('--------------------------------------------------');
      process.exit(0);
    }
    console.error('[Error] Received an empty response from the API.');
    process.exit(1);
  } catch (err) {
    const message = err?.message || String(err);
    console.error('\n[Error] Gemini API call failed. This may indicate an invalid API key or network issue.');
    console.error('Details:', message);
    process.exit(1);
  }
})();