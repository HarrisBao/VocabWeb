# run-backend.ps1
# ─────────────────────────────────────────────────────────────────────────────
# Safe backend start/restart for VocabWeb.Api.
# Separates Build Output from Runtime Output to prevent MSB3021/MSB3027.
# ─────────────────────────────────────────────────────────────────────────────

param([switch]$Test)

$ErrorActionPreference = 'Stop'
$ProjectDir = Join-Path $PSScriptRoot "backend\VocabWeb.Api"

# The separate directory where the backend actually runs
$RuntimeDir = "C:\Users\HarrisBao\AppData\Local\Temp\VocabWeb_Runtime"
$RuntimeDllPath = Join-Path $RuntimeDir "VocabWeb.Api.dll"

function Stop-BackendSafely {
    Write-Host "-- [1/5] Stopping existing runtime processes..." -ForegroundColor Cyan

    # Stop dotnet hosts specifically running the runtime DLL
    $dotnetProcs = @(Get-Process -Name "dotnet" -ErrorAction SilentlyContinue)
    foreach ($p in $dotnetProcs) {
        try {
            $cmdline = (Get-CimInstance Win32_Process -Filter "ProcessId=$($p.Id)" -ErrorAction SilentlyContinue).CommandLine
            if ($cmdline -and $cmdline -match "VocabWeb_Runtime\\VocabWeb.Api.dll") {
                Write-Host "  Stopping dotnet host PID $($p.Id) (VocabWeb runtime)..." -ForegroundColor Yellow
                $p | Stop-Process -Force -ErrorAction SilentlyContinue
            }
            # Also catch any legacy artifact runners just in case they're still alive
            elseif ($cmdline -and ($cmdline -match "VocabWeb_Artifacts" -and $cmdline -match "VocabWeb.Api.dll")) {
                Write-Host "  Stopping legacy dotnet host PID $($p.Id)..." -ForegroundColor Yellow
                $p | Stop-Process -Force -ErrorAction SilentlyContinue
            }
        } catch {}
    }
}

function Wait-BackendGone {
    Write-Host "-- [2/5] Waiting for port 7035 to be released..." -ForegroundColor Cyan
    $maxWait = 30
    $waited  = 0
    while ($waited -lt ($maxWait * 1000)) {
        $still = @(Get-NetTCPConnection -LocalPort 7035 -State Listen -ErrorAction SilentlyContinue)
        if ($still.Count -eq 0) {
            Write-Host "  Port 7035 is free." -ForegroundColor Green
            Start-Sleep -Milliseconds 800
            return
        }
        Start-Sleep -Milliseconds 500
        $waited += 500
    }
    Write-Error "Timed out waiting for port 7035 to be released. Aborting."
    exit 1
}

function Invoke-Publish {
    Write-Host "-- [3/5] Publishing backend to separate Runtime directory..." -ForegroundColor Cyan
    Push-Location $ProjectDir
    try {
        # Publish directly to VocabWeb_Runtime, bypassing the VS Artifacts bin directory lock
        # This will build and copy all dependencies (DLL, appsettings, deps.json, etc.)
        dotnet publish -c Debug -p:UseAppHost=false -o $RuntimeDir
        if ($LASTEXITCODE -ne 0) {
            Write-Error "dotnet publish failed (exit $LASTEXITCODE). Aborting."
            exit $LASTEXITCODE
        }
        Write-Host "  Publish succeeded to $RuntimeDir." -ForegroundColor Green
    } finally {
        Pop-Location
    }
}

function Assert-OutputValid {
    Write-Host "-- [4/5] Verifying runtime output..." -ForegroundColor Cyan
    if (-not (Test-Path $RuntimeDllPath)) {
        Write-Error "Missing Runtime DLL: $RuntimeDllPath"
        exit 1
    }
    if (Test-Path (Join-Path $RuntimeDir "VocabWeb.Api.exe")) {
        Write-Error "VocabWeb.Api.exe was generated in runtime dir despite UseAppHost=false! Aborting."
        exit 1
    }
    Write-Host "  Output valid: Runtime DLL exists, EXE does not." -ForegroundColor Green
}

function Start-Backend {
    Write-Host "-- [5/5] Starting VocabWeb.Api from Runtime Directory..." -ForegroundColor Cyan
    Set-Location $ProjectDir
    
    $env:ASPNETCORE_ENVIRONMENT = "Development"
    $env:ASPNETCORE_URLS = "https://localhost:7035"
    
    # Start the application from the isolated runtime directory
    dotnet exec $RuntimeDllPath
}

Stop-BackendSafely
Wait-BackendGone
Invoke-Publish
Assert-OutputValid
Start-Backend
