
# Project Development Log

This log documents the development journey of ConvoCraft AI, capturing the evolution of the project in a narrative, chronological format based on the sequence of development activities.

---

### **Phase 4: The Intelligent Launcher & Architectural Solidification (August 2024)**

**Objective: Achieve a rock-solid, secure, and user-friendly launch experience, resolving all prior architectural instabilities.**

- **The Birth of the Intelligent Launcher:** The manual, two-terminal startup process was fully replaced by `start-convocraft-2.bat`, an interactive script designed to automate and simplify the entire launch sequence. This was a major step towards making the application professional and reliable.

- **Solving the API Key Mystery:** After a significant debugging effort to resolve persistent "API key not valid" errors, the root cause was identified: the Node.js backend was not loading `.env` files by default. The `dotenv` package was integrated, providing a final, stable solution for securely managing the backend API key. This marked a critical turning point in stabilizing the application.

- **The Story of a Script's Evolution:** The launcher script itself became a mini-project, evolving rapidly over a series of commits to address user feedback and improve robustness:
  - **Initial Creation:** Built with the core logic for API key testing, checking for existing server processes, and launching the frontend and backend.
  - **Security Hardening:** The API key prompt was made more secure using PowerShell to prevent the key from being displayed on-screen.
  - **Reliability Enhancements:** The logic for killing an existing server was enhanced. Instead of a fixed delay, the script now actively polls the port until it is confirmed to be free, preventing race conditions. Health checks were also added to verify successful service startup.
  - **A Frustrating Regression and a Key Fix:** A critical issue arose where the new command windows would close immediately upon launch. After a period of intense frustration and investigation, the problem was traced to how the Windows `start` command handled quotes. The fix, though simple, was a significant moment in stabilizing the developer experience and led to a new, persistent rule being established to prevent similar issues in the future.

- **Final Architectural Pivot:** The project's architecture was decisively simplified to focus on a single, secure backend API key model. The more complex multi-provider, `localStorage`-based system from the previous phase was removed, resulting in a leaner, more secure, and more maintainable codebase that aligned with best practices.

---

### **Phase 3: Architectural Exploration (Late July 2024)**

**Objective: Explore the feasibility of a multi-provider, client-centric application.**

- **A New Direction:** The project experimented with a major new feature: allowing users to configure and switch between multiple AI providers (Gemini, OpenAI, etc.) directly in the UI.
- **Client-Side Security Model:** To support this, a significant architectural shift was made. API key management was moved from the backend entirely into the browser's `localStorage`. While innovative, this client-centric approach was ultimately superseded in favor of a more robust backend proxy model in the next phase. This exploration, however, was a valuable exercise in understanding different security trade-offs.

---

### **Phase 2: Initial Security Hardening (Late July 2024)**

**Objective: Move away from insecure, hardcoded client-side keys.**

- **First Major Refactor:** The original, insecure method of using a `config.js` file to store the API key on the client-side was removed. The application was refactored to use a server-side environment variable, representing the first major step towards a more secure design.

---

### **Phase 1: Inception and Core Functionality (Mid-July 2024)**

**Objective: Build a functional prototype for transcription and chat merging.**

- **Initial Release:** The first version of the application was created, offering core features like file transcription and the innovative WhatsApp chat merger.
- **Early Configuration:** The project initially used a simple `config.js` file for API key management, a common practice for quick prototyping but later identified as a security risk that needed to be addressed.
