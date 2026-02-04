/**
 * STEMFORCES Desktop - Electron Preload Script
 * Provides secure bridge between renderer and main process
 */
/* eslint-disable no-undef */

const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// secure IPC without exposing the entire electron API
contextBridge.exposeInMainWorld('electronAPI', {
  // App information
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getPlatform: () => ipcRenderer.invoke('get-platform'),
  isDarkMode: () => ipcRenderer.invoke('is-dark-mode'),
  
  // Theme change listener
  onThemeChange: (callback) => {
    ipcRenderer.on('theme-changed', (event, isDark) => callback(isDark));
  },
  
  // Platform check
  isElectron: true,
  
  // OS info
  platform: process.platform,
  arch: process.arch
});

// Expose version info
contextBridge.exposeInMainWorld('appInfo', {
  name: 'STEMFORCES',
  isDesktopApp: true,
  platform: process.platform,
  electronVersion: process.versions.electron,
  nodeVersion: process.versions.node,
  chromeVersion: process.versions.chrome
});

console.log('STEMFORCES Desktop Preload Script Loaded');
