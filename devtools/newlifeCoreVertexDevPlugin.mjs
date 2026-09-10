// NEW LIFE CORE REDESIGN V1 -- Vite plugin, DEV-SERVER-ONLY (`apply: "serve"`, never bundled into
// client JS). Mounts POST /api/newlifecore-npc-dialogue. Sibling to (not a modification of)
// devtools/bgwVertexDevPlugin.mjs.
import { getLiveNpcReply } from "./newlifeCoreVertexLiveAdapterCore.mjs";

export function newlifeCoreVertexDevPlugin() {
  return {
    name: "newlifecore-vertex-dev-plugin",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use("/api/newlifecore-npc-dialogue", async (req, res) => {
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.end();
          return;
        }
        let body = "";
        req.on("data", (chunk) => (body += chunk));
        req.on("end", async () => {
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
      });
    },
  };
}
