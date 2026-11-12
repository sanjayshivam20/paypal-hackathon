@echo off
title ImpactPulse AI Control Panel
color 0F

echo ===================================================================
echo                     IMPACTPULSE AI - LAUNCHER
echo       PayPal AI Hackathon 2026 - Autonomous Micro-Task Platform
echo ===================================================================
echo.

set "ROOT_DIR=%~dp0"
if exist "%ROOT_DIR%impactpulse-ai" (
    set "PROJECT_DIR=%ROOT_DIR%impactpulse-ai"
) else (
    set "PROJECT_DIR=%ROOT_DIR%"
)

echo [INFO] Project Directory: %PROJECT_DIR%
echo.

echo [1/3] Starting FastAPI Backend on http://localhost:8000 ...
start "ImpactPulse Backend" /D "%PROJECT_DIR%\backend" cmd /k "venv\Scripts\python.exe -m uvicorn main:app --reload --host 0.0.0.0 --port 8000"

echo [INFO] Initializing Backend runtime...
timeout /t 3 /nobreak >nul

echo [2/3] Starting React Frontend on http://localhost:5173 ...
start "ImpactPulse Frontend" /D "%PROJECT_DIR%\frontend" cmd /k "npm run dev"

echo [INFO] Initializing Frontend runtime...
timeout /t 4 /nobreak >nul

echo [3/3] Opening Browser...
start http://localhost:5173

echo.
echo ===================================================================
echo  SERVICES RUNNING:
echo.
echo  - Frontend Client:  http://localhost:5173
echo  - Backend API:      http://localhost:8000
echo  - API Docs:         http://localhost:8000/docs
echo ===================================================================
echo.
echo Servers are running in dedicated console windows.
echo Press any key to close this launcher.
pause >nul
