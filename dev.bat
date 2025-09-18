@echo off
echo Starting Car Rental System Development Environment...

echo.
echo 1. Starting MySQL Database...
docker-compose up -d database

echo.
echo 2. Waiting for database to be ready...
timeout /t 10 /nobreak > nul

echo.
echo 3. Starting Backend API...
start "Backend API" cmd /k "cd backend && npm run dev"

echo.
echo 4. Starting Frontend React App...
start "Frontend React App" cmd /k "cd frontend && npm run dev"

echo.
echo Development environment started!
echo - Backend API: http://localhost:5000
echo - Frontend App: http://localhost:3000
echo - Database: localhost:3306

echo.
echo Press any key to exit...
pause > nul