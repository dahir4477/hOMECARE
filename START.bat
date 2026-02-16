@echo off
echo ========================================
echo AI Homecare Management System
echo Quick Start Script
echo ========================================
echo.

cd /d "C:\AI System Dispatcher\AI Homecare"

echo Checking if server is already running...
netstat -ano | findstr :3006 >nul
if %errorlevel%==0 (
    echo Server is already running on port 3006!
    echo Opening browser...
    start http://localhost:3006
    exit /b
)

echo Starting development server...
echo.
echo This will open in your browser automatically.
echo Press Ctrl+C to stop the server when done.
echo.

start http://localhost:3006
npm run dev

pause
