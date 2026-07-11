import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  server: { port: 5173 },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "renderer"),
    },
  },
  build: {
    outDir: "./renderer/out",
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(__dirname, "index.html"),
    },
  },
});
