$ErrorActionPreference = 'Stop'

$projectRoot = 'C:\Sjw_dev\Coding\Agent_Calendar'
$backendPath = Join-Path $projectRoot 'backend'
$frontendPath = Join-Path $projectRoot 'frontend'
$venvPython = Join-Path $backendPath '.venv\Scripts\python.exe'
$venvActivate = Join-Path $backendPath '.venv\Scripts\Activate.ps1'

Write-Host '=== Agent Calendar dev startup ===' -ForegroundColor Cyan

if (-not (Test-Path $venvPython)) {
    Write-Host 'Creating backend virtual environment...' -ForegroundColor Yellow
    Set-Location $backendPath
    python -m venv .venv
}

Write-Host 'Installing backend dependencies...' -ForegroundColor Yellow
Set-Location $backendPath
& $venvPython -m pip install -r requirements.txt

if (-not (Test-Path (Join-Path $frontendPath 'node_modules'))) {
    Write-Host 'Installing frontend dependencies...' -ForegroundColor Yellow
    Set-Location $frontendPath
    npm install
}

Write-Host 'Starting backend server...' -ForegroundColor Green
Start-Process powershell -ArgumentList @(
    '-NoExit',
    '-Command',
    "Set-Location '$backendPath'; & '$venvActivate'; uvicorn app.main:app --reload"
)

Write-Host 'Starting frontend server...' -ForegroundColor Green
Start-Process powershell -ArgumentList @(
    '-NoExit',
    '-Command',
    "Set-Location '$frontendPath'; npm run dev"
)

Write-Host ''
Write-Host 'Started:' -ForegroundColor Cyan
Write-Host '- Backend:  http://localhost:8000' -ForegroundColor White
Write-Host '- Frontend: http://localhost:3000' -ForegroundColor White
Write-Host ''
Write-Host 'If this is the first run, wait for package installation to finish in the new windows.' -ForegroundColor DarkYellow
