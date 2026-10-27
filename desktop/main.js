/**
 * سراج أطلس السيرة النبوية ﷺ — Linux Desktop & AppImage Main Process (v1.2.0)
 * Royal Desktop Shell built with Electron for universal Linux distributions.
 * Developed by Mohamed Salah Abdelkhalek (تم التطوير بواسطة محمد صلاح عبد الخالق)
 */
const { app, BrowserWindow, shell, Menu, ipcMain, nativeTheme } = require('electron');
const http = require('http');
const fs = require('fs');
const path = require('path');

const APP_TITLE = 'سراج أطلس السيرة النبوية ﷺ';
const DEV_BLOG_URL = 'https://elkatebmohamadsalah.blogspot.com/?m=1#google_vignette';
const GITHUB_REPO_URL = 'https://github.com/mosalah30688-gif/sirag-atlas-linux';
const GITHUB_RELEASES_URL = 'https://github.com/mosalah30688-gif/sirag-atlas-linux/releases/latest';

// Ensure smooth Linux GPU/WebGL & Sandbox compatibility inside AppImage containers
if (process.platform === 'linux') {
  app.commandLine.appendSwitch('enable-features', 'VaapiVideoDecoder');
  app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');
  if (process.env.APPIMAGE || process.getuid?.() === 0) {
    app.commandLine.appendSwitch('no-sandbox');
  }
}

nativeTheme.themeSource = 'dark';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.ico': 'image/x-icon'
};

let mainWindow = null;
let localServer = null;
let serverOrigin = '';

/**
 * Starts a fast, zero-dependency loopback HTTP server bound strictly to 127.0.0.1
 * serving the bundled offline web root (`www/` or repository root).
 */
function startEmbeddedServer() {
  return new Promise((resolve, reject) => {
    const candidateWww = path.join(__dirname, '..', 'www');
    const webRoot = fs.existsSync(path.join(candidateWww, 'index.html'))
      ? candidateWww
      : path.join(__dirname, '..');

    const server = http.createServer((req, res) => {
      try {
        const rawUrl = decodeURIComponent((req.url || '/').split('?')[0]);
        const safeRel = path.normalize(rawUrl).replace(/^(\.\.[/\\])+/, '');
        let filePath = path.join(webRoot, safeRel === '/' ? 'index.html' : safeRel);

        if (!filePath.startsWith(webRoot)) {
          res.writeHead(403);
          res.end('Forbidden');
          return;
        }

        if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
          filePath = path.join(filePath, 'index.html');
        }

        if (!fs.existsSync(filePath)) {
          res.writeHead(404);
          res.end('Not Found');
          return;
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        // Support byte-range streaming for offline Sahaba audio poems (.mp3)
        const stat = fs.statSync(filePath);
        const range = req.headers.range;
        if (range && ext === '.mp3') {
          const parts = range.replace(/bytes=/, '').split('-');
          const start = parseInt(parts[0], 10);
          const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
          res.writeHead(206, {
            'Content-Range': `bytes ${start}-${end}/${stat.size}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': end - start + 1,
            'Content-Type': contentType
          });
          fs.createReadStream(filePath, { start, end }).pipe(res);
          return;
        }

        res.writeHead(200, {
          'Content-Type': contentType,
          'Content-Length': stat.size,
          'Cache-Control': 'no-cache'
        });
        fs.createReadStream(filePath).pipe(res);
      } catch (err) {
        res.writeHead(500);
        res.end('Internal Error');
      }
    });

    server.listen(0, '127.0.0.1', () => {
      const addr = server.address();
      localServer = server;
      serverOrigin = `http://127.0.0.1:${addr.port}`;
      resolve(serverOrigin);
    });

    server.on('error', reject);
  });
}

function sendMenuAction(action, value = null) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('sirag:menu-action', { action, value });
  }
}

function buildArabicDesktopMenu() {
  const template = [
    {
      label: 'ملف',
      submenu: [
        {
          label: '🔍 البحث الفوري الشامل',
          accelerator: 'CmdOrCtrl+K',
          click: () => sendMenuAction('open-search')
        },
        {
          label: '⚙️ الإعدادات وفحص التحديثات',
          accelerator: 'CmdOrCtrl+,',
          click: () => sendMenuAction('open-settings')
        },
        { type: 'separator' },
        {
          label: '🖥️ وضع ملء الشاشة',
          accelerator: 'F11',
          click: () => {
            if (mainWindow) mainWindow.setFullScreen(!mainWindow.isFullScreen());
          }
        },
        {
          label: '🔄 إعادة تحميل الواجهة',
          accelerator: 'CmdOrCtrl+R',
          click: () => mainWindow?.reload()
        },
        { type: 'separator' },
        {
          label: 'خروج',
          accelerator: 'CmdOrCtrl+Q',
          click: () => app.quit()
        }
      ]
    },
    {
      label: 'أقسام السيرة',
      submenu: [
        { label: '🗺️ الأطلس الحي ومزامن الوحي', accelerator: 'Alt+1', click: () => sendMenuAction('switch-view', 'atlas') },
        { label: '🐪 الهجرة السرية وميدان الفرسان', accelerator: 'Alt+2', click: () => sendMenuAction('switch-view', 'hijrah') },
        { label: '⚔️ محاكي الغزوات التكتيكي', accelerator: 'Alt+3', click: () => sendMenuAction('switch-view', 'battles') },
        { label: '🕌 المخطط الهندسي للحرمين', accelerator: 'Alt+4', click: () => sendMenuAction('switch-view', 'sanctuaries') },
        { label: '🧭 لو كنتَ في ذلك اليوم', accelerator: 'Alt+5', click: () => sendMenuAction('switch-view', 'scenarios') },
        { label: '✨ مجرّة الصحابة الكرام', accelerator: 'Alt+6', click: () => sendMenuAction('switch-view', 'constellation') },
        { label: '🌿 عمود النسب والشمائل', accelerator: 'Alt+7', click: () => sendMenuAction('switch-view', 'lineage') },
        { label: '🎙️ ديوان القصائد المسموع والمعجم', accelerator: 'Alt+8', click: () => sendMenuAction('switch-view', 'diwan') },
        { label: '💎 الهدي التطبيقي', click: () => sendMenuAction('switch-view', 'guidance') },
        { label: '📜 المتحف النبوي (3D)', click: () => sendMenuAction('switch-view', 'museum') },
        { label: '🏅 ختمة السيرة والشهادة الذهبية', accelerator: 'Alt+9', click: () => sendMenuAction('switch-view', 'khatmah') }
      ]
    },
    {
      label: 'المظهر والعرض',
      submenu: [
        { label: '🌙 الوضع الليلي الفلكي', click: () => sendMenuAction('set-theme', 'night') },
        { label: '📜 وضع الرقّ النهاري العاجي', click: () => sendMenuAction('set-theme', 'parchment') },
        { type: 'separator' },
        { role: 'zoomIn', label: 'تكبير العرض (+)' },
        { role: 'zoomOut', label: 'تصغير العرض (-)' },
        { role: 'resetZoom', label: 'الحجم الافتراضي (100%)' }
      ]
    },
    {
      label: 'حول التطبيق',
      submenu: [
        {
          label: '✨ تم التطوير بواسطة محمد صلاح عبد الخالق',
          click: () => shell.openExternal(DEV_BLOG_URL)
        },
        {
          label: '📦 صفحة الإصدارات والتحديثات (GitHub Releases)',
          click: () => shell.openExternal(GITHUB_RELEASES_URL)
        },
        {
          label: '💻 المستودع المصدري الرسمي على GitHub',
          click: () => shell.openExternal(GITHUB_REPO_URL)
        }
      ]
    }
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

async function createMainWindow() {
  const origin = await startEmbeddedServer();
  const iconPath = path.join(__dirname, 'icons', '512x512.png');

  mainWindow = new BrowserWindow({
    width: 1380,
    height: 880,
    minWidth: 380,
    minHeight: 600,
    title: APP_TITLE,
    backgroundColor: '#060a11',
    icon: fs.existsSync(iconPath) ? iconPath : path.join(__dirname, '..', 'assets', 'icon-512.png'),
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      spellcheck: false
    }
  });

  buildArabicDesktopMenu();

  // Safely open external links in the user's default Linux browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url && !url.startsWith(origin)) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (url && !url.startsWith(origin)) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  await mainWindow.loadURL(`${origin}/index.html`);
}

ipcMain.handle('sirag:open-external', async (_event, url) => {
  if (typeof url === 'string' && /^https?:\/\//i.test(url)) {
    await shell.openExternal(url);
    return true;
  }
  return false;
});

ipcMain.handle('sirag:toggle-fullscreen', () => {
  if (!mainWindow) return false;
  const next = !mainWindow.isFullScreen();
  mainWindow.setFullScreen(next);
  return next;
});

// Ensure single instance on Linux desktop
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(createMainWindow);
}

app.on('window-all-closed', () => {
  if (localServer) {
    try { localServer.close(); } catch (_) {}
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
