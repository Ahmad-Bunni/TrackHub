"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const template = [
    {
        label: 'Menu',
        submenu: [
            {
                label: 'Exit',
                role: 'quit',
            },
        ],
    },
];
const menu = electron_1.Menu.buildFromTemplate(template);
electron_1.Menu.setApplicationMenu(menu);
