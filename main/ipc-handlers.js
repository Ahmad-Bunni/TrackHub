"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const electron_1 = require("electron");
const prisma = new client_1.PrismaClient();
electron_1.ipcMain.on('add', async (event, item) => {
    await prisma.item.create({ data: { name: item } });
    event.sender.send('listed', await getItems());
});
electron_1.ipcMain.on('list', async (event) => {
    event.sender.send('listed', await getItems());
});
electron_1.ipcMain.on('search', async (event, item) => {
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
