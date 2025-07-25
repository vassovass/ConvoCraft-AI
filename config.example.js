
// ==============================================================================
//  API Key Configuration for ConvoCraft AI
// ==============================================================================
//
// INSTRUCTIONS:
// 1. RENAME this file from 'config.example.js' to 'config.js'.
//
// 2. PASTE your API key(s) below. Currently, only the Google Gemini API key
//    is used by the application.
//
// 3. DO NOT commit 'config.js' to version control (e.g., Git). This file is
//    already in .gitignore to prevent you from accidentally sharing your keys.
//
// ==============================================================================

window.APP_CONFIG = {
  // --- Google Gemini (Required for current version) ---
  // Get your key from Google AI Studio: https://aistudio.google.com/app/apikey
  // The free tier is often sufficient for moderate use, but be sure to
  // monitor your usage and set budgets in your Google Cloud account.
  GEMINI_API_KEY: "YOUR_GEMINI_API_KEY_HERE",

  // --- Placeholders for Future AI Provider Support ---
  // The following keys are not yet used by the app but are here to
  // prepare for future expansion.

  // OpenAI API Key
  // OPENAI_API_KEY: "YOUR_OPENAI_API_KEY_HERE",

  // Anthropic (Claude) API Key
  // ANTHROPIC_API_KEY: "YOUR_ANTHROPIC_API_KEY_HERE",
};
