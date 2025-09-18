@echo off
echo.
echo ====================================================
echo           🚗 Car Rental System Status
echo ====================================================
echo.

echo 📊 Checking Node.js processes...
powershell -Command "Get-Process | Where-Object {$_.ProcessName -like '*node*'} | Select-Object ProcessName, Id, WorkingSet | Format-Table -AutoSize"

echo.
echo 🌐 Checking network ports...
netstat -an | findstr "LISTENING" | findstr "3000\|5000"

echo.
echo 🔍 Testing Backend API...
powershell -Command "try { $result = Invoke-RestMethod -Uri 'http://localhost:5000/api/health' -Method Get -ErrorAction Stop; Write-Host '✅ Backend API: WORKING' -ForegroundColor Green; Write-Host '   Status:' $result.status; Write-Host '   Message:' $result.message } catch { Write-Host '❌ Backend API: NOT RESPONDING' -ForegroundColor Red }"

echo.
echo 🔍 Testing Frontend...
powershell -Command "try { $result = Invoke-WebRequest -Uri 'http://localhost:3000' -Method Get -UseBasicParsing -ErrorAction Stop; Write-Host '✅ Frontend: WORKING' -ForegroundColor Green; Write-Host '   Status Code:' $result.StatusCode } catch { Write-Host '❌ Frontend: NOT RESPONDING' -ForegroundColor Red }"

echo.
echo 📱 Application URLs:
echo    Frontend:   http://localhost:3000
echo    Backend:    http://localhost:5000
echo    Health:     http://localhost:5000/api/health
echo    Cars API:   http://localhost:5000/api/cars
echo.

echo 🚀 Opening applications...
start "" "http://localhost:3000"
timeout /t 1 /nobreak >nul
start "" "http://localhost:5000/api/health"

echo.
echo ====================================================
pause