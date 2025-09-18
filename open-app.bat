@echo off
echo 🚀 Opening Car Rental System...
echo.
echo Frontend: http://localhost:3001
echo Backend API: http://localhost:5000/api/health
echo.

timeout /t 2 /nobreak > nul

start "" "http://localhost:3001"
start "" "http://localhost:5000/api/health"

echo ✅ Application opened in your browser!
echo.
echo Press any key to exit...
pause > nul