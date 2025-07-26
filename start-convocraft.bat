@echo off
REM ===============================================
REM  ConvoCraft AI launcher (Windows)
REM ===============================================

cd /d %~dp0

REM Warn if .env missing
if not exist .env (
  (
    echo [WARN] No .env file found. Server will look for GEMINI_API_KEY in the environment.
  )
)

REM Optional haiku verification ------------------------------------------------
echo.
echo Do you want to run the Gemini haiku verification test? (y/N)
set /p RUN_HAIKU=
if /I "%RUN_HAIKU%"=="Y" (
  if "%GEMINI_API_KEY%"=="" (
    echo Enter GEMINI_API_KEY (input will be hidden)...
    for /f "usebackq delims=" %%K in (`powershell -NoProfile -Command "$p=Read-Host -AsSecureString; $b=[System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($p); [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($b)"`) do set "GEMINI_API_KEY=%%K"
  )
  echo Running verification...
  npm run verify-gemini-key || (
    echo [ERROR] Verification failed. Aborting launch.
    set "GEMINI_API_KEY="
    pause
    goto :eof
  )
  set "GEMINI_API_KEY="
  pause
)

REM ---------------------------------------------------------------------------

REM Basic prerequisite checks
if not exist server.js (
  echo [ERROR] server.js not found. Make sure you are in the project root.
  goto :eof
)
where npm >nul 2>nul || (
  echo [ERROR] npm command not found in PATH.
  goto :eof
)

REM Launch backend server
start "ConvoCraft API server" cmd /k "node server.js" || (
  echo [ERROR] Failed to start backend.
  goto :eof
)

REM Launch frontend
start "ConvoCraft Vite" cmd /k "npm run dev -- --host" || (
  echo [ERROR] Failed to start frontend.
  goto :eof
)

echo Servers are starting in new windows.
:EOF
exit /b 