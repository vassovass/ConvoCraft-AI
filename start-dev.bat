@echo off
setlocal enabledelayedexpansion

:: ============================================================================
:: ConvoCraft AI Development Launcher
::
:: This script provides a streamlined and reliable way to launch the
:: ConvoCraft AI development environment. It ensures services start
:: in the correct order, handles port conflicts, and provides clear
:: feedback to the user.
::
:: Launch Sequence:
:: 1. Verify Gemini API Key
:: 2. Start Backend Server
:: 3. Start Frontend Dev Server
:: 4. Open Browser
:: ============================================================================

:: Setup
:: ----------------------------------------------------------------------------
cd /d "%~dp0"
title ConvoCraft AI Launcher
color 0A
cls

echo ==========================================================
echo  Starting ConvoCraft AI Development Environment...
echo ==========================================================
echo.

:: Part 1: Verify Gemini API Key
:: ----------------------------------------------------------------------------
echo [1/4] Verifying Gemini API key...
node scripts/verifyGeminiKey.js
if errorlevel 1 (
    echo.
    echo [Error] Gemini API key verification failed. The launcher will now exit.
    pause
    exit /b 1
)

choice /c YN /m "API key is valid. Continue with launching ConvoCraft AI? [Y/N]"
if errorlevel 2 (
    echo.
    echo [Info] User chose not to continue. Exiting launcher.
    pause
    exit /b 0
)
echo.

:: Part 2: Start Backend Server
:: ----------------------------------------------------------------------------
echo [2/4] Starting backend server on port 3001...

:: Check for and kill any existing server on port 3001
echo [Info] Checking for existing processes on port 3001...
set "PID="
for /f "tokens=5" %%a in ('netstat -ano ^| findstr "LISTENING" ^| findstr ":3001"') do (
    set "PID=%%a"
)

if defined PID (
    echo [Warning] Found existing process (PID: !PID!) on port 3001. Terminating it now.
    taskkill /PID !PID! /F >nul
    echo [Info] Waiting for port to be released...
    timeout /t 2 /nobreak >nul
) else (
    echo [Info] No existing process found on port 3001.
)

if not exist "logs" mkdir logs
echo [Info] Log file will be created at: %cd%\logs\convocraft.log

start "ConvoCraft API" cmd /c "node server.js >> logs/convocraft.log 2>>&1"

echo [Info] Waiting for backend to initialize...
timeout /t 5 /nobreak >nul

set "backend_ok="
for /f %%a in ('curl -s -o NUL -w "%%{http_code}" http://localhost:3001/health') do (
    if "%%a" == "200" (
        set "backend_ok=true"
    )
)

if not defined backend_ok (
    echo [Error] Backend failed to start or is not responding.
    echo Please check the log file for details: logs\convocraft.log
    pause
    exit /b 1
)

echo [Info] Backend started successfully.
echo.


:: Part 3: Start Frontend Dev Server
:: ----------------------------------------------------------------------------
echo [3/4] Starting frontend dev server...
start "ConvoCraft Vite" cmd /c "npm run dev >> logs/convocraft.log 2>>&1"
echo.

:: Part 4: Open Application in Browser
:: ----------------------------------------------------------------------------
echo [4/4] Finding frontend port and opening application...

set "frontend_port="
echo [Info] Waiting for frontend to become available...

:: Wait up to 20 seconds for the frontend to start and open a port.
for /l %%i in (1,1,20) do (
    if not defined frontend_port (
        timeout /t 1 /nobreak >nul
        :: Scan the typical Vite port range to find the active one.
        for /l %%p in (5173, 1, 5193) do (
            if not defined frontend_port (
                netstat -ano | findstr "LISTENING" | findstr ":%%p" >nul && (
                    set "frontend_port=%%p"
                )
            )
        )
    )
)

if not defined frontend_port (
    echo [Error] Frontend dev server did not start or could not be found.
    echo Please check the log file for details: logs\convocraft.log
    pause
    exit /b 1
)

echo [Info] Frontend is running on port !frontend_port!.
echo [Info] Opening ConvoCraft AI in your default browser...
start "" "http://localhost:!frontend_port!"
echo.


:: Finalization
:: ----------------------------------------------------------------------------
echo ==========================================================
echo.
echo  ConvoCraft AI is running.
echo  This launcher window will remain open for inspection.
echo.
echo ==========================================================
echo.
pause
endlocal 