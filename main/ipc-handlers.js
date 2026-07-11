"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const adapter_better_sqlite3_1 = require("@prisma/adapter-better-sqlite3");
const electron_1 = require("electron");
const adapter = new adapter_better_sqlite3_1.PrismaBetterSqlite3({ url: 'file:./dev.db' });
const prisma = new client_1.PrismaClient({ adapter });
async function queryItems(params) {
    const { name, date, tagId } = params || {};
    const where = {};
    if (name)
        where.name = { startsWith: name };
    if (tagId)
        where.tags = { some: { tagId } };
    if (date) {
        const d = new Date(date);
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
electron_1.ipcMain.on('addItem', async (event, { name, tagIds, search }) => {
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
    }
    catch (error) {
        sendError(event, error);
    }
});
electron_1.ipcMain.on('update', async (event, id, note, search) => {
    try {
        await prisma.item.update({ where: { id }, data: { note: note?.trim() } });
        event.sender.send('listed', await queryItems(search));
    }
    catch (error) {
        sendError(event, error);
    }
});
electron_1.ipcMain.on('remove', async (event, id, search) => {
    try {
        await prisma.item.delete({ where: { id } });
        event.sender.send('listed', await queryItems(search));
    }
    catch (error) {
        sendError(event, error);
    }
});
electron_1.ipcMain.on('list', async (event) => {
    try {
        event.sender.send('listed', await queryItems());
    }
    catch (error) {
        sendError(event, error);
    }
});
electron_1.ipcMain.on('search', async (event, name) => {
    try {
        event.sender.send('listed', await queryItems({ name: name || undefined }));
    }
    catch (error) {
        sendError(event, error);
    }
});
electron_1.ipcMain.on('searchWithDate', async (event, payload) => {
    try {
        event.sender.send('listed', await queryItems(payload));
    }
    catch (error) {
        sendError(event, error);
    }
});
electron_1.ipcMain.on('getAllTags', async (event) => {
    try {
        event.sender.send('tagsListed', await prisma.tag.findMany({ where: {} }));
    }
    catch (error) {
        sendError(event, error);
    }
});
electron_1.ipcMain.on('createTag', async (event, payload) => {
    try {
        await prisma.tag.create({ data: { name: payload.name.trim(), color: payload.color } });
        event.sender.send('tagsListed', await prisma.tag.findMany({ where: {} }));
    }
    catch (error) {
        sendError(event, error);
    }
});
electron_1.ipcMain.on('updateItemTags', async (event, id, tagIds, search) => {
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
    }
    catch (error) {
        sendError(event, error);
    }
});
electron_1.ipcMain.on('deleteTag', async (event, tagId, search) => {
    try {
        await prisma.tag.delete({ where: { id: tagId } });
        event.sender.send('tagsListed', await prisma.tag.findMany({ where: {} }));
        const filteredSearch = search?.tagId === tagId
            ? { ...search, tagId: undefined }
            : search;
        event.sender.send('listed', await queryItems(filteredSearch));
    }
    catch (error) {
        sendError(event, error);
    }
});
electron_1.ipcMain.on('rendererError', (_event, errorData) => {
    console.error('🔴 [Renderer]', errorData.message);
    if (errorData.stack)
        console.error(errorData.stack);
});
function sendError(event, error) {
    event.sender.send('error', { message: error instanceof Error ? error.message : String(error) });
}
