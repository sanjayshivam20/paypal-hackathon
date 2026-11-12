@echo off
title ImpactPulse AI - Development Server Launcher
color 0B

echo ========================================================
echo        ImpactPulse AI - Startup Script
echo ========================================================
echo.

cd /d "%~dp0"

echo [1/2] Starting FastAPI Backend on http://localhost:8000 ...
start "ImpactPulse Backend" cmd /k "cd backend && venv\Scripts\python.exe -m uvicorn main:app --reload --host 0.0.0.0 --port 8000"

timeout /t 3 /nobreak >nul

echo [2/2] Starting React Vite Frontend on http://localhost:5173 ...
start "ImpactPulse Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================================
echo  All services started!
echo  Backend:  http://localhost:8000
echo  Frontend: http://localhost:5173
echo ========================================================
echo.
pause
