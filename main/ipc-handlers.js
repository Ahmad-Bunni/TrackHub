"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initDatabase = initDatabase;
const client_1 = require("@prisma/client");
const adapter_better_sqlite3_1 = require("@prisma/adapter-better-sqlite3");
const electron_1 = require("electron");
const fs_1 = require("fs");
const path_1 = require("path");
/** Toggle verbose query tracing — set DEBUG=true in env to enable. */
const DEBUG = process.env.DEBUG === 'true';
const log = (...args) => DEBUG && console.log(...args);
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
    let items = await getPrisma().item.findMany({
        where: Object.keys(where).length > 0 ? where : undefined,
        include: { tags: true },
    });
    log(`[queryItems] total items=${items.length} name=${JSON.stringify(name)} date=${JSON.stringify(date)} dateType=${typeof date} tagId=${tagId}`);
    // Trace: show first 3 item dates
    for (let i = 0; i < Math.min(3, items.length); i++) {
        const it = items[i];
        const d = new Date(it.date);
        log(`[queryItems] item[${i}] date=${it.date} parsed=${d.toISOString()} local=${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
    }
    // Filter by date in JS using local date string matching (avoids timezone issues)
    if (date) {
        const d = date instanceof Date ? date : new Date(date);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const localDateStr = `${yyyy}-${mm}-${dd}`;
        log(`[queryItems] filtering by date=${localDateStr} (raw=${JSON.stringify(date)}, parsed=${d.toISOString()})`);
        items = items.filter((item) => {
            const itemDate = new Date(item.date);
            const itemYyyy = itemDate.getFullYear();
            const itemMm = String(itemDate.getMonth() + 1).padStart(2, '0');
            const itemDd = String(itemDate.getDate()).padStart(2, '0');
            const itemDateStr = `${itemYyyy}-${itemMm}-${itemDd}`;
            return itemDateStr === localDateStr;
        });
        log(`[queryItems] after date filter: ${items.length} items`);
    }
    return items;
}
electron_1.ipcMain.handle('addItem', async (_event, { name, tagIds, search }) => {
    try {
        log(`[addItem] name=${JSON.stringify(name.trim())} tagIds=${JSON.stringify(tagIds)}`);
        const before = search ? await queryItems(search) : [];
        await getPrisma().item.create({
            data: {
                name: name.trim(),
                tags: tagIds?.length
                    ? { create: tagIds.map(tagId => ({ tag: { connect: { id: tagId } } })) }
                    : undefined,
            },
        });
        const after = search ? await queryItems(search) : [];
        log(`[addItem] created (before=${before.length} → after=${after.length})`);
        return after;
    }
    catch (error) {
        throw error;
    }
});
electron_1.ipcMain.handle('update', async (_event, id, note, search) => {
    try {
        log(`[update] id=${id} note=${JSON.stringify(note)}`);
        const before = search ? await queryItems(search) : [];
        await getPrisma().item.update({ where: { id }, data: { note: note?.trim() } });
        const after = search ? await queryItems(search) : [];
        log(`[update] done (before=${before.length} → after=${after.length})`);
        return after;
    }
    catch (error) {
        throw error;
    }
});
electron_1.ipcMain.handle('remove', async (_event, id, search) => {
    try {
        log(`[remove] id=${id}`);
        const before = search ? await queryItems(search) : [];
        await getPrisma().item.delete({ where: { id } });
        const after = search ? await queryItems(search) : [];
        log(`[remove] deleted (before=${before.length} → after=${after.length})`);
        return after;
    }
    catch (error) {
        throw error;
    }
});
electron_1.ipcMain.handle('list', async (_event) => {
    try {
        log('[list] called');
        const items = await queryItems();
        log(`[list] returned ${items.length} items`);
        return items;
    }
    catch (error) {
        throw error;
    }
});
electron_1.ipcMain.handle('search', async (_event, name) => {
    try {
        log(`[search] name=${JSON.stringify(name)}`);
        const items = await queryItems({ name: name || undefined });
        log(`[search] returned ${items.length} items`);
        return items;
    }
    catch (error) {
        throw error;
    }
});
electron_1.ipcMain.handle('searchWithDate', async (_event, payload) => {
    try {
        log(`[searchWithDate] name=${JSON.stringify(payload.name)} tagId=${payload.tagId}`);
        const items = await queryItems(payload);
        if (payload.date) {
            const d = payload.date instanceof Date ? payload.date : new Date(payload.date);
            const localDateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            log(`[searchWithDate] date=${localDateStr} → ${items.length} matched`);
        }
        log(`[searchWithDate] returned ${items.length} items`);
        return items;
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
        log(`[updateItemTags] id=${id} tagIds=${JSON.stringify(tagIds)}`);
        const before = search ? await queryItems(search) : [];
        await getPrisma().item.update({
            where: { id },
            data: {
                tags: {
                    deleteMany: {},
                    create: tagIds.map(tagId => ({ tag: { connect: { id: tagId } } })),
                },
            },
        });
        const after = search ? await queryItems(search) : [];
        log(`[updateItemTags] done (before=${before.length} → after=${after.length})`);
        return after;
    }
    catch (error) {
        throw error;
    }
});
electron_1.ipcMain.handle('deleteTag', async (_event, tagId, search) => {
    try {
        log(`[deleteTag] tagId=${tagId} searchTagId=${search?.tagId}`);
        await getPrisma().tag.delete({ where: { id: tagId } });
        const tags = await getPrisma().tag.findMany({ where: {} });
        const filteredSearch = search?.tagId === tagId
            ? { ...search, tagId: undefined }
            : search;
        const items = await queryItems(filteredSearch);
        log(`[deleteTag] tags=${tags.length} items=${items.length}`);
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
