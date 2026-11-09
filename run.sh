#!/usr/bin/env bash
set -e

echo "========================================================"
echo "  Kiem tra moi truong va khoi dong tool (Linux)..."
echo "========================================================"
echo ""

# 1. Kiem tra va tu dong cai dat Node.js + npm neu chua co
if ! command -v npm &> /dev/null || ! command -v node &> /dev/null; then
    echo "[!] Chua tim thay Node.js / npm tren may!"
    echo "    Dang tien hanh tu dong cai dat Node.js (v24 LTS)..."
    echo ""
    
    if command -v apt-get &> /dev/null; then
        # He dieu hanh Ubuntu / Debian
        echo "--> Cap nhat va cai dat qua apt (Ubuntu/Debian)..."
        sudo apt-get update -y
        sudo apt-get install -y curl ca-certificates gnupg
        curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
        sudo apt-get install -y nodejs
    elif command -v dnf &> /dev/null; then
        # He dieu hanh Fedora / RHEL / Alma / Rocky
        echo "--> Cai dat qua dnf..."
        curl -fsSL https://rpm.nodesource.com/setup_24.x | sudo bash -
        sudo dnf install -y nodejs
    elif command -v yum &> /dev/null; then
        # He dieu hanh CentOS
        echo "--> Cai dat qua yum..."
        curl -fsSL https://rpm.nodesource.com/setup_24.x | sudo bash -
        sudo yum install -y nodejs
    else
        echo "[LOI] Khong the tu dong cai dat! Vui long cai dat Node.js bang tay:"
        echo "      https://nodejs.org/"
        exit 1
    fi
    echo "[OK] Cai dat Node.js va npm thanh cong!"
    echo ""
fi

echo "[Thong tin] Node.js version: $(node -v)"
echo "[Thong tin] npm version:     $(npm -v)"
echo ""

# 2. Kiem tra thu vien node_modules
if [ ! -d "node_modules" ]; then
    echo "[1/3] Phat hien chua cai thu vien, dang chay npm install..."
    npm install
else
    echo "[1/3] Thu vien node_modules: OK!"
fi
echo ""

# 3. Kiem tra va tai trinh duyet Chromium patchright (cung cac thu vien he thong Linux can thiet)
echo "[2/3] Kiem tra trinh duyet Chromium va dependencies he thong..."
npx patchright install --with-deps chromium
echo ""

# 4. Kiem tra ban build dist
if [ ! -d "dist" ]; then
    echo "[3/3] Phat hien chua build source, dang build..."
    npm run build
else
    echo "[3/3] Ban build dist: OK!"
fi
echo ""

echo "========================================================"
echo "  BAT DAU CHAY TOOL"
echo "========================================================"
echo ""
npm start
