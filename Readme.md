
# ConvoCraft AI: Transcribe & Analyze

An intelligent, browser-based application to transcribe files, merge WhatsApp chat exports, and perform powerful AI analysis on your conversations using your favorite AI providers.

## The Story Behind ConvoCraft

This project started as a personal experiment with the Google AI Studio code assistant. The initial goal was simple: create a tool to get quick summaries of personal notes and ideas captured in WhatsApp chats. Instead of scattered thoughts, I wanted structured summaries and key points. This tool was born from that need—transforming messy chat logs into organized, actionable information.

As it evolved, it became a flexible, multi-provider tool that could serve a wider purpose, leading to the feature-rich application it is today. It is now shared as an open-source project for others to use, learn from, and build upon.

## Features

- **Multi-Provider AI**: Configure and switch between different AI providers (Google Gemini, OpenAI, Anthropic Claude, Groq) and even a custom endpoint.
- **API Key Verification**: Securely enter your API keys and verify them with a single click to ensure they are working correctly.
- **Secure Local Storage**: Your API keys and settings are saved in your browser's local storage, not in code files, for improved security and convenience.
- **Multi-Format Transcription**: Transcribe audio (e.g., `.opus`, `.mp3`), video (e.g., `.mp4`), images, and documents.
- **Customizable Prompts**: Use the "Settings" tab to define your own default prompt for transcriptions, giving you full control over the AI's output.
- **Batch Processing**: Upload and transcribe multiple files at once with a managed queue.
- **WhatsApp Chat Integration**:
    - Upload or paste a WhatsApp `.txt` chat export.
    - **Date Filtering**: Filter chats by a specific time range (e.g., Last 7 Days) before processing.
    - Automatically merges transcribed audio back into the chat timeline.
- **Advanced AI Analysis**:
    - After merging a chat, use your active AI provider to perform advanced analysis.
    - **One-Click Prompts**: Summarize, extract key points, or analyze sentiment with a single click.
    - **Custom Prompts**: Write your own prompts to transform the chat data.
- **Multi-Format Export**: Export the merged WhatsApp chat as `.txt`, `.html`, `.json`, or `.csv`.
- **Cost Management**: Includes a safety-check warning before processing large batches of files to help you manage API costs.
- **Private & Secure**: Everything runs in your browser. Your files and API keys are not sent to any third-party server besides the AI provider you configure.
- **Open Source**: Licensed under the MIT license.

## Installation

This is a client-side web application and does not require a complex build process.

1.  **Get the Code**: Download or clone the project files to your local machine.
2.  **Run the App**: You can run this application in two simple ways:
    *   **Option A (Easiest)**: Simply open the `index.html` file directly in your web browser.
    *   **Option B (Recommended)**: For the best experience, serve the files using a simple local web server.
        *   If you have **Node.js**: `npm install -g serve && serve .`
        *   If you have **Python**: `python -m http.server`
        *   Then, open the local address provided (e.g., `http://localhost:3000` or `http://localhost:8000`) in your browser.
3.  **Configure API Keys**: Once the app is running, go to the **"Settings"** tab to configure your API keys.

## API Key Setup (Important!)

All API configuration is done inside the app in the **"Settings"** tab.

1.  Navigate to the "Settings" tab.
2.  Choose the AI Provider you want to use (e.g., Gemini).
3.  Enter your API key into the corresponding input field. The key will be masked for security.
4.  Click **"Verify Key"** to ensure the key is correct and working. You should see a "Verified" status.
5.  Select your desired "Active AI Provider" from the dropdown. This is the provider the app will use for all tasks.
6.  Click **"Save All Settings"**. Your keys are stored securely in your browser's local storage and will be available the next time you open the app.

Get your API keys from their respective platforms:
- **Google Gemini**: [Google AI Studio](https://aistudio.google.com/app/apikey)
- **OpenAI**: [OpenAI Platform](https://platform.openai.com/api-keys)
- **Anthropic (Claude)**: [Anthropic Console](https://console.anthropic.com/settings/keys)
- **Groq**: [GroqCloud Console](https://console.groq.com/keys)

## How to Use

### Individual File Transcription
1. Go to the "Settings" tab to configure and select your active AI provider.
2. (Optional) In "Settings", customize the default transcription prompt to fit your needs.
3. Go to the "Transcribe Files" tab.
4. Drag and drop your files into the upload area, or click to browse.
5. The application will automatically process the files. View transcriptions as they complete.
6. Select completed items and use "Copy Selected" to copy them to your clipboard.

### WhatsApp Chat Analysis
1. Navigate to the **"WhatsApp Chat Merger"** tab.
2. **Add Chat Log**: Paste your chat content or upload the `_chat.txt` file. For help, see WhatsApp's official guide on [how to export your chat history](https://faq.whatsapp.com/1180414079177245).
3. **Filter (Optional)**: Choose a date range to focus on a specific period.
4. **Upload Audio**: Go to the "Transcribe Files" tab and upload all corresponding `.opus` audio files.
5. **Review Merged Chat**: Return to the "WhatsApp Chat Merger" tab. The app will automatically merge the transcriptions into the chat log.
6. **Enable AI Analysis**: Check the "Enable AI Chat Analysis" box.
7. **Run AI Prompts**: Click a preset button (e.g., "Summarize") or write a custom prompt and click "Generate". The currently active AI provider will be used.
8. **Review & Export**: View the AI-generated results. Use the export buttons to save your merged chat.

## API Cost and Responsibility

**You are responsible for all costs associated with your own API keys.**

This application is a tool that helps you use various AI APIs. Every time a file is transcribed or a chat is analyzed, it makes a call to the API you have configured, which may consume your quota or incur costs depending on your account setup.

- **Monitor Your Usage**: Always monitor your API usage and billing in your provider's dashboard. Set up budget alerts to avoid unexpected charges.

## License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

## Quick Start

```bash
# 1. Install dependencies (first time only)
npm install

# 2. Start the development server (hot-reload via Vite)
npm run dev
# → open the printed URL, usually http://localhost:5173/
```

For a production build:
```bash
npm run build   # generates static files in dist/
npm run preview # serves the built site
```

### Linting & Tests
```bash
npm run lint       # ESLint over the codebase
npm run docs:lint  # Markdown lint for docs
npm run test       # Placeholder until real tests are added
```

---
