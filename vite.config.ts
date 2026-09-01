/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// GitHub Pages serves this project from https://<user>.github.io/thinking-game/,
// so production builds need that subpath as the base. Dev/test stay at "/".
export default defineConfig(({ command }) => ({
  base: command === "build" ? "/thinking-game/" : "/",
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    globals: true,
  },
}));
