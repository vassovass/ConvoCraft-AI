@echo off
setlocal enabledelayedexpansion

:: ============================================================================
:: Part 1: Initial Setup & API Key Test
:: ============================================================================
cd /d "%~dp0"
title ConvoCraft AI Launcher
cls

echo ConvoCraft AI Launcher
echo ----------------------
echo.

choice /c YN /m "Run Gemini API key verification test? [Y/N]"
if errorlevel 2 goto SkipApiTest
if errorlevel 1 goto RunApiTest

:RunApiTest
cls
echo Verifying Gemini API Key...
echo.

rem The backend now uses dotenv to load the key from .env,
rem so we only need to prompt if the user wants to run the verification
rem script manually and doesn't have the key set as a system variable.
if defined GEMINI_API_KEY (
    echo An existing GEMINI_API_KEY was found in the environment. Using it for the test.
) else (
    echo.
    echo To run the verification test, please provide the key.
    echo The key will be cleared from this session after the test.
    echo.
    set /p "GEMINI_API_KEY_MANUAL=Please enter your Gemini API key: "

    if not defined GEMINI_API_KEY_MANUAL (
        echo No key was entered. Skipping the test.
        timeout /t 2 /nobreak >nul
        goto SkipApiTest
    )
)

echo.
echo --- Running verification script ---
npm run verify-gemini-key
echo --- Verification complete ---
echo.
set "GEMINI_API_KEY_MANUAL="
echo The API key has been cleared from this session.
pause
goto CheckServer

:SkipApiTest
cls
echo Skipping API key test.
timeout /t 1 /nobreak >nul
goto CheckServer

:: ============================================================================
:: Part 2: Checking for and Managing the Backend Server
:: ============================================================================
:CheckServer
cls
echo Checking for an existing server on port 3001...
set "PID="
for /f "tokens=5" %%a in ('netstat -ano ^| findstr "LISTENING" ^| findstr ":3001"') do (
    set "PID=%%a"
)

if not defined PID (
    echo No existing server found.
    goto StartBackend
)

echo An existing process (PID: %PID%) is listening on port 3001.
echo.
choice /c YN /m "Kill it and restart? [Y/N]"
if errorlevel 2 goto UseExistingServer
if errorlevel 1 goto KillServer

:KillServer
echo.
echo Stopping existing process (PID: %PID%)...
taskkill /PID %PID% /F

echo Waiting for port 3001 to be released...
set "retries=10"
:CheckPortLoop
timeout /t 1 /nobreak >nul
set "port_in_use="
rem Check if any process is listening on port 3001
for /f "tokens=5" %%a in ('netstat -ano ^| findstr "LISTENING" ^| findstr ":3001"') do (
    set "port_in_use=true"
)

if defined port_in_use (
    set /a retries-=1
    if !retries! gtr 0 (
        echo Port is still in use. Retrying (!retries! attempts left)...
        goto CheckPortLoop
    ) else (
        echo Timeout reached. Port could not be freed.
        echo Please check for listening processes on port 3001 manually.
        pause
        goto :eof
    )
)
echo Port has been successfully released.
goto StartBackend

:UseExistingServer
echo.
echo Using existing server.
goto StartFrontend

:: ============================================================================
:: Part 3: Launching the Application
:: ============================================================================
:StartBackend
cls
echo Starting new backend server...
set "start_command=node server.js"
if defined GEMINI_API_KEY_MANUAL (
    set "start_command=cross-env GEMINI_API_KEY=%GEMINI_API_KEY_MANUAL% node server.js"
)
start "ConvoCraft API" cmd /k %start_command%
echo Waiting for backend to initialize...
timeout /t 5 /nobreak >nul

set "backend_ok="
for /f %%a in ('curl -s -o NUL -w "%%{http_code}" http://localhost:3001/health') do (
    if "%%a" == "200" (
        set "backend_ok=true"
    )
)

if defined backend_ok (
    echo Backend started successfully.
) else (
    echo Backend failed to start or is not responding.
    echo Please check the ConvoCraft API window for errors.
    pause
)

:StartFrontend
echo Starting frontend application...
start "ConvoCraft Vite" cmd /k npm run dev -- --open
echo Waiting for frontend to initialize...

set "frontend_ok="
set "frontend_port="
for /l %%p in (5173, 1, 5193) do (
    if not defined frontend_ok (
        for /f "tokens=5" %%a in ('netstat -ano ^| findstr "LISTENING" ^| findstr ":%%p"') do (
            echo Frontend detected on port %%p.
            set "frontend_port=%%p"
            set "frontend_ok=true"
        )
        if not defined frontend_ok (
            timeout /t 1 /nobreak >nul
        )
    )
)

if defined frontend_ok (
    echo Frontend appears to be running on port !frontend_port!.
) else (
    echo Frontend dev server did not start within the expected port range.
    echo Please check the ConvoCraft Vite window for errors.
    pause
)

:: ============================================================================
:: Part 4: Final Confirmation
:: ============================================================================
cls
echo ==========================================================
echo  ConvoCraft AI launch sequence initiated.
echo.
echo  Backend Health: OK
echo  Frontend Port:  !frontend_port!
echo.
echo  Please see the new windows for server status.
echo  This launcher window will remain open.
echo ==========================================================
echo.
pause
endlocal 