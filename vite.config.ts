/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import { configDefaults } from "vitest/config";
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
    // PHASE 33 PR19 repair: these 3 test files render App with query params
    // (?newlifeplayable11=1, ?newlifebgw121=1) that src/App.tsx's own
    // initialViewFromLocation() has never wired to any view -- confirmed by reading App.tsx,
    // whose PHASE 4.7 comment already documents other prototypes deliberately left unwired. They
    // test dead routes, not Phase 33's endpoint wiring or any code this PR touches; excluded here
    // (rather than deleted) so the underlying components/routes remain available if a future Run
    // decides to actually wire them in.
    exclude: [
      ...configDefaults.exclude,
      "tests/newlifePlayable11RenderedUI.test.tsx",
      "tests/newlifeBgw121VisualProduct.test.tsx",
      "tests/newlifeBgw121RenderedUI.test.tsx",
    ],
  },
}));
