"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initDatabase = initDatabase;
const client_1 = require("@prisma/client");
const adapter_better_sqlite3_1 = require("@prisma/adapter-better-sqlite3");
const electron_1 = require("electron");
const fs_1 = require("fs");
const path_1 = require("path");
let prisma;
/** Packaged apps can't use ./dev.db cwd — store under userData. */
function initDatabase() {
    if (prisma)
        return;
    const dbPath = isDevDb()
        ? (0, path_1.join)(process.cwd(), 'dev.db')
        : (0, path_1.join)(electron_1.app.getPath('userData'), 'trackhub.db');
    (0, fs_1.mkdirSync)((0, path_1.dirname)(dbPath), { recursive: true });
    const url = `file:${dbPath.replace(/\\/g, '/')}`;
    const adapter = new adapter_better_sqlite3_1.PrismaBetterSqlite3({ url });
    prisma = new client_1.PrismaClient({ adapter });
}
function isDevDb() {
    return !electron_1.app.isPackaged;
}
function getPrisma() {
    if (!prisma)
        initDatabase();
    return prisma;
}
async function queryItems(params) {
    const { name, date, tagId } = params || {};
    const where = {};
    if (name)
        where.name = { startsWith: name };
    if (tagId)
        where.tags = { some: { tagId } };
    if (date) {
        const d = date instanceof Date ? date : new Date(date);
        const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        const end = new Date(start);
        end.setDate(end.getDate() + 1);
        where.date = { gte: start, lt: end };
    }
    return getPrisma().item.findMany({
        where,
        include: { tags: true },
    });
}
electron_1.ipcMain.handle('addItem', async (_event, { name, tagIds, search }) => {
    try {
        await getPrisma().item.create({
            data: {
                name: name.trim(),
                tags: tagIds?.length
                    ? { create: tagIds.map(tagId => ({ tag: { connect: { id: tagId } } })) }
                    : undefined,
            },
        });
        return await queryItems(search);
    }
    catch (error) {
        throw error;
    }
});
electron_1.ipcMain.handle('update', async (_event, id, note, search) => {
    try {
        await getPrisma().item.update({ where: { id }, data: { note: note?.trim() } });
        return await queryItems(search);
    }
    catch (error) {
        throw error;
    }
});
electron_1.ipcMain.handle('remove', async (_event, id, search) => {
    try {
        await getPrisma().item.delete({ where: { id } });
        return await queryItems(search);
    }
    catch (error) {
        throw error;
    }
});
electron_1.ipcMain.handle('list', async (_event) => {
    try {
        return await queryItems();
    }
    catch (error) {
        throw error;
    }
});
electron_1.ipcMain.handle('search', async (_event, name) => {
    try {
        return await queryItems({ name: name || undefined });
    }
    catch (error) {
        throw error;
    }
});
electron_1.ipcMain.handle('searchWithDate', async (_event, payload) => {
    try {
        return await queryItems(payload);
    }
    catch (error) {
        throw error;
    }
});
electron_1.ipcMain.handle('getAllTags', async (_event) => {
    try {
        return await getPrisma().tag.findMany({ where: {} });
    }
    catch (error) {
        throw error;
    }
});
electron_1.ipcMain.handle('createTag', async (_event, payload) => {
    try {
        await getPrisma().tag.create({ data: { name: payload.name.trim(), color: payload.color } });
        return await getPrisma().tag.findMany({ where: {} });
    }
    catch (error) {
        throw error;
    }
});
electron_1.ipcMain.handle('updateItemTags', async (_event, id, tagIds, search) => {
    try {
        await getPrisma().item.update({
            where: { id },
            data: {
                tags: {
                    deleteMany: {},
                    create: tagIds.map(tagId => ({ tag: { connect: { id: tagId } } })),
                },
            },
        });
        return await queryItems(search);
    }
    catch (error) {
        throw error;
    }
});
electron_1.ipcMain.handle('deleteTag', async (_event, tagId, search) => {
    try {
        await getPrisma().tag.delete({ where: { id: tagId } });
        const tags = await getPrisma().tag.findMany({ where: {} });
        const filteredSearch = search?.tagId === tagId
            ? { ...search, tagId: undefined }
            : search;
        const items = await queryItems(filteredSearch);
        return { tags, items };
    }
    catch (error) {
        throw error;
    }
});
electron_1.ipcMain.on('rendererError', (_event, errorData) => {
    console.error('🔴 [Renderer]', errorData.message);
    if (errorData.stack)
        console.error(errorData.stack);
});
