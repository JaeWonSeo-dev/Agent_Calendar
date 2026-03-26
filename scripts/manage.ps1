param(
    [Parameter(Position=0)]
    [string]$Command = "help"
)

$projectRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$backendPath = Join-Path $projectRoot 'backend'
$frontendPath = Join-Path $projectRoot 'frontend'
$venvActivate = Join-Path $backendPath '.venv\Scripts\Activate.ps1'
$venvPython = Join-Path $backendPath '.venv\Scripts\python.exe'

function Ensure-BackendVenv {
    if (-not (Test-Path $venvPython)) {
        Write-Error "Backend virtual environment not found: $venvPython`n먼저 backend 쪽 venv를 준비해라냥."
        exit 1
    }
}

switch ($Command) {
    'backend' {
        Ensure-BackendVenv
        Set-Location $backendPath
        & $venvActivate
        uvicorn app.main:app
        break
    }
    'frontend' {
        Set-Location $frontendPath
        npm run build
        if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
        npm run start
        break
    }
    'frontend-dev' {
        Set-Location $frontendPath
        npm run dev
        break
    }
    'dev' {
        Write-Host 'Use npm start from the project root for same-terminal startup.' -ForegroundColor Yellow
        break
    }
    'help' {
        Write-Host 'Usage:' -ForegroundColor Cyan
        Write-Host '  npm start' -ForegroundColor White
        Write-Host '  npm run backend' -ForegroundColor White
        Write-Host '  npm run frontend' -ForegroundColor White
        Write-Host '  powershell -ExecutionPolicy Bypass -File .\scripts\manage.ps1 backend' -ForegroundColor White
        Write-Host '  powershell -ExecutionPolicy Bypass -File .\scripts\manage.ps1 frontend' -ForegroundColor White
        Write-Host '  powershell -ExecutionPolicy Bypass -File .\scripts\manage.ps1 frontend-dev' -ForegroundColor White
        break
    }
    default {
        Write-Error "Unknown command: $Command"
        exit 1
    }
}
