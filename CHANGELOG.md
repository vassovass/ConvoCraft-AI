
# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- **Testing Suite**: Integrated Vitest and Testing Library to enable unit and component testing.
- **Initial Tests**: Added a comprehensive test suite for the `ErrorMessage` component, covering rendering, functionality, and edge cases.
- **Security Proxy**: Implemented a server-side proxy for Gemini API calls to protect the API key from client-side exposure.
- **Content Sanitization**: Added DOMPurify to sanitize AI-generated content before rendering, preventing XSS vulnerabilities.
- **Expandable Errors**: Error messages are now displayed in an expandable and copyable format for better user experience and debugging.

### Changed
- **API Key Verification**: Client-side API key verification for Gemini now only checks for emptiness, relying on the server for full validation.
- **State Persistence**: AI analysis state is now persisted to `localStorage` to prevent data loss on page reloads. A debounce mechanism was added to prevent excessive writes.
- **Filename Generation**: Exported filenames now include a timestamp for uniqueness.
- **Test Script**: Updated the `test` script in `package.json` to run Vitest.
- **Husky Security**: Improved the Husky setup by installing it as a dev dependency first.
- **Commit Message Validation**: Refined the commit message regex to be more robust.
- **Dependency Validation**: Added checks to ensure `npm audit` results are parsed safely.

### Fixed
- **Linter Errors**: Resolved various linter errors, including missing type definitions, incorrect ARIA attributes, and missing labels.
- **`import.meta.env` Errors**: Added a Vite type declaration file to resolve TypeScript errors related to `import.meta.env`.

## [5.0.0] - 2024-07-31

### Added
- **Multi-Provider AI Configuration**: Added a comprehensive "Settings" page to manage API keys for multiple providers: Gemini, OpenAI, Claude, Groq, and a custom endpoint.
- **API Key Verification**: Each provider's settings include a "Verify" button to test the API key against the provider's service, giving users immediate feedback on whether the key is valid.
- **Active Provider Selection**: Users can now select which configured AI provider they want the application to use for all AI-powered tasks.

### Changed
- **CRITICAL SECURITY REFACTOR**: API key management has been completely overhauled. The app no longer uses `config.js` or environment variables. All keys and settings are now stored securely in the browser's **local storage**.
- All components (`Transcription`, `WhatsAppMerger`) now use a centralized `aiService` that routes requests to the user-selected active provider.
- **Improved UI in Settings**: API key inputs are now password fields by default with a toggle for visibility, improving security on shared screens.

### Removed
- **Obsolete Configuration Methods**: Removed all logic related to `config.js` and `process.env`. The files `config.js`, `config.example.js`, and `services/geminiService.ts` are now obsolete and have been removed from the project's logic.

## [4.0.0] - 2024-07-30

### Added
- **Settings Tab**: A new "Settings" tab has been added to the UI.
  - Provides guidance on the new, secure method for API key configuration using environment variables.
  - Allows users to customize and save the default prompt used for all file transcriptions, giving them more control over the AI's output. The custom prompt is saved in local storage.

### Changed
- **SECURITY**: API key handling has been completely refactored. The app now exclusively uses the `API_KEY` environment variable. This is a critical security enhancement that prevents API keys from being exposed on the client side.
- **Improved API Error Handling**: Error messages related to invalid or missing API keys are now more explicit, guiding the user to check their environment variable configuration.

### Removed
- **`config.js` and `config.example.js`**: The insecure `config.js` method for API key management has been removed entirely. The application no longer reads from `window.APP_CONFIG`.

## [3.2.0] - 2024-07-29

### Changed
- **Generalized API Config**: Updated `config.example.js` and `README.md` to reflect a more generic approach to API keys, preparing for future support of multiple AI providers.
- **Improved API Key Error Handling**: Error messages for missing or invalid API keys are now more helpful, providing direct links and instructions on how to fix the `config.js` file.
- **Generic In-App Text**: All user-facing text related to API usage (warnings, instructions) now refers to a generic "AI provider" instead of being hardcoded to "Gemini".
- **Cleaned Up Project**: Removed the confusing `example.env.txt` file entirely to standardize on the `config.js` method.

## [3.1.0] - 2024-07-28

### Added
- **`LICENSE` file**: The project is now officially licensed under the MIT License.
- **WhatsApp Export Guide**: Added a link to the official WhatsApp guide on how to export chats, both in the app and the README.
- **Detailed Installation Instructions**: Added a clear, step-by-step installation guide to the `README.md`.

### Changed
- **API Key Configuration**: Streamlined API key setup to use a single, clear method (`config.js`). This is the correct approach for a browser-only application and avoids potential confusion.
- **Improved Documentation**: Significantly updated `README.md` for clarity on installation, API key handling, and project structure.

### Removed
- **`example.env.txt`**: Removed this file to eliminate confusion. It is not used by this client-side application.

## [3.0.0] - 2024-07-27

### Added
- **Advanced AI Chat Analysis**: New suite of tools in the WhatsApp Merger tab to process merged chats.
  - Users can now summarize, extract key points, or run custom prompts on chat logs using the Gemini API.
  - UI includes preset prompt buttons and a field for custom prompts.
- **Cost Management Warning**: A confirmation modal now appears before uploading more than 10 files or a total of 25MB+ to ensure users are aware of potential API costs.
- **WhatsApp Date Filtering**: Added a dropdown to filter WhatsApp chats by time range (Last 24h, 7d, 30d) before merging.
- **Open Source License**: Added an MIT License to the project.

### Changed
- **Project Name**: Renamed the application to "ConvoCraft AI" for a more distinct identity.
- **Helper Text**: Added more instructional text throughout the UI to guide users.
- **File Upload**: Now explicitly mentions support for video files in the upload area.

### Docs
- **README Overhaul**: Completely rewrote the `README.md` to include an origin story, detailed instructions for new features, a section on API cost responsibility, and license information.
- Updated `config.example.js` with clearer instructions.

## [2.1.0] - 2024-07-26

### Changed
- **CRITICAL FIX**: Refactored API key management to be compatible with a browser-only environment. The app now uses a `config.js` file loaded in the browser instead of relying on `process.env`, which was not available.
- Replaced `example.env.txt` with `config.example.js` to serve as a clear template for the new configuration method.
- Updated error messages to guide users in setting up the `config.js` file correctly.

### Docs
- Updated `README.md` with new, accurate instructions for API key configuration.

## [2.0.0] - 2024-07-26

### Added
- **WhatsApp Chat Merger Feature**: A new tab and workflow to merge transcribed audio into an exported WhatsApp chat log.
- Users can now upload a `.txt` chat file or paste the content directly.
- The system automatically detects audio placeholders in the chat and replaces them with the transcribed text.
- **Multi-Format Export**: Merged chats can be exported as `.txt`, `.html`, `.json`, and `.csv`.
- **New Utility Functions**: Added helper functions for file name manipulation and data exporting.
- **Project Documentation**: Added `README.md` and `CHANGELOG.md`.

### Changed
- **Transcription Output Format**: The file name prepended to individual transcriptions now excludes the file extension for a cleaner look (e.g., `MyAudioFile: ...` instead of `MyAudioFile.mp3: ...`).
- **UI Structure**: Refactored `App.tsx` to support tabbed navigation between the "File Transcriber" and "WhatsApp Chat Merger".
- Updated `Transcription` type to include `baseFileName`.

## [1.0.0] - 2024-07-25

### Added
- Initial release of the File Transcriber AI.
- File upload via drag-and-drop or file browser.
- Batch transcription of multiple files using a queue system.
- Displays transcription status (Pending, Processing, Completed, Error).
- Multi-select functionality for completed transcriptions.
- "Copy Selected" feature to copy formatted transcriptions to the clipboard.
- Clean, responsive UI with light/dark mode support.
