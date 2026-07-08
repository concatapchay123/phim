@echo off
setlocal EnableExtensions EnableDelayedExpansion

if "%PORT%"=="" set "PORT=3000"

echo ==================================================
echo   KHOI DONG TRANG XEM PHIM LOCAL
echo ==================================================
echo.

set "PIDS="
for /f "tokens=5" %%P in ('netstat -ano ^| findstr /R /C:":%PORT% .*LISTENING"') do (
    echo !PIDS! | findstr /C:" %%P " >nul
    if errorlevel 1 set "PIDS=!PIDS! %%P "
)

if defined PIDS (
    echo Cong %PORT% dang duoc su dung boi PID:%PIDS%
    echo Co the server dang chay san tai: http://localhost:%PORT%
    echo.
    choice /C OKC /N /M "Nhan O de mo web, K de tat server cu va chay lai, C de huy: "
    if errorlevel 3 goto end
    if errorlevel 2 (
        for %%P in (!PIDS!) do taskkill /PID %%P /F
        timeout /t 1 /nobreak >nul
    ) else (
        start "" "http://localhost:%PORT%"
        goto end
    )
)

echo Dang khoi dong server tai cong %PORT%...
echo Vui long mo trinh duyet va truy cap: http://localhost:%PORT%
echo.
node server.js

:end
pause
