@echo off
REM ===============================================
REM  ConvoCraft AI launcher (Windows)
REM ===============================================

cd /d %~dp0

REM --- Optional haiku verification
echo.
choice /c YN /n /m "Run Gemini haiku verification test? [Y/N] "
if errorlevel 2 goto :SKIP_HAIKU
if errorlevel 1 (
    if "%GEMINI_API_KEY%"=="" (
        echo.
        echo Enter GEMINI_API_KEY (input is hidden):
        for /f "usebackq delims=" %%K in (`powershell -NoProfile -Command "$sec=Read-Host -AsSecureString; $b=[System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($sec); [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($b)"`) do set "GEMINI_API_KEY=%%K"
    )
    echo. & echo --- Running verification ---
    npm run verify-gemini-key || echo [WARN] Verification failed.
    set "GEMINI_API_KEY=" & echo. & pause
)
:SKIP_HAIKU

REM --- Backend (API) server handling
for /f "usebackq delims=" %%V in (`powershell -NoProfile -Command "try { (iwr -UseBasicParsing http://localhost:3001/health -TimeoutSec 1).Content } catch { '' }"`) do set "_HEALTH_JSON=%%V"

if not "%_HEALTH_JSON%"=="" (
    for /f "tokens=3 delims=: " %%P in ('powershell -NoProfile -Command "(Get-NetTCPConnection -LocalPort 3001 -State Listen).OwningProcess"') do set "_EXIST_PID=%%P"
    echo.
    echo An existing ConvoCraft API server is running on port 3001 (PID: %_EXIST_PID%).
    choice /c YN /n /m "Kill it and restart? [Y/N] "
    if errorlevel 2 (
        echo Using existing server. Launching frontend only.
        goto :LAUNCH_FRONTEND
    )
    if not "%_EXIST_PID%"=="" (
        echo Stopping existing server (PID %_EXIST_PID%)...
        taskkill /PID %_EXIST_PID% /F >nul 2>&1
        timeout /t 2 >nul
    )
)

echo Starting new backend server on port 3001...
start "ConvoCraft API" cmd /k "node server.js"
timeout /t 2 >nul

:LAUNCH_FRONTEND
REM --- Frontend (Vite)
REM -------------------------------------------------
echo Starting frontend (Vite) and opening browser...
start "ConvoCraft Vite" cmd /k "npm run dev -- --host --open"

:END
echo.
echo Launch sequence complete.
echo.
pause
exit /b