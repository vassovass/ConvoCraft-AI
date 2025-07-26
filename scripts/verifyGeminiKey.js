import readline from 'readline';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const promptUser = (question) =>
  new Promise((resolve) => rl.question(question, resolve));

(async () => {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    console.error('[Error] GEMINI_API_KEY is missing. Please set it in your environment (e.g., .env file).');
    process.exit(1);
  }

  // Simple format validation – Gemini keys are long base64-like strings (letters, numbers, -, _)
  const keyFormat = /^[A-Za-z0-9_\-]{20,}$/;
  if (!keyFormat.test(GEMINI_API_KEY)) {
    console.error('[Error] GEMINI_API_KEY appears to be invalid. Double-check that you copied the entire key correctly.');
    process.exit(1);
  }

  const namePrompt = '\nEnter ANY name (this will be woven into a test haiku to verify your Gemini key): ';
  const name = (await promptUser(namePrompt)).trim() || 'friend';
  rl.close();

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(`Write a three-line haiku celebrating ${name}.`);
    const response = await result.response;
    console.log('\n--- Haiku ---');
    console.log(response.text());
    console.log('--------------');
  } catch (err) {
    console.error('[Error] Gemini API call failed. This may indicate an invalid API key or network issue.');
    console.error('Details:', err.message || err);
    process.exit(1);
  }
})(); 