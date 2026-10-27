/**
 * Sirag Atlas — Linux Desktop Preload Bridge (Context-Isolated)
 * Safely bridges Electron desktop capabilities with the Sirag Atlas RTL UI.
 */
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('SiragDesktop', {
  isDesktop: true,
  isLinuxAppImage: Boolean(process.env.APPIMAGE) || process.platform === 'linux',
  platform: process.platform,
  arch: process.arch,
  appVersion: '1.2.0',
  openExternal: (url) => ipcRenderer.invoke('sirag:open-external', url),
  toggleFullScreen: () => ipcRenderer.invoke('sirag:toggle-fullscreen'),
  onMenuAction: (callback) => {
    if (typeof callback !== 'function') return;
    ipcRenderer.on('sirag:menu-action', (_event, payload) => callback(payload));
  }
});
