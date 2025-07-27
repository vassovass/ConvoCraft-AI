# ConvoCraft AI - Changelog

All notable changes to this project will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

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
