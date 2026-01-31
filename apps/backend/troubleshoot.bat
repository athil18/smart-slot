@echo off
REM ============================================
REM Server Troubleshooting Script for Windows
REM ============================================

echo.
echo ====================================
echo  SERVER TROUBLESHOOTING SCRIPT
echo ====================================
echo.

REM Check if port 3000 is in use
echo [1/5] Checking port 3000 status...
netstat -ano | findstr :3000
if %errorlevel% equ 0 (
    echo.
    echo WARNING: Port 3000 is in use!
    echo.
) else (
    echo OK: Port 3000 is free
)
echo.

REM List Node.js processes
echo [2/5] Active Node.js processes:
tasklist | findstr /i "node"
echo.

REM Check Windows Firewall for Node.js
echo [3/5] Checking Windows Firewall rules for Node.js...
netsh advfirewall firewall show rule name=all | findstr /i "node"
echo.

REM Kill any orphaned node processes on port 3000
echo [4/5] To kill processes on port 3000, run:
echo    FOR /F "tokens=5" %%a IN ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') DO taskkill /F /PID %%a
echo.

REM Health check
echo [5/5] Testing server health endpoint...
curl -s http://localhost:3000/health 2>nul
if %errorlevel% neq 0 (
    echo.
    echo Server is NOT responding on port 3000
) else (
    echo.
    echo Server is healthy!
)
echo.

echo ====================================
echo  QUICK FIXES
echo ====================================
echo.
echo If server won't start:
echo   1. Run: taskkill /F /IM node.exe
echo   2. Restart: npm run dev
echo.
echo If firewall is blocking:
echo   1. Run as Admin: netsh advfirewall firewall add rule name="Node.js" dir=in action=allow program="C:\Program Files\nodejs\node.exe" enable=yes
echo.

pause
