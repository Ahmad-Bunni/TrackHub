// Node.js modules
import { join } from 'path';

// Electron modules
import { BrowserWindow, app } from 'electron';
import isDev from 'electron-is-dev';
import prepareNext from 'electron-next';

// Application handlers
import './ipc-handlers';

// Application Menu
import './menu';

// Prepare the renderer once the app is ready
app.on('ready', async () => {
  await prepareNext('./renderer');

  const mainWindow = new BrowserWindow({
    fullscreenable: false,
    width: 1024,
    height: 768,
    icon: 'resources/hub.ico',
    autoHideMenuBar: true,
    resizable: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: join(__dirname, 'preload.js'),
    },
  });

  mainWindow.loadURL(
    isDev
      ? 'http://localhost:8000/' // dev
      : `file://${join(__dirname, '../renderer/out/index.html')}` //prod
  );
});

// Quit the app once all windows are closed
app.on('window-all-closed', app.quit);
