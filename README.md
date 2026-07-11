# TrackHub

## Setup & Run Locally

```bash
bun install            # first time only
bun dev                # starts Vite + Electron (dev mode, hot reload)
```

## Build / Ship

```bash
bun run dist           # production build → dist/TrackHub Setup.exe
bun run pack-app       # dir-only staging build (no code signing)
```

## DB Reset

```bash
rm dev.db && npx prisma db push   # start fresh
```
