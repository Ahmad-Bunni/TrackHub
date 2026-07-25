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

app.on('window-all-closed', () => {
  // On Windows/Linux, quit the app when all windows are closed
  // On macOS, the app and its menu bar are expected to remain active until explicitly quit
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
