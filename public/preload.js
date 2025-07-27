const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('historyAPI', {
  saveCycle: (cycle) => ipcRenderer.invoke('save-cycle', cycle),
  loadHistory: () => ipcRenderer.invoke('load-history')
}); 