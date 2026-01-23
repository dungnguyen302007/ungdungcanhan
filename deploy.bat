@echo off
echo ========================================
echo   Firebase Deploy Script
echo ========================================
echo.

REM Step 1: Build production bundle
echo [1/3] Building production bundle...
call npm run build
if errorlevel 1 (
    echo Build failed!
    pause
    exit /b 1
)
echo Build successful!
echo.

REM Step 2: Login to Firebase (if needed)
echo [2/3] Checking Firebase authentication...
npx firebase login:list
if errorlevel 1 (
    echo Please login to Firebase...
    npx firebase login
)
echo.

REM Step 3: Deploy to Firebase Hosting
echo [3/3] Deploying to Firebase Hosting...
npx firebase deploy --only hosting
if errorlevel 1 (
    echo Deploy failed!
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Deploy successful!
echo ========================================
pause
