#!/usr/bin/env bash
# ==============================================================================
# Build 100% Pure Native Standalone Linux AppImage (Qt 6 / PySide6 + PyInstaller)
# Zero Electron • Zero Browser • Zero WebView!
# Output: dist/Sirag-Atlas-Seerah-x86_64.AppImage
# ==============================================================================
set -e

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

echo "1/4 — Compiling standalone Linux ELF bundle via PyInstaller..."
pyinstaller \
  --noconfirm \
  --clean \
  --windowed \
  --onedir \
  --name "sirag-atlas-seerah" \
  --add-data "assets:assets" \
  --add-data "version.json:." \
  --collect-submodules PySide6.QtMultimedia \
  main.py

echo "2/4 — Assembling AppDir with bundled X11/Wayland Qt6 runtime libraries..."
APPDIR="$ROOT_DIR/dist/SiragAtlas.AppDir"
rm -rf "$APPDIR"
mkdir -p "$APPDIR/usr/bin"
mkdir -p "$APPDIR/usr/lib"
mkdir -p "$APPDIR/usr/share/applications"
mkdir -p "$APPDIR/usr/share/metainfo"

cp -a dist/sirag-atlas-seerah/* "$APPDIR/usr/bin/"

# Bundle commonly missing XCB helper libs (especially libxcb-cursor0) so Qt6 runs out-of-the-box on every distro
for libpat in \
  libxcb-cursor.so* \
  libxcb-icccm.so* \
  libxcb-image.so* \
  libxcb-keysyms.so* \
  libxcb-render-util.so* \
  libxcb-xinerama.so* \
  libxcb-xkb.so* \
  libxkbcommon-x11.so* \
  libxcb-util.so*; do
  found=$(find /usr/lib /lib -name "$libpat" 2>/dev/null || true)
  for f in $found; do
    cp -L "$f" "$APPDIR/usr/lib/" 2>/dev/null || true
  done
done

for sz in 16 32 48 64 128 256 512; do
  mkdir -p "$APPDIR/usr/share/icons/hicolor/${sz}x${sz}/apps"
  cp "linux/icons/${sz}x${sz}.png" "$APPDIR/usr/share/icons/hicolor/${sz}x${sz}/apps/sirag-atlas-seerah.png"
done

cp linux/icons/512x512.png "$APPDIR/sirag-atlas-seerah.png"
cp linux/icons/512x512.png "$APPDIR/.DirIcon"
cp linux/com.sirag.atlas.seerah.desktop "$APPDIR/com.sirag.atlas.seerah.desktop"
cp linux/com.sirag.atlas.seerah.desktop "$APPDIR/usr/share/applications/com.sirag.atlas.seerah.desktop"
cp linux/com.sirag.atlas.seerah.appdata.xml "$APPDIR/usr/share/metainfo/com.sirag.atlas.seerah.appdata.xml"

cat > "$APPDIR/AppRun" << 'APPRUN_EOF'
#!/usr/bin/env bash
HERE="$(dirname "$(readlink -f "${0}")")"
export LD_LIBRARY_PATH="$HERE/usr/lib:${LD_LIBRARY_PATH}"
if [ -z "${QT_QPA_PLATFORM}" ]; then
  export QT_QPA_PLATFORM="xcb;wayland"
fi
exec "$HERE/usr/bin/sirag-atlas-seerah" "$@"
APPRUN_EOF
chmod +x "$APPDIR/AppRun"

echo "3/4 — Packaging squashfs AppImage via appimagetool..."
APPIMAGETOOL="$ROOT_DIR/dist/appimagetool-x86_64.AppImage"
if [ ! -f "$APPIMAGETOOL" ]; then
  curl -sSL -o "$APPIMAGETOOL" \
    "https://github.com/AppImage/appimagetool/releases/download/continuous/appimagetool-x86_64.AppImage"
  chmod +x "$APPIMAGETOOL"
fi

ARCH=x86_64 "$APPIMAGETOOL" --appimage-extract-and-run --no-appstream \
  "$APPDIR" "$ROOT_DIR/dist/Sirag-Atlas-Seerah-x86_64.AppImage"

chmod +x "$ROOT_DIR/dist/Sirag-Atlas-Seerah-x86_64.AppImage"
echo "4/4 — Built standalone native Qt6 AppImage successfully!"
ls -lh "$ROOT_DIR/dist/Sirag-Atlas-Seerah-x86_64.AppImage"
