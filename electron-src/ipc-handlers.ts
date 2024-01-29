import { PrismaClient } from '@prisma/client';
import { ipcMain } from 'electron';
const prisma = new PrismaClient();

ipcMain.on('add', async (event, name) => {
  try {
    await prisma.item.create({ data: { name } });
    event.sender.send('listed', await getItems());
  } catch (error) {
    event.sender.send('error', error);
  }
});

ipcMain.on('remove', async (event, id) => {
  try {
    await prisma.item.delete({
      where: {
        id,
      },
    });
    event.sender.send('listed', await getItems());
  } catch (error) {
    event.sender.send('error', error);
  }
});

ipcMain.on('list', async (event) => {
  try {
    event.sender.send('listed', await getItems());
  } catch (error) {
    event.sender.send('error', error);
  }
});

ipcMain.on('search', async (event, name) => {
  try {
    event.sender.send('listed', await getItems(name));
  } catch (error) {
    event.sender.send('error', error);
  }
});

async function getItems(searchQuery = '') {
  if (searchQuery) {
    return prisma.item.findMany({
      where: {
        name: {
          startsWith: searchQuery,
        },
      },
    });
  }
  return prisma.item.findMany();
}
