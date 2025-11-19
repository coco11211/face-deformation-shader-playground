const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getAppPath: () => ipcRenderer.invoke('get-app-path'),
  onExportFrame: (callback) => ipcRenderer.on('export-frame', callback),
  onToggleCamera: (callback) => ipcRenderer.on('toggle-camera', callback),
  onResetEffects: (callback) => ipcRenderer.on('reset-effects', callback),
  onShowAbout: (callback) => ipcRenderer.on('show-about', callback)
});
