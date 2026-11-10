@echo off
chcp 65001 >nul
title Microsoft Rewards Automation Tool

echo ========================================================
echo   Kiem tra moi truong va khoi dong tool...
echo ========================================================
echo.

:: 1. Kiem tra thu vien node_modules
if not exist "node_modules\" (
    echo [1/3] Phat hien chua cai thu vien, dang chay npm install...
    call npm install
    if errorlevel 1 (
        echo [LOI] Khong the cai dat thu vien! Vui long kiem tra lai Node.js.
        pause
        exit /b 1
    )
) else (
    echo [1/3] Thu vien node_modules: OK!
)
echo.

:: 2. Kiem tra va tai trinh duyet Chromium patchright (tranh loi Executable doesn't exist)
echo [2/3] Kiem tra trinh duyet Chromium...
call npx patchright install chromium
if errorlevel 1 (
    echo [LOI] Khong the tai trinh duyet Chromium!
    pause
    exit /b 1
)
echo.

:: 3. Luon build lai source de cap nhat code moi (sau khi git pull)
echo [3/3] Dang build source...
call npm run build
if errorlevel 1 (
    echo [LOI] Build source that bai!
    pause
    exit /b 1
)
echo.

echo ========================================================
echo   BAT DAU CHAY TOOL
echo ========================================================
echo.
call npm start

echo.
echo ========================================================
echo   Tool da chay xong. Nhan phim bat ky de thoat.
echo ========================================================
pause

