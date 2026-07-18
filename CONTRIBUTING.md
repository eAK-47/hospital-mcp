# Contributing to Hospital Guardian

Thank you for your interest in contributing to Hospital Guardian! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Making Changes](#making-changes)
- [Testing](#testing)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)

## Code of Conduct

This project follows a code of conduct that we expect all contributors to adhere to. Please be respectful and constructive in all interactions.

## Getting Started

1. Fork the repository
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/hospital-mcp.git
   cd hospital-mcp
   ```
3. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Setup

### Backend (TypeScript)

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Frontend (React + TypeScript)

```bash
cd frontend
npm install
npm run dev
```

### Telemetry Simulator (Python)

```bash
# Install Python dependencies
pip install -r telemetry_simulator/requirements.txt

# Initialize database
python telemetry_simulator/init_db.py

# Run simulator
python telemetry_simulator/simulator.py
```

## Project Structure

```
├── src/                    # MCP Server (TypeScript)
│   ├── modules/             # MCP modules
│   │   └── hospital-guardian/ # Patient monitoring module
│   ├── http-api.ts          # HTTP API server
│   ├── db.ts                # PostgreSQL connection
│   └── ai.service.ts        # AI integration service
├── frontend/                # Frontend (React + TypeScript)
│   └── src/
│       ├── components/      # UI components
│       ├── pages/           # Page components
│       └── services/        # API services
└── telemetry_simulator/     # Python telemetry simulator
    ├── simulator.py         # Main entry point
    ├── vitals.py            # Vital signs engine
    ├── ecg.py               # ECG waveform generator
    ├── constants.py         # Constants and configuration
    └── requirements.txt       # Python dependencies
```

## Making Changes

### TypeScript Code Style

- Use 2 spaces for indentation
- Use TypeScript strict mode
- Follow the existing code patterns
- Add JSDoc comments for public functions

### Python Code Style

- Use 4 spaces for indentation
- Follow PEP 8 guidelines
- Add docstrings for all functions and classes
- Use type hints where appropriate

### File Naming Conventions

- TypeScript: `kebab-case.ts`
- Python: `snake_case.py`

## Testing

### Backend Tests

```bash
npm test
```

### Python Tests

```bash
python telemetry_simulator/test_db.py
```

## Commit Guidelines

- Use clear, descriptive commit messages
- Reference issues in commit messages where applicable
- Keep commits focused on a single change
- Use present tense ("Add feature" not "Added feature")

## Pull Request Process

1. Update the README.md with details of changes to the project, if applicable
2. Update the version numbers in package.json to the new version that this PR would represent
3. The PR will be merged once it receives approval from a maintainer

## Questions?

Feel free to open an issue with your question, and we'll be happy to help!