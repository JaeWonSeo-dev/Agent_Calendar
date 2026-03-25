# Run Guide

## One-command startup

From the project root, the simplest way is now:

```powershell
npm install
npm start
```

This runs backend + frontend in the same VSCode terminal using `concurrently`.

You can still run backend or frontend alone:

```powershell
npm run backend
npm run frontend
```

## What it does
- creates the backend virtual environment if missing
- installs backend dependencies
- installs frontend dependencies if `node_modules` is missing
- starts the backend in a new PowerShell window
- starts the frontend in a new PowerShell window

## URLs
- Backend: <http://localhost:8000>
- Frontend: <http://localhost:3000>
