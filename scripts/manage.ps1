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

function Stop-AgentCalendarProcesses {
    $procs = Get-CimInstance Win32_Process | Where-Object {
        $cmd = $_.CommandLine
        if (-not $cmd) { return $false }

        return (
            $cmd -match 'C:\\Sjw_dev\\Coding\\Agent_Calendar\\backend.*uvicorn' -or
            $cmd -match 'C:\\Sjw_dev\\Coding\\Agent_Calendar\\backend.*discord_bot\.py' -or
            $cmd -match 'C:\\Sjw_dev\\Coding\\Agent_Calendar\\frontend\\node_modules\\.*next\\dist\\bin\\next" start' -or
            $cmd -match 'C:\\Sjw_dev\\Coding\\Agent_Calendar\\frontend\\node_modules\\.*next\\dist\\bin\\next" dev'
        )
    } | Sort-Object ProcessId -Unique

    foreach ($proc in $procs) {
        try {
            Stop-Process -Id $proc.ProcessId -Force -ErrorAction Stop
            Write-Host ("Stopped PID {0}: {1}" -f $proc.ProcessId, $proc.Name) -ForegroundColor DarkYellow
        } catch {
            Write-Host ("Skip PID {0}: {1}" -f $proc.ProcessId, $_.Exception.Message) -ForegroundColor DarkGray
        }
    }
}

switch ($Command) {
    'backend' {
        Ensure-BackendVenv
        Set-Location $backendPath
        & $venvActivate
        uvicorn app.main:app --host 127.0.0.1 --port 8000
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
    'discord-bot' {
        Ensure-BackendVenv
        Set-Location $backendPath
        & $venvActivate
        & $venvPython discord_bot.py
        break
    }
    'stop' {
        Stop-AgentCalendarProcesses
        break
    }
    'dev' {
        Write-Host 'Use npm start from the project root for same-terminal startup.' -ForegroundColor Yellow
        break
    }
    'help' {
        Write-Host 'Usage:' -ForegroundColor Cyan
        Write-Host '  npm start  (backend + frontend + discord-bot)' -ForegroundColor White
        Write-Host '  npm run stop' -ForegroundColor White
        Write-Host '  npm run backend' -ForegroundColor White
        Write-Host '  npm run frontend' -ForegroundColor White
        Write-Host '  npm run discord-bot' -ForegroundColor White
        Write-Host '  powershell -ExecutionPolicy Bypass -File .\scripts\manage.ps1 backend' -ForegroundColor White
        Write-Host '  powershell -ExecutionPolicy Bypass -File .\scripts\manage.ps1 frontend' -ForegroundColor White
        Write-Host '  powershell -ExecutionPolicy Bypass -File .\scripts\manage.ps1 frontend-dev' -ForegroundColor White
        Write-Host '  powershell -ExecutionPolicy Bypass -File .\scripts\manage.ps1 discord-bot' -ForegroundColor White
        Write-Host '  powershell -ExecutionPolicy Bypass -File .\scripts\manage.ps1 stop' -ForegroundColor White
        break
    }
    default {
        Write-Error "Unknown command: $Command"
        exit 1
    }
}
