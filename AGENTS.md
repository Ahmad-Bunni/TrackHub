# TrackHub — Agent Protocol

## Work order

| Step | Action |
|------|--------|
| 1 | Flow in one sentence. Grep method both sides. |
| 2 | Contract: `SEND` / `RECEIVE shape` / `CONTEXT filters`. Caller fields must appear in handler. |
| 3 | DB → IPC (handler, preload, `global.d.ts`, caller) → `build-electron` → UI |
| 4 | `validate` → `dev` → run the flow yourself |

**IPC:** same channel, args, order in all four files.  
**Types:** `global.d.ts` only. No duplicates.  
**State:** scalar in store = replace. Collection = toggle. One owner.

**IPC Communication Pattern:**
- All IPC handlers in `electron-src/ipc-handlers.ts` must use `ipcMain.handle` instead of `ipcMain.on`
- All IPC calls in `electron-src/preload.ts` that need to return data must use `ipcRenderer.invoke` instead of `ipcRenderer.send`
- One-way communication (like error logging) can continue to use `ipcMain.on`/`ipcRenderer.send`

**Component Best Practices:**
- Toast components should use `description` parameter instead of invalid `type: 'success'` parameter
- All IPC calls should properly handle errors and return meaningful data
- Database initialization functions should be properly ordered to avoid reference issues

---

## Map

`electron-src/` → edit · `main/` → runs · `renderer/` → UI · `global.d.ts` → types · `prisma/` → schema

```bash
bun run dev · bun run build-electron · bun run validate
```

Errors: `🔴 [Renderer]` in terminal. Vite port **5173**.

**Scope:** smallest fix · no workaround stacks · no commit/tests unless asked.
