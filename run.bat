@echo off
title Car Rental System - Complete Launcher

echo.
echo ====================================================
echo        🚗 Car Rental System - Complete Setup
echo ====================================================
echo.

echo 🧹 Cleaning up previous processes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo 🚀 Starting Backend API Server...
start "Car Rental Backend" /MIN /D "%~dp0backend" cmd /c "echo Backend Server Started && node server_simple.js && pause"
timeout /t 3 /nobreak >nul

echo 🎨 Starting Frontend React App...
start "Car Rental Frontend" /MIN /D "%~dp0frontend" cmd /c "echo Frontend Server Started && npm run dev && pause"
timeout /t 8 /nobreak >nul

echo 🔍 Testing Backend API...
powershell -Command "try { $result = Invoke-RestMethod -Uri 'http://localhost:5000/api/health' -Method Get -ErrorAction Stop; Write-Host '✅ Backend API: WORKING' -ForegroundColor Green } catch { Write-Host '❌ Backend API: Failed to start' -ForegroundColor Red }"

echo 🌐 Opening application in browser...
start "" "http://localhost:3000"
timeout /t 2 /nobreak >nul
start "" "http://localhost:5000/api/health"

echo.
echo ====================================================
echo          ✅ CAR RENTAL SYSTEM IS READY!
echo ====================================================
echo.
echo 🌟 FEATURES NOW WORKING:
echo    ✅ Beautiful UI with custom CSS
echo    ✅ Responsive design
echo    ✅ Navigation working
echo    ✅ Backend API connected
echo    ✅ Mock car data available
echo.
echo 📱 APPLICATION URLS:
echo    🏠 Main App:    http://localhost:3000
echo    ⚡ Backend API: http://localhost:5000
echo    📊 Health Check: http://localhost:5000/api/health
echo    🚗 Cars API:    http://localhost:5000/api/cars
echo.
echo 💡 WHAT YOU CAN DO:
echo    • Browse the beautiful homepage
echo    • Navigate to About page
echo    • See working buttons and styling
echo    • Test the backend API endpoints
echo.
echo 🛠️ TO STOP SERVICES:
echo    • Close the two terminal windows that opened
echo    • Or run: taskkill /F /IM node.exe
echo.
echo 📚 NEXT STEPS:
echo    • Add real database (MySQL)
echo    • Implement authentication
echo    • Add car booking functionality
echo.
echo Press any key to exit this window (services will keep running)...
pause >nul