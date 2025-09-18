@echo off
title Car Rental System Startup

echo.
echo ====================================================
echo           🚗 Car Rental System Startup
echo ====================================================
echo.

echo 1. Stopping any existing Node.js processes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo 2. Starting Backend API Server...
start "Car Rental Backend" /D "%~dp0backend" cmd /c "node server_simple.js"
timeout /t 3 /nobreak >nul

echo 3. Starting Frontend React App...
start "Car Rental Frontend" /D "%~dp0frontend" cmd /c "npm run dev"
timeout /t 5 /nobreak >nul

echo 4. Checking services...
echo.

echo ⏳ Waiting for services to start...
timeout /t 8 /nobreak >nul

echo.
echo 🌐 Opening in browser...
start "" "http://localhost:3001"
timeout /t 2 /nobreak >nul
start "" "http://localhost:5000/api/health"

echo.
echo ====================================================
echo ✅ Car Rental System Started Successfully!
echo ====================================================
echo.
echo 📱 Frontend App: http://localhost:3001
echo ⚡ Backend API:  http://localhost:5000
echo 📊 Health Check: http://localhost:5000/api/health
echo 🚗 Cars API:     http://localhost:5000/api/cars
echo.
echo ⚠️  Keep both terminal windows open to keep the app running
echo 🛑 To stop: Close both terminal windows or press Ctrl+C
echo.
echo Press any key to exit this window...
pause >nul