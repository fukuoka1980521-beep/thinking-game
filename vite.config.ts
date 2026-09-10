/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// devtools/bgwVertexDevPlugin.mjs is a plain-JS, dev-server-only module (never bundled into the
// client) -- untyped by design rather than adding a repo-wide allowJs/checkJs setting.
// @ts-expect-error -- untyped plain-JS dev-only module, see comment above
import { bgwVertexDevPlugin } from "./devtools/bgwVertexDevPlugin.mjs";

// GitHub Pages serves this project from https://<user>.github.io/thinking-game/,
// so production builds need that subpath as the base. Dev/test stay at "/".
//
// PHASE 12.1: `bgwVertexDevPlugin` is `apply: "serve"` -- it never runs during `vite build` and
// its Node-only module (devtools/bgwVertexLiveAdapterCore.mjs) is never bundled into client JS.
// See docs/research/evaluation/phase-12-0/LIVE_VERTEX_LOCAL_ADAPTER_DESIGN_V1.md.
export default defineConfig(({ command }) => ({
  base: command === "build" ? "/thinking-game/" : "/",
  plugins: [react(), bgwVertexDevPlugin()],
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    globals: true,
  },
}));
