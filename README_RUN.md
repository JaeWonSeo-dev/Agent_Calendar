# Run Guide

## One-command startup

From the project root:

```powershell
powershell -ExecutionPolicy Bypass -File .\start-dev.ps1
```

or just double-click / run:

```bat
start-dev.bat
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
