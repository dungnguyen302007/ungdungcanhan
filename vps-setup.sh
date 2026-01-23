#!/bin/bash

# VPS Setup Script for hethong.websitekhoinghiep.net
# This script will:
# 1. Create directory structure
# 2. Configure Nginx for the subdomain
# 3. Setup SSL with Certbot

set -e  # Exit on error

echo "========================================="
echo "  🚀 VPS Setup Script"
echo "  Domain: hethong.websitekhoinghiep.net"
echo "========================================="
echo ""

# Variables
DOMAIN="hethong.websitekhoinghiep.net"
APP_DIR="/var/www/hethong"
NGINX_CONFIG="/etc/nginx/sites-available/hethong"

# Step 1: Create directory
echo "[1/4] 📁 Creating application directory..."
mkdir -p $APP_DIR
chmod 755 $APP_DIR
echo "✅ Directory created: $APP_DIR"
echo ""

# Step 2: Create Nginx config (HTTP only first, then we'll add SSL)
echo "[2/4] ⚙️  Creating Nginx configuration..."
cat > $NGINX_CONFIG << 'EOF'
server {
    listen 80;
    server_name hethong.websitekhoinghiep.net;

    root /var/www/hethong;
    index index.html;

    # Force HTTPS (will be enabled after SSL setup)
    # return 301 https://$server_name$request_uri;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json application/xml+rss;
}
EOF

echo "✅ Nginx config created"
echo ""

# Step 3: Enable site
echo "[3/4] 🔗 Enabling site..."
ln -sf $NGINX_CONFIG /etc/nginx/sites-enabled/hethong

# Test Nginx config
echo "🧪 Testing Nginx configuration..."
nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Nginx config is valid"
    systemctl reload nginx
    echo "✅ Nginx reloaded"
else
    echo "❌ Nginx config has errors!"
    exit 1
fi
echo ""

# Step 4: Setup SSL with Certbot
echo "[4/4] 🔒 Setting up SSL certificate..."
echo ""
echo "⚠️  Make sure DNS is pointing to this server first!"
echo "   Domain: $DOMAIN"
echo "   IP: $(curl -s ifconfig.me)"
echo ""
read -p "Press Enter to continue with SSL setup (or Ctrl+C to skip)..."

# Check if certbot is installed
if ! command -v certbot &> /dev/null; then
    echo "📦 Installing Certbot..."
    apt update
    apt install -y certbot python3-certbot-nginx
fi

# Get SSL certificate
certbot --nginx -d $DOMAIN --non-interactive --agree-tos --redirect --email admin@websitekhoinghiep.net

if [ $? -eq 0 ]; then
    echo "✅ SSL certificate installed successfully!"
else
    echo "⚠️  SSL setup failed. You can run it manually later:"
    echo "   certbot --nginx -d $DOMAIN"
fi
echo ""

echo "========================================="
echo "  ✅ Setup Complete!"
echo "========================================="
echo ""
echo "📋 Summary:"
echo "   App Directory: $APP_DIR"
echo "   Nginx Config: $NGINX_CONFIG"
echo "   Domain: https://$DOMAIN"
echo ""
echo "📝 Next steps:"
echo "   1. Upload your application files to $APP_DIR"
echo "   2. Visit https://$DOMAIN in your browser"
echo ""
