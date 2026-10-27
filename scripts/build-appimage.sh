#!/usr/bin/env bash
set -e
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

if [ ! -d "node_modules/electron" ]; then
  npm install
fi

npx electron-builder --linux AppImage --x64 --publish never
echo "✅ AppImage ready in dist/Sirag-Atlas-Seerah-x86_64.AppImage"
