import type { Item, ItemTag } from '@prisma/client';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { ipcMain } from 'electron';

type ItemWithTags = Item & { tags: ItemTag[] };

type SearchParams = {
  name?: string | null;
  date?: Date | number | string | null;
  tagId?: number | null;
};

const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' });
const prisma = new PrismaClient({ adapter });

async function queryItems(params?: SearchParams): Promise<ItemWithTags[]> {
  const { name, date, tagId } = params || {};
  const where: Record<string, unknown> = {};

  if (name) where.name = { startsWith: name };
  if (tagId) where.tags = { some: { tagId } };
  if (date) {
    const d = new Date(date as Date | string);
    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    where.date = { gte: start, lt: end };
  }

  return prisma.item.findMany({
    where,
    include: { tags: true },
  });
}

ipcMain.on('addItem', async (event, { name, tagIds, search }: { name: string; tagIds?: number[]; search?: SearchParams }) => {
  try {
    await prisma.item.create({
      data: {
        name: name.trim(),
        tags: tagIds?.length
          ? { create: tagIds.map(tagId => ({ tag: { connect: { id: tagId } } })) }
          : undefined,
      },
    });
    event.sender.send('listed', await queryItems(search));
  } catch (error) {
    sendError(event, error);
  }
});

ipcMain.on('update', async (event, id: number, note?: string, search?: SearchParams) => {
  try {
    await prisma.item.update({ where: { id }, data: { note: note?.trim() } });
    event.sender.send('listed', await queryItems(search));
  } catch (error) {
    sendError(event, error);
  }
});

ipcMain.on('remove', async (event, id: number, search?: SearchParams) => {
  try {
    await prisma.item.delete({ where: { id } });
    event.sender.send('listed', await queryItems(search));
  } catch (error) {
    sendError(event, error);
  }
});

ipcMain.on('list', async (event) => {
  try { event.sender.send('listed', await queryItems()); }
  catch (error) { sendError(event, error); }
});

ipcMain.on('search', async (event, name: string | null) => {
  try { event.sender.send('listed', await queryItems({ name: name || undefined })); }
  catch (error) { sendError(event, error); }
});

ipcMain.on('searchWithDate', async (event, payload: SearchParams) => {
  try {
    event.sender.send('listed', await queryItems(payload));
  } catch (error) {
    sendError(event, error);
  }
});

ipcMain.on('getAllTags', async (event) => {
  try { event.sender.send('tagsListed', await prisma.tag.findMany({ where: {} })); }
  catch (error) { sendError(event, error); }
});

ipcMain.on('createTag', async (event, payload: { name: string; color: string }) => {
  try {
    await prisma.tag.create({ data: { name: payload.name.trim(), color: payload.color } });
    event.sender.send('tagsListed', await prisma.tag.findMany({ where: {} }));
  } catch (error) {
    sendError(event, error);
  }
});

ipcMain.on('updateItemTags', async (event, id: number, tagIds: number[], search?: SearchParams) => {
  try {
    await prisma.item.update({
      where: { id },
      data: {
        tags: {
          deleteMany: {},
          create: tagIds.map(tagId => ({ tag: { connect: { id: tagId } } })),
        },
      },
    });
    event.sender.send('listed', await queryItems(search));
  } catch (error) {
    sendError(event, error);
  }
});

ipcMain.on('deleteTag', async (event, tagId: number, search?: SearchParams) => {
  try {
    await prisma.tag.delete({ where: { id: tagId } });
    event.sender.send('tagsListed', await prisma.tag.findMany({ where: {} }));
    const filteredSearch = search?.tagId === tagId
      ? { ...search, tagId: undefined }
      : search;
    event.sender.send('listed', await queryItems(filteredSearch));
  } catch (error) {
    sendError(event, error);
  }
});

ipcMain.on('rendererError', (_event, errorData: { message: string; stack: string }) => {
  console.error('🔴 [Renderer]', errorData.message);
  if (errorData.stack) console.error(errorData.stack);
});

function sendError(event: Electron.IpcMainEvent, error: unknown) {
  event.sender.send('error', { message: error instanceof Error ? error.message : String(error) });
}
