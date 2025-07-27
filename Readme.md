
# ConvoCraft AI 🚀

[![Build Status](https://img.shields.io/circleci/build/github/vassovass/ConvoCraft-AI)](https://app.circleci.com/pipelines/github/vassovass/ConvoCraft-AI)
[![Test Coverage](https://img.shields.io/codecov/c/github/vassovass/ConvoCraft-AI)](https://codecov.io/gh/vassovass/ConvoCraft-AI)
[![Security Rating](https://img.shields.io/snyk/vulnerabilities/github/vassovass/ConvoCraft-AI)](https://snyk.io/test/github/vassovass/ConvoCraft-AI)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**An intelligent, browser-based application to transcribe files, merge WhatsApp chat exports to include the transcripted audio in the correct timeline of the exported chat, and perform powerful AI analysis on your conversations using your favorite AI providers.**

## 📚 Table of Contents

- [Project Genesis: From a Personal Problem to a Portfolio Piece](#-project-genesis-from-a-personal-problem-to-a-portfolio-piece)
- [✨ Key Features](#-key-features)
- [🔒 Security Features](#-security-features)
- [💻 Technology Stack](#-technology-stack)
- [⚙️ How the WhatsApp Merger Works: A Closer Look](#️-how-the-whatsapp-merger-works-a-closer-look)
- [🤖 Choosing an AI for Transcription](#-choosing-an-ai-for-transcription)
- [🚀 Getting Started](#-getting-started)
- [✅ Running Tests](#-running-tests
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

## 📖 Project Genesis: From a Personal Problem to a Portfolio Piece

This project was born out of a real-world frustration. I was using Perplexity on WhatsApp to capture notes and ideas, but it often failed to provide a text transcript of our conversations. I needed a reliable way to turn those voice notes into text, so I decided to build a solution myself.

My journey began with the coding agent in Google AI Studio. I was pleasantly surprised by how quickly and accurately it scaffolded the initial application, creating a functional UI and the core transcription logic in a single shot. It effortlessly handled batch transcriptions of multiple files, even when the total size was well over 25MB. This experience challenged my previous assumption that older OpenAI models were superior for coding; Gemini proved to be incredibly fast and effective.

As the tool evolved, I moved the project to Cursor and hosted it on GitHub. My focus shifted to making the application more robust, secure, and feature-rich. I integrated CodeRabbit to perform automated code reviews, ensuring a high standard of quality. This project is not just a utility; it's a testament to the power of modern AI development tools and a showcase of my journey in building a secure, user-friendly application from the ground up.

## ✨ Key Features

- **Multi-Provider AI**: Seamlessly switch between Google Gemini, OpenAI, Anthropic Claude, Groq, or even your own custom endpoint.
- **Secure, Client-Side Storage**: Your API keys and settings are stored securely in your browser's local storage, never in code or on a server.
- **Versatile Transcription**: Transcribe a wide range of formats, including audio (`.opus`, `.mp3`), video (`.mp4`), images, and documents.
- **WhatsApp Chat Integration**:
  - Upload or paste WhatsApp chat exports (`.txt`).
  - Filter chats by date range.
  - Automatically merge transcribed audio back into the chat timeline.
- **Advanced AI Analysis**:
  - Leverage one-click prompts for summaries, key points, and sentiment analysis.
  - Write your own custom prompts to tailor the AI's analysis to your needs.
- **Multi-Format Export**: Export your merged chats and AI analysis as `.txt`, `.html`, `.json`, or `.csv`.
- **Smart Port Management**: The backend proxy detects if the default port is busy, tells you if another ConvoCraft AI instance is running (with version), and lets you reuse it or auto-select the next free port.
- **CLI Key Verifier**: Run `npm run verify:key` to generate a haiku with Gemini, confirming your `GEMINI_API_KEY` works end-to-end.
- **Private and Secure**: All processing happens in your browser. Your data is never sent to a third-party server, except for the AI provider you configure.
- **Open Source**: Licensed under the MIT license, so you can use, modify, and share it freely.

## 🔒 Security Features

Security is a top priority for ConvoCraft AI. Here's how we protect your data:

- **Backend API Key**: Your `GEMINI_API_KEY` is loaded securely on the backend using a `.env` file. It is never exposed to the browser, significantly reducing the risk of it being compromised.
- **Interactive Launcher**: The `start-convocraft-2.bat` script provides a secure command-line interface for managing the application, including secure input for API key verification.
- **Content Sanitization**: All AI-generated content is sanitized using DOMPurify before being rendered in the browser. This prevents Cross-Site Scripting (XSS) attacks and ensures that any potentially malicious content is neutralized.
- **Dependency Scanning**: We use automated tools to scan for vulnerabilities in our dependencies, ensuring the project stays secure.

## 💻 Technology Stack

- **Frontend**: React, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Testing**: Vitest, React Testing Library
- **Backend (Proxy)**: Node.js, Express
- **Development Tools**:
  - **Initial Scaffolding**: Google AI Studio's Coding Agent
  - **Refinement & Security**: Cursor
  - **Code Review**: CodeRabbit
- **Security & Quality Assurance**:
  - **Unit Testing**: Vitest, React Testing Library
  - **API Security**: Backend-only API key, input validation, rate limiting
  - **Frontend Security**: DOMPurify for XSS prevention
  - **Vulnerability Scanning**: Automated dependency audits
  - **Launch Automation**: Windows Batch Scripting for robust, interactive server management

## ⚙️ How the WhatsApp Merger Works: A Closer Look

The real magic of ConvoCraft AI is in its ability to seamlessly weave your transcribed audio back into the context of your WhatsApp conversations. This process is highly tailored to the specific format of WhatsApp's `.txt` chat exports.

**The Logic:**

1. **Identifying Audio Placeholders**: When you export a WhatsApp chat, audio messages are represented by a placeholder line that looks something like this:

    ```
    [2024/07/26, 10:30:15] Vasso: PTT-20240726-WA0001.opus (file attached)
    ```

    Our parser specifically looks for this pattern: a timestamp, a sender, a filename (like `PTT-20240726-WA0001.opus` or `AUD-20240726-WA0001.opus`), and the text `(file attached)`.

2. **Matching Transcriptions**: When you upload your `.opus` audio files for transcription, the app stores the transcribed text mapped to its original filename (e.g., `PTT-20240726-WA0001`).

3. **Replacing the Placeholder**: The merger then reads through your chat log line by line. When it finds an audio placeholder, it looks up the corresponding filename in its map of transcriptions. If a match is found, it replaces the entire placeholder line with the actual transcribed text, while keeping the original timestamp and sender:
    - **Before**: `[2024/07/26, 10:30:15] Vasso: PTT-20240726-WA0001.opus (file attached)`
    - **After**: `[2024/07/26, 10:30:15] Vasso: PTT-20240726-WA0001: Hello, this is the transcribed audio message. (file transcribed)`

**Important Note**: This feature is highly optimized for the official WhatsApp `.txt` export format. While it may work with other chat exports that follow a similar pattern, it is not guaranteed.

## 🤖 Choosing an AI for Transcription

While ConvoCraft AI supports multiple AI providers, it's important to understand that not all models are created equal, especially when it comes to audio transcription. For the best results, you should use a model that is specialized for this task.

- **Google Gemini**: The current implementation uses Gemini, which is a powerful multimodal model capable of handling audio, images, and video. It's a great general-purpose choice and is well-integrated into this application.
- **OpenAI's Whisper**: Whisper is a state-of-the-art model specifically designed for audio transcription. If your primary goal is the highest possible accuracy for audio files, you may want to configure the app to use OpenAI and its Whisper model.
- **Other Providers**: Other providers like Anthropic's Claude and Groq also have powerful models, but you should verify their transcription capabilities and pricing to see if they fit your needs.

**Recommendation**: Start with the built-in Gemini integration. If you find you need higher accuracy for audio, we recommend setting up an OpenAI key and using it as your active provider. Ultimately, the choice is yours, and we encourage you to research which provider offers the best balance of performance and cost for your use case.

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm
- Windows operating system (for the launcher script)

### Installation & Running the App

The recommended way to run ConvoCraft AI is by using the interactive launcher script.

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/your-username/convocraft-ai.git
    cd convocraft-ai
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Set up your API key**:
    - Create a file named `.env` in the root of the project.
    - Add your Gemini API key to this file:
      ```
      GEMINI_API_KEY=your_gemini_api_key_here
      ```
    - The `.env` file is listed in `.gitignore`, so your key will never be committed to source control.

4.  **Launch the application**:
    - Simply double-click the `start-convocraft-2.bat` file in your file explorer.
    - The script will guide you through the rest, including an optional API key verification test, checking for running servers, and launching the application in new, persistent command windows.

### Manual Startup (Alternative)

If you are not on Windows or prefer to run the services manually:

-   **Run the server**:
    ```bash
    node server.js
    ```
-   **(Optional) Verify your Gemini key works**:
    ```bash
    npm run verify-gemini-key
    ```
-   **Run the client**:
    ```bash
    npm run dev
    ```

## ✅ Running Tests
