import { join } from 'path';
import { BrowserWindow, app } from 'electron';
import isDev from 'electron-is-dev';
import { initDatabase } from './ipc-handlers';

app.on('ready', async () => {
  initDatabase();

  const mainWindow = new BrowserWindow({
    fullscreenable: false,
    width: 1024,
    height: 768,
    autoHideMenuBar: true,
    resizable: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: join(__dirname, 'preload.js'),
    },
  });

  if (isDev) {
    await mainWindow.loadURL('http://localhost:5173/');
  } else {
    // loadFile handles Windows paths; Vite base './' makes assets resolve next to index.html
    await mainWindow.loadFile(join(__dirname, '../renderer/out/index.html'));
  }
});

app.on('window-all-closed', app.quit);
