@echo off
title Car Rental System - Service Status

echo.
echo ====================================================
echo           🔍 SERVICE STATUS CHECK
echo ====================================================
echo.

echo 📊 Checking Node.js processes...
tasklist | findstr node.exe
if %ERRORLEVEL% NEQ 0 (
    echo ❌ No Node.js processes found!
    echo.
    goto :end
)

echo.
echo 📡 Checking network ports...
netstat -ano | findstr ":3000\|:5000"

echo.
echo 🔧 Testing Backend API...
powershell -Command "try { $result = Invoke-RestMethod -Uri 'http://localhost:5000/api/health' -Method Get -ErrorAction Stop; Write-Host '✅ Backend (Port 5000): WORKING' -ForegroundColor Green; Write-Host '   Message:' $result.message } catch { Write-Host '❌ Backend (Port 5000): FAILED' -ForegroundColor Red }"

echo.
echo 🎨 Testing Frontend...
powershell -Command "try { $result = Invoke-WebRequest -Uri 'http://localhost:3000' -Method Get -UseBasicParsing -ErrorAction Stop; Write-Host '✅ Frontend (Port 3000): WORKING' -ForegroundColor Green } catch { Write-Host '❌ Frontend (Port 3000): FAILED' -ForegroundColor Red; Write-Host '   Trying IPv6 address...' }"

powershell -Command "try { $result = Invoke-WebRequest -Uri 'http://[::1]:3000' -Method Get -UseBasicParsing -ErrorAction Stop; Write-Host '✅ Frontend (IPv6 Port 3000): WORKING' -ForegroundColor Green } catch { Write-Host '❌ Frontend (IPv6): Also failed' -ForegroundColor Red }"

echo.
echo 🌐 Opening applications...
start "" "http://localhost:3000"
start "" "http://localhost:5000/api/health"

:end
echo.
echo Press any key to exit...
pause >nul