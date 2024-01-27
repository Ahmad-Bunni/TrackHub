// Native
import { PrismaClient } from '@prisma/client';
import { join } from 'path';
import { format } from 'url';

const prisma = new PrismaClient();
// Packages
import { BrowserWindow, app, ipcMain } from 'electron';
import isDev from 'electron-is-dev';
import prepareNext from 'electron-next';

// Prepare the renderer once the app is ready
app.on('ready', async () => {
  await prepareNext('./renderer');

  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: join(__dirname, 'preload.js'),
    },
  });

  const url = isDev
    ? 'http://localhost:8000/'
    : format({
        pathname: join(__dirname, '../renderer/out/index.html'),
        protocol: 'file:',
        slashes: true,
      });

  mainWindow.loadURL(url);
});

// Quit the app once all windows are closed
app.on('window-all-closed', app.quit);

// IPC Handlers
ipcMain.on('add', async (event, item) => {
  await prisma.item.create({
    data: {
      name: item,
    },
  });

  // Use the shared function to get items
  const items = await getItems();
  event.sender.send('listed', items);
});

ipcMain.on('list', async (event) => {
  // Use the shared function to get items
  const items = await getItems();
  event.sender.send('listed', items);
});

async function getItems() {
  return await prisma.item.findMany();
}
