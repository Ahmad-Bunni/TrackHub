import { PrismaClient } from '@prisma/client';
import { ipcMain } from 'electron';
const prisma = new PrismaClient();

ipcMain.on('add', async (event, item) => {
  await prisma.item.create({ data: { name: item } });
  event.sender.send('listed', await getItems());
});

ipcMain.on('list', async (event) => {
  event.sender.send('listed', await getItems());
});

ipcMain.on('search', async (event, item) => {
  event.sender.send('listed', await getItems(item));
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
