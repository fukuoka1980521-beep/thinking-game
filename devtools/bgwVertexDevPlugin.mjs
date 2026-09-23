// PHASE 12.1: Vite plugin, DEV-SERVER-ONLY (`apply: "serve"` -- never runs during `vite build`,
// never bundled into client JS). Mounts POST /api/bgw-npc-dialogue, the ONLY thing the browser
// ever talks to (src/research/bounded-generative-world/liveAdapterClient.ts). The bearer token
// obtained inside getLiveNpcDialogueEnvelope() lives only in this Node process and is never
// included in the response sent back to the browser.
// PHASE 33 (review finding): guarded by devServerGuard.mjs -- non-local Origin, non-JSON
// Content-Type, and oversized bodies are rejected before this ever reaches a billed Vertex call.
import { getLiveNpcDialogueEnvelope } from "./bgwVertexLiveAdapterCore.mjs";
import { guardDevApiRequest, readJsonBody } from "./devServerGuard.mjs";

/** @returns {import("vite").Plugin} */
export function bgwVertexDevPlugin() {
  return {
    name: "bgw-vertex-dev-plugin",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use("/api/bgw-npc-dialogue", async (req, res) => {
        if (!guardDevApiRequest(req, res)) return;
        const body = await readJsonBody(req, res);
        if (body === undefined) return;
        try {
          const packet = JSON.parse(body);
          const { envelope, raw } = await getLiveNpcDialogueEnvelope(packet);
          if (!envelope) {
            // Server-side-only diagnostic log -- never sent to the browser (no credential/raw
            // provider payload is ever included in the HTTP response below).
            console.error("[bgw-vertex-dev] envelope was null. raw.ok=", raw?.ok, "httpStatus=", raw?.httpStatus, "finishReason=", raw?.finishReason, "text=", raw?.text);
          }
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(envelope ?? {}));
        } catch (err) {
          console.error("[bgw-vertex-dev] request failed:", err);
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          // Never leak the raw error/credential state to the browser -- a generic failure shape
          // only; the client's own validateEnvelope() fails this closed to INSUFFICIENT_CONTEXT.
          res.end(JSON.stringify({ error: "bgw_live_adapter_failed" }));
        }
      });
    },
  };
}
