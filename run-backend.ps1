# run-backend.ps1
# Safely stops any running VocabWeb.Api instances, then starts a fresh backend.
# Safe to re-run multiple times — will never leave duplicate processes.

$ErrorActionPreference = 'SilentlyContinue'

Write-Host "Checking for running VocabWeb.Api processes..." -ForegroundColor Cyan
$existing = Get-Process -Name "VocabWeb.Api" -ErrorAction SilentlyContinue
if ($existing) {
    Write-Host "  Found process(es): $($existing.Id -join ', '). Stopping..." -ForegroundColor Yellow
    $existing | Stop-Process -Force
    Start-Sleep -Milliseconds 1000
} else {
    Write-Host "  No running VocabWeb.Api found. Clean start." -ForegroundColor Green
}

# Also stop orphaned dotnet.exe that was the host for VocabWeb.Api
$dotnetProcs = Get-Process -Name "dotnet" -ErrorAction SilentlyContinue
if ($dotnetProcs) {
    # Only kill dotnet processes whose command line includes VocabWeb.Api (conservative)
    foreach ($p in $dotnetProcs) {
        try {
            $cmdline = (Get-WmiObject -Class Win32_Process -Filter "ProcessId=$($p.Id)" -ErrorAction SilentlyContinue).CommandLine
            if ($cmdline -match "VocabWeb") {
                Write-Host "  Stopping dotnet host PID $($p.Id) for VocabWeb.Api..." -ForegroundColor Yellow
                $p | Stop-Process -Force
            }
        } catch {}
    }
    Start-Sleep -Milliseconds 500
}

$ErrorActionPreference = 'Stop'

Write-Host ""
Write-Host "Starting VocabWeb.Api backend..." -ForegroundColor Cyan
Set-Location "$PSScriptRoot\backend\VocabWeb.Api"
dotnet run