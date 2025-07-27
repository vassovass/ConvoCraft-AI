# ConvoCraft AI - Changelog

All notable changes to this project will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.1.0] - 2024-08-22

This release focuses on enhancing user experience, improving data management, and streamlining the development workflow.

### Added
- **Save All Transcriptions**: Users can now save all completed transcriptions as individual `.txt` files with a single click from the main header.
- **Copy Merged Chat**: A "Copy" button has been added to the WhatsApp Chat Merger to easily copy the entire merged conversation to the clipboard.
- **Custom Download Directory**: A new setting allows users to select a preferred default folder for downloads using the File System Access API.
- **Auto-Saving Settings**: All changes in the settings panel are now saved automatically with a debounce mechanism, removing the need for a manual save button.

### Changed
- **UI Enhancements**:
  - The "Save All" button has been moved to the top-level application header for better visibility and access.
  - The "Save All Settings" button has been removed from the Settings page in favor of the new auto-save functionality.
- **Improved Error Handling**:
  - The clipboard copy function in the WhatsApp Merger now provides a clear alert to the user if the operation fails.
  - Added more robust error handling for file-saving operations.
- **Streamlined Development Startup**: Removed multiple `pause` commands from the `start-dev.bat` script to accelerate the development server launch process.

### Fixed
- **File Locking on Windows**: Resolved a critical issue where the backend and frontend servers would attempt to write to the same log file, causing "file in use" errors on Windows. They now log to separate `backend.log` and `frontend.log` files.
- **Color Codes in Logs**: Prevented color codes from being written to the log files, which was interfering with the script's ability to parse the frontend port.
- **Race Conditions**: Enhanced the pre-flight cleanup in `start-dev.bat` to terminate all previous `ConvoCraft` processes before launch, preventing race conditions and file-locking issues.
- **Settings Page Memory Leak**: Corrected a memory leak in the `Settings.tsx` component where a `setTimeout` for user feedback was not being properly cleared.
- **Directory Picker Logic**: Improved the logic for the custom directory picker to correctly handle the `FileSystemDirectoryHandle` and provide clearer user feedback.

### Code Refactoring
- **Type Safety**: Replaced `any` types with specific `FileSystemFileHandle` and related interfaces for the `showSaveFilePicker` API in `App.tsx`, improving type safety.
- **Reusability**: Extracted file-saving logic into a new `utils/fileSaver.ts` module with `saveTextToFile` and `generateSessionFilename` utility functions to reduce code duplication.

## [1.0.0] - 2024-08-21

This release marks the first stable, production-ready version of ConvoCraft AI. It introduces a completely overhauled and robust development and launch environment, ensuring reliability and ease of use.

### Added
- **Intelligent Development Launcher (`start-dev.bat`):** A new, interactive script that automates and orchestrates the entire development startup sequence.
- **Sequential Service Loading:** The launcher now enforces a strict startup order (API Key Check -> Backend -> Frontend) to prevent race conditions and initialization errors.
- **Automated Port Detection:** The launcher script now automatically finds the correct port used by the Vite frontend and opens the browser to the correct URL, resolving port conflicts.
- **Live API Key Verification:** The startup process now includes a mandatory, user-friendly check to validate the `GEMINI_API_KEY` before launching the main application. The script waits for user confirmation before proceeding.
- **Centralized Logging:** All output from the backend and frontend servers is now redirected to a unified log file (`logs/convocraft.log`) for simplified debugging.

### Changed
- **Backend API Key Management:** Integrated `dotenv` into the backend, establishing the `.env` file as the single source of truth for the `GEMINI_API_KEY`. This resolves previous inconsistencies.
- **Simplified Architecture:** Removed the experimental, client-side, multi-provider API key system in favor of a more secure and maintainable backend-proxy model.

### Fixed
- **CLI Stability:** Resolved a critical issue where new command windows would close immediately on launch, ensuring they remain open for debugging as intended.
- **Server Restart Logic:** Improved the logic for killing existing server processes by actively polling the port, ensuring it is free before restarting the server.

### Migration Notes for Developers

This version introduces a new, mandatory startup script: `start-dev.bat`. The previous manual method of running `npm run dev` and `node server.js` in separate terminals is now deprecated.

**To start the development environment, you must now run `start-dev.bat` from your terminal.**

This script handles all the necessary steps, including API key verification, backend and frontend server launch, and opening the application in your browser. This change was made to address significant architectural instabilities and provide a stable, professional, and reliable development experience.

---

## [Unreleased] - Early Development

This section summarizes the initial exploratory phases of the project before the first stable release.

- **Phase 3 (Late July 2024):** Explored a client-centric, multi-provider architecture where API keys were managed in `localStorage`. This approach was ultimately superseded in favor of a more secure backend model.
- **Phase 2 (Late July 2024):** The first major security refactor. Moved away from an insecure, hardcoded `config.js` on the client-side to a server-side environment variable.
- **Phase 1 (Mid-July 2024):** Initial project inception. The first version was created with core transcription and WhatsApp chat merging features, using a basic `config.js` for API key management.
