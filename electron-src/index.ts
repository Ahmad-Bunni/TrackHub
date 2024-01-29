// Node.js modules
import { join } from 'path';

// Electron modules
import { BrowserWindow, app } from 'electron';
import isDev from 'electron-is-dev';
import prepareNext from 'electron-next';

// Application Requirements
import './ipc-handlers';
import './menu';

// Prepare the renderer once the app is ready
app.on('ready', async () => {
  await prepareNext('./renderer');

  const mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    icon: 'hub.ico',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: join(__dirname, 'preload.js'),
    },
  });

  const devPath = 'http://localhost:8000/';
  const prodPath = `file://${join(__dirname, '../renderer/out/index.html')}`;

  mainWindow.loadURL(isDev ? devPath : prodPath);
});

// Quit the app once all windows are closed
app.on('window-all-closed', app.quit);
