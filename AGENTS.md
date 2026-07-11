# TrackHub — Agent Protocol

**Role:** Full-stack engineer. **Done:** user flow works in `bun run dev` with correct data.  
Not done: types pass, build passes, files edited.

Read this every task. Follow in order.

---

## What you did poorly here — never repeat

- **Half-built features** — UI sent fields handlers never read. Grep `renderer/` + `electron-src/` together.
- **Wrong data shape** — UI read relations DB never returned. If UI reads nested data → every query path must fetch it.
- **Hidden type errors** — `as any` on Prisma writes. Fix shape. Never suppress.
- **Truthy traps** — `[]` is truthy. Use `.length` / `?.` for empty checks.
- **Racing replies** — mutation + extra search in parallel. **One write → one handler reply.**
- **Stale views** — mutations returned unfiltered data while filters were active. Reply must respect current state.
- **Incomplete deletes** — removed entity, left store filters/selections pointing at dead IDs. Clean dependents + refetch list.
- **UI/store mismatch** — multi-select UI, store held one ID. Match semantics before copying patterns.
- **Listener sprawl** — `startListening` in row components. **One listener per event in `index.tsx` only.**
- **Edits that never ran** — changed `electron-src/`, skipped `bun run build-electron`. Electron runs `main/`, not source.

---

## Chain (fix boundaries, not symptoms)

```
UI → electron API → preload → ipc-handlers → Prisma → reply → listener → store → UI
```

Before coding: one-line chain. Can't write it? Read more. **Do not edit yet.**

---

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

---

## When stuck — do not guess

1. Grep codebase → read `electron-src/ipc-handlers.ts` (source of truth for backend)
2. **Web search official docs** — Prisma nested writes, Electron IPC, library version in `package.json`
3. One hypothesis → one file → confirm or next

**You must web search** when: Prisma/type error you don't know, unfamiliar API, error message unclear, version behavior uncertain.  
Never invent flags, methods, or config.

---

## Close-out (paste in final message)

```
FLOW:
CHAIN:
SEND / RECEIVE / CONTEXT:

[ ] Caller ↔ handler fields match (grep)
[ ] Reply shape = what UI reads (all query paths)
[ ] No as any · types only in global.d.ts
[ ] One reply per mutation · no stacked refetch
[ ] Deletes clear store dependents
[ ] build-electron if electron-src touched
[ ] validate + dev flow tested
```

Unchecked = **not done.**

---

## Map

`electron-src/` → edit · `main/` → runs · `renderer/` → UI · `global.d.ts` → types · `prisma/` → schema

```bash
bun run dev · bun run build-electron · bun run validate
```

Errors: `🔴 [Renderer]` in terminal. Vite port **5173**.

**Scope:** smallest fix · no workaround stacks · no commit/tests unless asked.
