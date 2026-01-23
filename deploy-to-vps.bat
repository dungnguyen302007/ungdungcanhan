@echo off
chcp 65001 >nul
echo ========================================
echo   🚀 Deploy to VPS Script
echo ========================================
echo.

REM Configuration
set VPS_IP=103.154.177.160
set VPS_USER=root
set VPS_PATH=/var/www/ungdungcanhan
set LOCAL_BUILD_PATH=dist

echo 📋 Configuration:
echo    VPS IP: %VPS_IP%
echo    VPS User: %VPS_USER%
echo    Deploy Path: %VPS_PATH%
echo.

REM Step 1: Clean old build
echo [1/4] 🧹 Cleaning old build...
if exist %LOCAL_BUILD_PATH% (
    rmdir /s /q %LOCAL_BUILD_PATH%
    echo ✅ Old build cleaned
) else (
    echo ⚠️  No old build found, skipping...
)
echo.

REM Step 2: Build production bundle
echo [2/4] 🔨 Building production bundle...
call npm run build
if errorlevel 1 (
    echo ❌ Build failed!
    pause
    exit /b 1
)
echo ✅ Build successful!
echo.

REM Step 3: Check if SCP is available
echo [3/4] 🔍 Checking SCP availability...
where scp >nul 2>nul
if errorlevel 1 (
    echo.
    echo ⚠️  SCP not found!
    echo.
    echo 📦 Please install one of the following:
    echo    1. Git for Windows (includes SCP): https://git-scm.com/download/win
    echo    2. OpenSSH Client (Windows Feature)
    echo    3. PuTTY (includes PSCP)
    echo.
    echo 💡 After installation, restart this script.
    pause
    exit /b 1
)
echo ✅ SCP is available
echo.

REM Step 4: Deploy to VPS
echo [4/4] 📤 Deploying to VPS...
echo.
echo 🔐 You will be prompted for VPS password
echo    (Password won't be visible while typing)
echo.

REM Clear old files on VPS first
echo 🗑️  Clearing old files on VPS...
ssh %VPS_USER%@%VPS_IP% "rm -rf %VPS_PATH%/*"
if errorlevel 1 (
    echo ⚠️  Warning: Could not clear old files (this is OK if first deploy)
)

REM Upload files
echo 📦 Uploading files...
scp -r %LOCAL_BUILD_PATH%/* %VPS_USER%@%VPS_IP%:%VPS_PATH%/
if errorlevel 1 (
    echo.
    echo ❌ Deploy failed!
    echo.
    echo 🔍 Common issues:
    echo    - Wrong password
    echo    - VPS not accessible
    echo    - SSH key issues
    echo.
    pause
    exit /b 1
)

REM Reload Nginx
echo 🔄 Reloading Nginx...
ssh %VPS_USER%@%VPS_IP% "systemctl reload nginx"
if errorlevel 1 (
    echo ⚠️  Warning: Could not reload Nginx (check manually)
)

echo.
echo ========================================
echo   ✅ Deploy Successful!
echo ========================================
echo.
echo 🌐 Your app is now live at:
echo    👉 http://%VPS_IP%
echo.
echo 📝 Next steps:
echo    - Open browser and test the app
echo    - Check for any console errors
echo    - If issues, check VPS logs:
echo      ssh %VPS_USER%@%VPS_IP%
echo      tail -f /var/log/nginx/error.log
echo.
pause
