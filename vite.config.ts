/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// devtools/bgwVertexDevPlugin.mjs (and its sibling below) are plain-JS, dev-server-only modules
// (never bundled into the client). tsconfig's repo-wide `allowJs` already lets tsc check them via
// their own JSDoc `@returns {import("vite").Plugin}` annotations -- no `@ts-expect-error` needed.
import { bgwVertexDevPlugin } from "./devtools/bgwVertexDevPlugin.mjs";
import { newlifeCoreVertexDevPlugin } from "./devtools/newlifeCoreVertexDevPlugin.mjs";

// GitHub Pages serves this project from https://<user>.github.io/thinking-game/,
// so production builds need that subpath as the base. Dev/test stay at "/".
//
// PHASE 12.1: `bgwVertexDevPlugin` is `apply: "serve"` -- it never runs during `vite build` and
// its Node-only module (devtools/bgwVertexLiveAdapterCore.mjs) is never bundled into client JS.
// See docs/research/evaluation/phase-12-0/LIVE_VERTEX_LOCAL_ADAPTER_DESIGN_V1.md.
export default defineConfig(({ command }) => ({
  base: command === "build" ? "/thinking-game/" : "/",
  plugins: [react(), bgwVertexDevPlugin(), newlifeCoreVertexDevPlugin()],
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    globals: true,
  },
}));
