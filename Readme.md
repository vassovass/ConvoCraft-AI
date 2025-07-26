
# ConvoCraft AI 🚀

**An intelligent, browser-based application to transcribe files, merge WhatsApp chat exports to include the transcripted audio in the correct timeline of the exported chat, and perform powerful AI analysis on your conversations using your favorite AI providers.**

## 📖 Project Genesis: From a Personal Problem to a Portfolio Piece

This project was born out of a real-world frustration. I was using Perplexity on WhatsApp to capture notes and ideas, but it often failed to provide a text transcript of our conversations. I needed a reliable way to turn those voice notes into text, so I decided to build a solution myself.

My journey began with the coding agent in Google AI Studio. I was pleasantly surprised by how quickly and accurately it scaffolded the initial application, creating a functional UI and the core transcription logic in a single shot. It effortlessly handled batch transcriptions of multiple files, even when the total size was well over 25MB. This experience challenged my previous assumption that older OpenAI models were superior for coding; Gemini proved to be incredibly fast and effective.

As the tool evolved, I moved the project to Cursor and hosted it on GitHub. My focus shifted to making the application more robust, secure, and feature-rich. I integrated CodeRabbit to perform automated code reviews, ensuring a high standard of quality. This project is not just a utility; it's a testament to the power of modern AI development tools and a showcase of my journey in building a secure, user-friendly application from the ground up.

## ✨ Key Features

-   **Multi-Provider AI**: Seamlessly switch between Google Gemini, OpenAI, Anthropic Claude, Groq, or even your own custom endpoint.
-   **Secure, Client-Side Storage**: Your API keys and settings are stored securely in your browser's local storage, never in code or on a server.
-   **Versatile Transcription**: Transcribe a wide range of formats, including audio (`.opus`, `.mp3`), video (`.mp4`), images, and documents.
-   **WhatsApp Chat Integration**:
    -   Upload or paste WhatsApp chat exports (`.txt`).
    -   Filter chats by date range.
    -   Automatically merge transcribed audio back into the chat timeline.
-   **Advanced AI Analysis**:
    -   Leverage one-click prompts for summaries, key points, and sentiment analysis.
    -   Write your own custom prompts to tailor the AI's analysis to your needs.
-   **Multi-Format Export**: Export your merged chats and AI analysis as `.txt`, `.html`, `.json`, or `.csv`.
-   **Private and Secure**: All processing happens in your browser. Your data is never sent to a third-party server, except for the AI provider you configure.
-   **Open Source**: Licensed under the MIT license, so you can use, modify, and share it freely.

## 🔒 Security Features

Security is a top priority for ConvoCraft AI. Here's how we protect your data:

-   **API Key Proxy**: To protect your Gemini API key, all requests are routed through a lightweight server-side proxy. This means your API key is never exposed to the browser, significantly reducing the risk of it being compromised.
-   **Content Sanitization**: All AI-generated content is sanitized using DOMPurify before being rendered in the browser. This prevents Cross-Site Scripting (XSS) attacks and ensures that any potentially malicious content is neutralized.
-   **Dependency Scanning**: We use automated tools to scan for vulnerabilities in our dependencies, ensuring the project stays secure.

## 💻 Technology Stack

-   **Frontend**: React, TypeScript, Vite
-   **Styling**: Tailwind CSS
-   **Testing**: Vitest, React Testing Library
-   **Backend (Proxy)**: Node.js, Express
-   **Development Tools**:
    -   **Initial Scaffolding**: Google AI Studio's Coding Agent
    -   **Refinement & Security**: Cursor
    -   **Code Review**: CodeRabbit

## ⚙️ How the WhatsApp Merger Works: A Closer Look

The real magic of ConvoCraft AI is in its ability to seamlessly weave your transcribed audio back into the context of your WhatsApp conversations. This process is highly tailored to the specific format of WhatsApp's `.txt` chat exports.

**The Logic:**

1.  **Identifying Audio Placeholders**: When you export a WhatsApp chat, audio messages are represented by a placeholder line that looks something like this:
    ```
    [2024/07/26, 10:30:15] Vasso: PTT-20240726-WA0001.opus (file attached)
    ```
    Our parser specifically looks for this pattern: a timestamp, a sender, a filename (like `PTT-20240726-WA0001.opus` or `AUD-20240726-WA0001.opus`), and the text `(file attached)`.

2.  **Matching Transcriptions**: When you upload your `.opus` audio files for transcription, the app stores the transcribed text mapped to its original filename (e.g., `PTT-20240726-WA0001`).

3.  **Replacing the Placeholder**: The merger then reads through your chat log line by line. When it finds an audio placeholder, it looks up the corresponding filename in its map of transcriptions. If a match is found, it replaces the entire placeholder line with the actual transcribed text, while keeping the original timestamp and sender:
    *   **Before**: `[2024/07/26, 10:30:15] Vasso: PTT-20240726-WA0001.opus (file attached)`
    *   **After**: `[2024/07/26, 10:30:15] Vasso: PTT-20240726-WA0001: Hello, this is the transcribed audio message. (file transcribed)`

**Important Note**: This feature is highly optimized for the official WhatsApp `.txt` export format. While it may work with other chat exports that follow a similar pattern, it is not guaranteed.

## 🚀 Getting Started

### Prerequisites

-   Node.js (v18 or higher)
-   npm

### Installation & Running the App

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
    -   Create a `.env` file in the root of the project.
    -   Add your Gemini API key: `GEMINI_API_KEY=your_gemini_api_key_here`
4.  **Run the server and client**:
    -   In one terminal, start the server: `node server.js`
    -   In another terminal, start the client: `npm run dev`
5.  **Open the app** in your browser at `http://localhost:5173`.

### Configuration

All other API keys and settings can be configured directly in the app's "Settings" tab. They will be saved to your browser's local storage.

## ✅ Running Tests

We use Vitest for testing. To run the test suite:

```bash
npm test
```

## 🤝 Contributing

Contributions are welcome! Please feel free to open an issue or submit a pull request.

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.
