# scripts/manage

## Commands

### Backend only
```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\manage.ps1 backend
```

### Frontend only
```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\manage.ps1 frontend
```

### Both
```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\manage.ps1 dev
```

## Batch wrapper
```bat
scripts\manage.bat backend
scripts\manage.bat frontend
scripts\manage.bat dev
```

This script assumes the backend venv already exists.
