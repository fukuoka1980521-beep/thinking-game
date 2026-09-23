// NEW LIFE CORE REDESIGN V1 -- Vite plugin, DEV-SERVER-ONLY (`apply: "serve"`, never bundled into
// client JS). Mounts POST /api/newlifecore-npc-dialogue. Sibling to (not a modification of)
// devtools/bgwVertexDevPlugin.mjs.
// PHASE 33 (review finding): guarded by devServerGuard.mjs -- non-local Origin, non-JSON
// Content-Type, and oversized bodies are rejected before this ever reaches a billed Vertex call.
import { getLiveNpcReply } from "./newlifeCoreVertexLiveAdapterCore.mjs";
import { guardDevApiRequest, readJsonBody } from "./devServerGuard.mjs";

/** @returns {import("vite").Plugin} */
export function newlifeCoreVertexDevPlugin() {
  return {
    name: "newlifecore-vertex-dev-plugin",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use("/api/newlifecore-npc-dialogue", async (req, res) => {
        if (!guardDevApiRequest(req, res)) return;
        const body = await readJsonBody(req, res);
        if (body === undefined) return;
        try {
          const context = JSON.parse(body);
          const { reply, raw } = await getLiveNpcReply(context);
          if (!reply) {
            console.error("[newlifecore-vertex-dev] reply was null. raw.ok=", raw?.ok, "httpStatus=", raw?.httpStatus, "finishReason=", raw?.finishReason, "text=", raw?.text);
          }
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(reply ?? {}));
        } catch (err) {
          console.error("[newlifecore-vertex-dev] request failed:", err);
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: "newlifecore_live_adapter_failed" }));
        }
      });
    },
  };
}
