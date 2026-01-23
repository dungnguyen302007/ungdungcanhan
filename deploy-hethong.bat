@echo off
chcp 65001 >nul
echo ========================================
echo   🚀 Deploy to hethong.websitekhoinghiep.net
echo ========================================
echo.

set VPS_IP=103.154.177.160
set VPS_USER=root
set VPS_PORT=7878
set DOMAIN=hethong.websitekhoinghiep.net
set VPS_PATH=/var/www/hethong

echo 📋 Configuration:
echo    VPS IP: %VPS_IP%
echo    Domain: %DOMAIN%
echo    Deploy Path: %VPS_PATH%
echo.
echo ⚠️  You will need to enter VPS password when prompted
echo    (Password won't be visible while typing)
pause

REM Step 1: Check if build exists
if not exist "dist" (
    echo ❌ Build folder not found!
    echo 📦 Building application first...
    call npm run build
    if errorlevel 1 (
        echo ❌ Build failed!
        pause
        exit /b 1
    )
)
echo ✅ Build folder found
echo.

REM Step 2: Upload setup script
echo [1/3] 📤 Uploading setup script to VPS...
scp -P %VPS_PORT% vps-setup.sh %VPS_USER%@%VPS_IP%:/root/
if errorlevel 1 (
    echo ❌ Failed to upload setup script
    pause
    exit /b 1
)
echo ✅ Setup script uploaded
echo.

REM Step 3: Run setup script on VPS
echo [2/3] ⚙️  Running setup script on VPS...
echo.
echo 📝 The script will:
echo    - Create /var/www/hethong directory
echo    - Configure Nginx for %DOMAIN%
echo    - Setup SSL certificate
echo.
ssh -p %VPS_PORT% %VPS_USER%@%VPS_IP% "chmod +x /root/vps-setup.sh && bash /root/vps-setup.sh"
if errorlevel 1 (
    echo ⚠️  Setup script had issues (check output above)
    echo    You may need to run it manually
    pause
)
echo.

REM Step 4: Upload application files
echo [3/3] 📦 Uploading application files...
echo.
echo 🗑️  Clearing old files first...
ssh -p %VPS_PORT% %VPS_USER%@%VPS_IP% "rm -rf %VPS_PATH%/*"

echo 📤 Uploading new files...
scp -P %VPS_PORT% -r dist/* %VPS_USER%@%VPS_IP%:%VPS_PATH%/
if errorlevel 1 (
    echo ❌ Failed to upload files!
    pause
    exit /b 1
)
echo ✅ Files uploaded successfully
echo.

REM Step 5: Set permissions
echo 🔧 Setting correct permissions...
ssh -p %VPS_PORT% %VPS_USER%@%VPS_IP% "chmod -R 755 %VPS_PATH% && chown -R www-data:www-data %VPS_PATH%"
echo.

REM Step 6: Reload Nginx
echo 🔄 Reloading Nginx...
ssh -p %VPS_PORT% %VPS_USER%@%VPS_IP% "nginx -t && systemctl reload nginx"
if errorlevel 1 (
    echo ⚠️  Nginx reload had issues
) else (
    echo ✅ Nginx reloaded
)
echo.

echo ========================================
echo   ✅ Deployment Complete!
echo ========================================
echo.
echo 🌐 Your application is live at:
echo    👉 https://%DOMAIN%
echo.
echo 📝 Next steps:
echo    1. Open https://%DOMAIN% in your browser
echo    2. Test all features
echo    3. Check browser console for errors
echo.
echo 🔍 If something is wrong, check logs:
echo    ssh %VPS_USER%@%VPS_IP%
echo    tail -f /var/log/nginx/error.log
echo.
pause
