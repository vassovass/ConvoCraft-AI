@echo off
REM ===============================================
REM  ConvoCraft AI launcher (Windows)
REM ===============================================

cd /d %~dp0

if not exist .env (
  echo [WARN] No .env file found. Server will look for GEMINI_API_KEY in the environment.
)

echo.
echo Do you want to run the Gemini haiku verification test? (y/N)
set /p RUN_HAIKU=
if /I "%RUN_HAIKU%"=="Y" (
  if "%GEMINI_API_KEY%"=="" (
    set /p GEMINI_API_KEY=Enter GEMINI_API_KEY: 
  )
  npm run verify-gemini-key
  pause
)

REM Launch backend server
start "ConvoCraft API server" cmd /k "node server.js"

REM Launch frontend
start "ConvoCraft Vite" cmd /k "npm run dev -- --host"

echo Servers are starting in new windows.
exit /b 