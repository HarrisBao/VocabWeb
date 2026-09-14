# run-backend.ps1
# ─────────────────────────────────────────────────────────────────────────────
# Safe backend start/restart for VocabWeb.Api.
# Workflow:
#   1. Stop any existing VocabWeb.Api (and its dotnet host) by PID
#   2. Wait until both processes are fully gone from the OS process table
#   3. Confirm exe is released (harmless with UseAppHost=false)
#   4. dotnet build
#   5. (optional) dotnet test  — pass -Test flag to enable
#   6. Start exactly one new backend instance
#
# Usage:
#   powershell -ExecutionPolicy Bypass -File .\run-backend.ps1
#   powershell -ExecutionPolicy Bypass -File .\run-backend.ps1 -Test
#
# NOTE: With UseAppHost=false in VocabWeb.Api.csproj, no VocabWeb.Api.exe is
# generated. The app runs as "dotnet VocabWeb.Api.dll". DLLs on Windows are
# NOT exclusively locked while running, so MSB3027/MSB3021 cannot recur.
# ─────────────────────────────────────────────────────────────────────────────

param([switch]$Test)

$ErrorActionPreference = 'Stop'
$ProjectDir = Join-Path $PSScriptRoot "backend\VocabWeb.Api"
$TestDir    = Join-Path $PSScriptRoot "backend\VocabWeb.Tests"

function Stop-BackendSafely {
    Write-Host ""
    Write-Host "-- [1/5] Stopping existing backend processes..." -ForegroundColor Cyan

    $apiProcs = @(Get-Process -Name "VocabWeb.Api" -ErrorAction SilentlyContinue)
    if ($apiProcs.Count -eq 0) {
        Write-Host "  No VocabWeb.Api process found. Skipping kill." -ForegroundColor Green
    } else {
        foreach ($p in $apiProcs) {
            Write-Host "  Stopping VocabWeb.Api PID $($p.Id) (started $($p.StartTime))..." -ForegroundColor Yellow
            $p | Stop-Process -Force -ErrorAction SilentlyContinue
        }
    }

    $dotnetProcs = @(Get-Process -Name "dotnet" -ErrorAction SilentlyContinue)
    foreach ($p in $dotnetProcs) {
        try {
            $cmdline = (Get-WmiObject Win32_Process -Filter "ProcessId=$($p.Id)" -ErrorAction SilentlyContinue).CommandLine
            if ($cmdline -and $cmdline -match "VocabWeb") {
                Write-Host "  Stopping dotnet host PID $($p.Id) (VocabWeb runner)..." -ForegroundColor Yellow
                $p | Stop-Process -Force -ErrorAction SilentlyContinue
            }
        } catch {}
    }
}

function Wait-BackendGone {
    Write-Host "-- [2/5] Waiting for processes to fully exit..." -ForegroundColor Cyan
    $maxWait = 30
    $waited  = 0
    while ($waited -lt ($maxWait * 1000)) {
        $still = @(Get-Process -Name "VocabWeb.Api" -ErrorAction SilentlyContinue)
        if ($still.Count -eq 0) {
            Write-Host "  All VocabWeb.Api processes have exited." -ForegroundColor Green
            Start-Sleep -Milliseconds 800
            return
        }
        Start-Sleep -Milliseconds 500
        $waited += 500
    }
    Write-Error "Timed out waiting for VocabWeb.Api to exit. Aborting."
    exit 1
}

function Assert-ExeNotLocked {
    $exePath = "C:\Users\HarrisBao\AppData\Local\Temp\VocabWeb_Artifacts\bin\VocabWeb.Api\debug\VocabWeb.Api.exe"
    if (-not (Test-Path $exePath)) {
        Write-Host "-- [3/5] No VocabWeb.Api.exe found (UseAppHost=false -- expected)." -ForegroundColor Green
        return
    }
    Write-Host "-- [3/5] Verifying VocabWeb.Api.exe is not locked..." -ForegroundColor Cyan
    try {
        $stream = [System.IO.File]::Open($exePath, 'Open', 'ReadWrite', 'None')
        $stream.Close()
        Write-Host "  Exe is free." -ForegroundColor Green
    } catch {
        Write-Error "VocabWeb.Api.exe is still locked! Cannot build safely. Aborting."
        exit 1
    }
}

function Invoke-Build {
    Write-Host "-- [4/5] Building backend..." -ForegroundColor Cyan
    Push-Location $ProjectDir
    try {
        dotnet build
        if ($LASTEXITCODE -ne 0) {
            Write-Error "dotnet build failed (exit $LASTEXITCODE). Aborting."
            exit $LASTEXITCODE
        }
        Write-Host "  Build succeeded." -ForegroundColor Green
    } finally {
        Pop-Location
    }
}

function Invoke-Tests {
    if (-not $Test) { return }
    Write-Host "-- [4b] Running tests..." -ForegroundColor Cyan
    Push-Location $TestDir
    try {
        dotnet test
        if ($LASTEXITCODE -ne 0) {
            Write-Error "dotnet test failed (exit $LASTEXITCODE). Aborting."
            exit $LASTEXITCODE
        }
        Write-Host "  All tests passed." -ForegroundColor Green
    } finally {
        Pop-Location
    }
}

function Start-Backend {
    Write-Host "-- [5/5] Starting VocabWeb.Api..." -ForegroundColor Cyan
    $check = @(Get-Process -Name "VocabWeb.Api" -ErrorAction SilentlyContinue)
    if ($check.Count -gt 0) {
        Write-Error "A VocabWeb.Api process reappeared before start! PIDs: $($check.Id -join ', ')"
        exit 1
    }
    Set-Location $ProjectDir
    dotnet run
}

Stop-BackendSafely
Wait-BackendGone
Assert-ExeNotLocked
Invoke-Build
Invoke-Tests
Start-Backend
