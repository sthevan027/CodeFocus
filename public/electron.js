const { app, BrowserWindow, ipcMain, Notification } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Forçar modo desenvolvimento para sempre carregar localhost:3000
const isDev = true; // Sempre usar localhost em desenvolvimento

let mainWindow;

function createWindow() {
  // Criar a janela do navegador
  mainWindow = new BrowserWindow({
    width: 800,
    height: 700,
    minWidth: 600,
    minHeight: 500,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
      allowRunningInsecureContent: true,
      preload: path.join(__dirname, 'preload.js')
    },
    show: false,
    frame: true,
    resizable: true
  });

  // SEMPRE carregar localhost:3000
  const startUrl = 'http://localhost:3000';
  
  console.log('Loading URL:', startUrl);
  
  // Adicionar listeners para debug
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.log('Failed to load:', errorDescription, validatedURL);
  });

  mainWindow.webContents.on('dom-ready', () => {
    console.log('DOM is ready');
  });

  mainWindow.loadURL(startUrl);

  // Mostrar a janela quando estiver pronta
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // SEMPRE abrir DevTools para debug
  mainWindow.webContents.openDevTools();

  // Emitido quando a janela é fechada
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Este método será chamado quando o Electron terminar
// de inicializar e estiver pronto para criar janelas do navegador
app.whenReady().then(createWindow);

// Quit quando todas as janelas estiverem fechadas
app.on('window-all-closed', () => {
  // No macOS é comum para aplicações e suas barras de menu
  // permanecerem ativas até que o usuário saia explicitamente com Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // No macOS é comum recriar uma janela no app quando o
  // ícone do dock é clicado e não há outras janelas abertas
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC Handlers para comunicação entre processos
ipcMain.handle('show-notification', async (event, title, body) => {
  if (Notification.isSupported()) {
    const notification = new Notification({
      title: title,
      body: body,
      silent: false
    });
    notification.show();
  }
});

ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

// Caminho do arquivo de histórico na pasta do usuário
const historyPath = path.join(app.getPath('userData'), 'history.json');

// Handler para salvar ciclo
ipcMain.handle('save-cycle', async (event, cycle) => {
  let history = [];
  try {
    if (fs.existsSync(historyPath)) {
      const data = fs.readFileSync(historyPath, 'utf-8');
      history = JSON.parse(data);
    }
  } catch (e) { history = []; }
  history.push(cycle);
  fs.writeFileSync(historyPath, JSON.stringify(history, null, 2));
  return true;
});

// Handler para carregar histórico
ipcMain.handle('load-history', async () => {
  try {
    if (fs.existsSync(historyPath)) {
      const data = fs.readFileSync(historyPath, 'utf-8');
      return JSON.parse(data);
    }
  } catch (e) {}
  return [];
});

// Prevenir múltiplas instâncias do app
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // Alguém tentou executar uma segunda instância, devemos focar nossa janela
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
} 