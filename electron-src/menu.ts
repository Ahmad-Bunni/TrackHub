import { Menu, MenuItemConstructorOptions } from 'electron';

const template: MenuItemConstructorOptions[] = [
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

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);
