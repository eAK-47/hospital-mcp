# ICU Guardian AI Frontend

Professional ICU monitoring frontend built with React, TypeScript, Tailwind CSS, React Router, Framer Motion, Recharts, React Icons, and React Markdown.

This is frontend only. It uses local JSON fixtures and does not call the backend, database, simulator, or MCP server yet.

## Run

```bash
npm install
npm run dev
```

On Windows PowerShell, use `npm.cmd` if script execution is blocked:

```bash
npm.cmd install
npm.cmd run dev
```

## Backend Integration Placeholder

Future backend integration should start in `src/services/mockApi.ts`.

Replace the mock service functions with real API calls when the backend endpoints are ready. The UI pages already consume data through that service layer, so the component structure can stay mostly unchanged.

## Verification Note

The source can be checked with:

```bash
node ./node_modules/typescript/bin/tsc --noEmit
```

If Vite reports `spawn EPERM` on this Windows/OneDrive setup, it means the environment is blocking Vite/esbuild from launching its helper executable. Running from a normal terminal with execution allowed, or moving the project out of a synced/restricted folder, should fix it.
