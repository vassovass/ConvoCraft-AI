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
:: 1. Pre-flight Cleanup
:: 2. Verify Gemini API Key
:: 3. Start Backend Server
:: 4. Start Frontend Dev Server
:: 5. Open Browser
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

:: Part 1: Pre-flight Cleanup
:: ----------------------------------------------------------------------------
echo [1/5] Cleaning up any previous server sessions...

:: Terminate any lingering backend processes
taskkill /fi "windowtitle eq ConvoCraft API" /f >nul 2>nul
if not errorlevel 1 (
    echo [Info] Found and closed an old 'ConvoCraft API' window.
)

:: Terminate any lingering frontend processes
taskkill /fi "windowtitle eq ConvoCraft Vite" /f >nul 2>nul
if not errorlevel 1 (
    echo [Info] Found and closed an old 'ConvoCraft Vite' window.
)

:: Clean up Vite cache to prevent file lock issues
if exist "node_modules\\.vite" (
    echo [Info] Removing old Vite cache...
    rmdir /s /q "node_modules\\.vite"
    echo [Info] Vite cache removed.
)
echo.

:: Part 2: Verify Gemini API Key
:: ----------------------------------------------------------------------------
echo [2/5] Verifying Gemini API key...
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

:: Part 3: Start Backend Server
:: ----------------------------------------------------------------------------
echo [3/5] Starting backend server on port 3001...

if not exist "logs" mkdir logs
set "backend_log=%cd%\logs\backend.log"
set "frontend_log=%cd%\logs\frontend.log"
echo [Info] Backend log file will be created at: !backend_log!
del /f /q "!backend_log!" >nul 2>nul

echo [Info] Launching backend server in a new window ('ConvoCraft API')...
start "ConvoCraft API" cmd /k "node server.js >> "!backend_log!" 2>>&1"

echo [Info] Waiting for backend to initialize (5 seconds)...
timeout /t 5 /nobreak >nul

set "backend_ok="
for /f %%a in ('curl -s -o NUL -w "%%{http_code}" http://localhost:3001/health') do (
    if "%%a" == "200" (
        set "backend_ok=true"
    )
)

if not defined backend_ok (
    echo [Error] Backend failed to start or is not responding.
    echo [Error] Please check the 'ConvoCraft API' window or the log file for details: !backend_log!
    pause
    exit /b 1
)

echo [Info] Backend started successfully.
echo.


:: Part 4: Start Frontend Dev Server
:: ----------------------------------------------------------------------------
echo [4/5] Starting frontend dev server...

echo [Info] Cleaning up any previous frontend sessions...
if exist "node_modules\\.vite" (
    rmdir /s /q "node_modules\\.vite"
    echo [Info] Removed old Vite cache to prevent file lock issues.
)

echo [Info] Frontend log file will be created at: !frontend_log!
del /f /q "!frontend_log!" >nul 2>nul
start "ConvoCraft Vite" cmd /k "set NO_COLOR=1 && npm run dev >> "!frontend_log!" 2>>&1"
echo.

:: Part 5: Open Application in Browser
:: ----------------------------------------------------------------------------
echo [5/5] Finding frontend port and opening application...
pause

set "frontend_port="
echo [Info] Waiting for frontend to become available (this can take up to 20 seconds)...
pause

:: Wait for the frontend to start by reading the log file for the port.
set "retries=20"
:find_port_loop
if %retries%==0 (
    echo [Error] Timed out waiting for frontend server to announce its port.
    goto :frontend_fail
)

for /f "tokens=4 delims=:" %%a in ('findstr /c:"Local:" "!frontend_log!" 2^>nul') do (
    for /f "tokens=1 delims=/" %%b in ("%%a") do (
        set "frontend_port=%%~b"
    )
)

if defined frontend_port (
    goto :found_port
) else (
    timeout /t 1 /nobreak >nul
    set /a retries-=1
    goto :find_port_loop
)

:found_port
echo [Info] Frontend is running on port !frontend_port!.
pause
echo [Info] Opening ConvoCraft AI in your default browser...
pause
start "" "http://localhost:!frontend_port!"
echo.
pause
goto :finalization_step


:frontend_fail
if not defined frontend_port (
    echo [Error] Frontend dev server did not start or could not be found.
    echo [Error] Please check the 'ConvoCraft Vite' window or the log file for details: !frontend_log!
    pause
    exit /b 1
)


:: Finalization
:: ----------------------------------------------------------------------------
:finalization_step
echo ==========================================================
echo.
echo  ConvoCraft AI is running.
echo  The backend and frontend server windows will remain open for inspection.
echo.
echo  IMPORTANT: Please manually close the two new server windows
echo             (ConvoCraft API and ConvoCraft Vite) when you are done.
echo.
echo ==========================================================
echo.
pause
endlocal 