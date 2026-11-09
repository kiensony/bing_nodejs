#!/usr/bin/env bash
set -e

echo "========================================================"
echo "  Kiem tra moi truong va khoi dong tool (Linux)..."
echo "========================================================"
echo ""

# 1. Kiem tra Node.js
if ! command -v node &> /dev/null; then
    echo "[LOI] Chua cai dat Node.js! Vui long cai Node.js (v24 tro len)."
    exit 1
fi

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
