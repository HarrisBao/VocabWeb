# run-backend.ps1
# ─────────────────────────────────────────────────────────────────────────────
# Safe backend start/restart for VocabWeb.Api.
# ─────────────────────────────────────────────────────────────────────────────

param([switch]$Test)

$ErrorActionPreference = 'Stop'
$ProjectDir = Join-Path $PSScriptRoot "backend\VocabWeb.Api"
$TestDir    = Join-Path $PSScriptRoot "backend\VocabWeb.Tests"
$ArtifactsDir = "C:\Users\HarrisBao\AppData\Local\Temp\VocabWeb_Artifacts\bin\VocabWeb.Api\debug"
$DllPath = Join-Path $ArtifactsDir "VocabWeb.Api.dll"
$ExePath = Join-Path $ArtifactsDir "VocabWeb.Api.exe"

function Stop-BackendSafely {
    Write-Host "-- [1/6] Stopping existing backend processes..." -ForegroundColor Cyan

    $apiProcs = @(Get-Process -Name "VocabWeb.Api" -ErrorAction SilentlyContinue)
    foreach ($p in $apiProcs) {
        Write-Host "  Stopping VocabWeb.Api PID $($p.Id)..." -ForegroundColor Yellow
        $p | Stop-Process -Force -ErrorAction SilentlyContinue
    }

    $dotnetProcs = @(Get-Process -Name "dotnet" -ErrorAction SilentlyContinue)
    foreach ($p in $dotnetProcs) {
        try {
            $cmdline = (Get-CimInstance Win32_Process -Filter "ProcessId=$($p.Id)" -ErrorAction SilentlyContinue).CommandLine
            if ($cmdline -and ($cmdline -match "VocabWeb.Api.dll" -or $cmdline -match "dotnet run")) {
                Write-Host "  Stopping dotnet host PID $($p.Id) (VocabWeb runner)..." -ForegroundColor Yellow
                $p | Stop-Process -Force -ErrorAction SilentlyContinue
            }
        } catch {}
    }
}

function Wait-BackendGone {
    Write-Host "-- [2/6] Waiting for port 7035 to be released..." -ForegroundColor Cyan
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

function Clean-AppHost {
    Write-Host "-- [3/6] Cleaning stale AppHost if exists..." -ForegroundColor Cyan
    if (Test-Path $ExePath) {
        Write-Host "  Found old VocabWeb.Api.exe. Removing..." -ForegroundColor Yellow
        Remove-Item $ExePath -Force -ErrorAction SilentlyContinue
    }
}

function Invoke-Build {
    Write-Host "-- [4/6] Building backend (UseAppHost=false)..." -ForegroundColor Cyan
    Push-Location $ProjectDir
    try {
        dotnet build -p:UseAppHost=false
        if ($LASTEXITCODE -ne 0) {
            Write-Error "dotnet build failed (exit $LASTEXITCODE). Aborting."
            exit $LASTEXITCODE
        }
        Write-Host "  Build succeeded." -ForegroundColor Green
    } finally {
        Pop-Location
    }
}

function Assert-OutputValid {
    Write-Host "-- [5/6] Verifying build output..." -ForegroundColor Cyan
    if (-not (Test-Path $DllPath)) {
        Write-Error "Missing DLL: $DllPath"
        exit 1
    }
    if (Test-Path $ExePath) {
        Write-Error "VocabWeb.Api.exe was still generated despite UseAppHost=false! Aborting."
        exit 1
    }
    Write-Host "  Output valid: DLL exists, EXE does not." -ForegroundColor Green
}

function Start-Backend {
    Write-Host "-- [6/6] Starting VocabWeb.Api from DLL..." -ForegroundColor Cyan
    Set-Location $ProjectDir
    
    $env:ASPNETCORE_ENVIRONMENT = "Development"
    $env:ASPNETCORE_URLS = "https://localhost:7035"
    
    dotnet exec $DllPath
}

Stop-BackendSafely
Wait-BackendGone
Clean-AppHost
Invoke-Build
Assert-OutputValid
Start-Backend
