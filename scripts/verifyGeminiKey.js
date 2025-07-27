import readline from 'readline';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

/**
 * Prompt the user for input via stdin.
 * @param {string} question - The message to display to the user.
 * @returns {Promise<string>} Resolves with the user's input.
 */
const promptUser = (question) =>
  new Promise((resolve) => rl.question(question, resolve));

(async () => {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    console.error('[Error] GEMINI_API_KEY is missing. Please set it in your environment (e.g., .env file).');
    process.exit(1);
  }

  // A more specific regex to validate the typical format of a Gemini API key.
  // It should start with "AIzaSy" and be followed by 33 alphanumeric characters (including - and _).
  const keyFormat = /^AIzaSy[A-Za-z0-9_\-]{33}$/;
  if (!keyFormat.test(GEMINI_API_KEY)) {
    console.error('[Error] GEMINI_API_KEY appears to have an invalid format. It should be 39 characters long and start with "AIzaSy".');
    console.error('[Info] Please double-check that you copied the entire key correctly from Google AI Studio.');
    await promptUser('Press ENTER to exit...');
    process.exit(1);
  }

  console.log('[Info] GEMINI_API_KEY found. Performing a test API call to verify...');

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent("Explain why the sky is blue in one short sentence.");
    const response = await result.response;

    if (response && response.text() && response.text().trim().length > 0) {
        console.log('\n[Success] Gemini API key is working correctly!');
        console.log('--------------------------------------------------');
        console.log('Test Response: ', response.text().trim());
        console.log('--------------------------------------------------');
        await promptUser('Press ENTER to continue...');
        process.exit(0); // Success
    } else {
        throw new Error('Received an empty or invalid response from the API.');
    }
  } catch (err) {
    console.error('\n[Error] Gemini API call failed. This may indicate an invalid API key or network issue.');
    console.error('Details:', err.message || err);
    await promptUser('Press ENTER to exit...');
    process.exit(1); // Failure
  } finally {
    rl.close();
  }
})();