#!/data/data/com.termux/files/usr/bin/bash
# ====================================================================
# Job Finder - Termux Mobile One-Click Setup & Launch Script
# ====================================================================

echo "=========================================="
echo "  🚀 JOB FINDER - MOBILE SETUP (TERMUX)"
echo "=========================================="

echo "[1/4] Checking and installing Node.js & Git..."
pkg update -y
pkg install -y nodejs git

echo "[2/4] Initializing environment config..."
if [ ! -f .env ]; then
  cp .env.example .env
  echo "Created .env from .env.example"
fi

if [ ! -f backend/data/platform_credentials.json ]; then
  if [ -f backend/data/platform_credentials.example.json ]; then
    cp backend/data/platform_credentials.example.json backend/data/platform_credentials.json
    echo "Initialized platform credentials template"
  fi
fi

echo "[3/4] Installing dependencies..."
npm install

echo "[4/4] Building web application..."
npm run build

echo ""
echo "=========================================="
echo "  ✅ SUCCESS! Job Finder is Ready!"
echo "  🌐 Local Access:   http://localhost:5000"
echo "  📡 Termux running on port 5000"
echo "=========================================="
echo ""

node backend/server.js
