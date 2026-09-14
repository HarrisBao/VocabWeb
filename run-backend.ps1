$ErrorActionPreference = 'SilentlyContinue'
Write-Host "Killing existing VocabWeb.Api processes to prevent file locks..."
Stop-Process -Name "VocabWeb.Api" -Force
Stop-Process -Name "dotnet" -Force
Write-Host "Starting backend..."
cd backend/VocabWeb.Api
dotnet run