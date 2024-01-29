"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const electron_1 = require("electron");
const prisma = new client_1.PrismaClient();
electron_1.ipcMain.on('add', async (event, name) => {
    try {
        await prisma.item.create({ data: { name: name.trim() } });
        event.sender.send('listed', await getItems());
    }
    catch (error) {
        event.sender.send('error', error);
    }
});
electron_1.ipcMain.on('update', async (event, id, note) => {
    try {
        await prisma.item.update({
            where: { id: id },
            data: { note: note?.trim() },
        });
        event.sender.send('listed', await getItems());
    }
    catch (error) {
        event.sender.send('error', error);
    }
});
electron_1.ipcMain.on('remove', async (event, id) => {
    try {
        await prisma.item.delete({
            where: {
                id,
            },
        });
        event.sender.send('listed', await getItems());
    }
    catch (error) {
        event.sender.send('error', error);
    }
});
electron_1.ipcMain.on('list', async (event) => {
    try {
        event.sender.send('listed', await getItems());
    }
    catch (error) {
        event.sender.send('error', error);
    }
});
electron_1.ipcMain.on('search', async (event, name) => {
    try {
        event.sender.send('listed', await getItems(name));
    }
    catch (error) {
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
