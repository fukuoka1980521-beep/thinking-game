// Shared dev-server-only request guard for devtools/bgwVertexDevPlugin.mjs and
// devtools/newlifeCoreVertexDevPlugin.mjs. Both mount a POST endpoint that ends up calling a
// real, billed Vertex AI generateContent call using the developer's own `gcloud auth
// print-access-token` -- with no auth of their own, the only thing standing between "page open
// in the developer's browser while `npm run dev` is running" and an attacker-triggered billed
// generation is this guard. Never imported from client code (this file only runs in the Vite
// dev server's Node process, same as its callers).
const MAX_BODY_BYTES = 64 * 1024; // dialogue payloads here are a few KB at most

function isLocalOrigin(origin) {
  // No Origin header at all (same-origin navigations, curl, vite's own client) -- allow.
  // A cross-origin browser request always sets Origin, so this does not weaken the check below.
  if (!origin) return true;
  try {
    const { hostname } = new URL(origin);
    return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
  } catch {
    return false;
  }
}

/**
 * Rejects the request and returns false unless it is a local-origin, JSON-declared POST.
 * Requiring `Content-Type: application/json` also forces cross-origin requests through a CORS
 * preflight, which this server never answers with an `Access-Control-Allow-Origin` header --
 * so a cross-origin page cannot reach this handler even by spoofing an Origin header the
 * server-side check above would otherwise accept.
 * @returns {boolean}
 */
export function guardDevApiRequest(req, res) {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.end();
    return false;
  }
  if (!isLocalOrigin(req.headers.origin)) {
    res.statusCode = 403;
    res.end();
    return false;
  }
  const contentType = req.headers["content-type"] ?? "";
  if (!contentType.toLowerCase().startsWith("application/json")) {
    res.statusCode = 415;
    res.end();
    return false;
  }
  return true;
}

/**
 * Reads the request body up to a fixed byte cap, ending the response with 413 and returning
 * undefined if the cap is exceeded. Resolves to undefined (never throws) on stream error.
 * @returns {Promise<string | undefined>}
 */
export function readJsonBody(req, res, maxBytes = MAX_BODY_BYTES) {
  return new Promise((resolve) => {
    let body = "";
    let bytes = 0;
    let settled = false;
    const finish = (value) => {
      if (settled) return;
      settled = true;
      resolve(value);
    };
    req.on("data", (chunk) => {
      if (settled) return;
      bytes += chunk.length;
      if (bytes > maxBytes) {
        res.statusCode = 413;
        res.end();
        req.destroy();
        finish(undefined);
        return;
      }
      body += chunk;
    });
    req.on("end", () => finish(body));
    req.on("error", () => finish(undefined));
  });
}
