# ConvoCraft AI - Project Roadmap

This document outlines the planned features, enhancements, and long-term goals for ConvoCraft AI. It serves as a guide for future development and a place to capture ideas.

## Near-Term Goals (Next Release Cycle)
- **Re-introduction of Multiple AI Providers**:
  - **Description**: The UI has been simplified to only support Gemini. The underlying code still supports OpenAI, Claude, and Groq. This task involves re-enabling the UI for these providers after thorough testing and validation.
  - **Status**: Planned
- **IndexedDB for Settings Persistence**:
  - **Description**: The current implementation for storing a custom download directory uses a `FileSystemDirectoryHandle`, which cannot be serialized to `localStorage`. To properly persist this across sessions, we need to implement `IndexedDB`.
  - **Status**: Planned

- **Enhanced User Notifications**:
  - **Description**: Replace standard browser `alert()` notifications (e.g., for clipboard errors) with a more modern, non-blocking toast notification system.
  - **Status**: Planned

## Mid-Term Goals (Future Releases)



- **Advanced Chat Filtering**:
  - **Description**: Expand the WhatsApp chat filtering options to include filtering by sender, keyword, or more complex date ranges.
  - **Status**: Idea

- **Full-Featured Test Suite**:
  - **Description**: Expand the test suite to include end-to-end tests for all major user flows, including file transcription, WhatsApp merging, and AI analysis.
  - **Status**: Idea

## Long-Term Vision

- **Cross-Platform Launcher**: Develop launcher scripts for macOS and Linux to provide the same streamlined startup experience currently available on Windows.
- **Plugin Architecture**: Explore a plugin system that would allow third-party developers to add new AI providers or export formats.
- **Cloud Sync**: An optional feature to sync settings and transcription history across multiple devices using a secure, privacy-focused cloud service. 