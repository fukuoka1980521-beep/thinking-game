# Live Vertex Local Adapter Design V1 — PHASE 12.0

Directive Section 16-17. Critical constraint: **no OAuth token / API credential in browser
JavaScript.** No implementation this phase (Section 26) — design plus an honest feasibility
assessment grounded in evidence this repository already has, not a fresh spike.

## Existing evidence (reused, not re-derived)

1. **A real, live, billed Vertex AI path already exists and was already proven end-to-end**:
   `docs/research/evaluation/phase-11-9/direct_vertex_probe.json` — a direct HTTPS POST to
   `https://asia-northeast1-aiplatform.googleapis.com/v1/projects/gas-test-runner-20260620-wjxf/locations/asia-northeast1/publishers/google/models/gemini-2.5-flash:generateContent`,
   authenticated via `gcloud auth print-access-token` using the existing local user identity — NOT
   a stored service-account key file. Result: `DIRECT_VERTEX_RESEARCH_PATH = PASS`, real Japanese
   text received (`"ああ、暑いな。"`). Token was "held in-memory only for the duration of each call;
   never printed, logged, or persisted to any file" — already satisfies the "no credential in
   browser JS" requirement in spirit (the credential is not in ANY committed artifact, let alone
   browser JS).
2. **A load-bearing known bug, already documented, must be preserved in any new adapter**:
   `gemini-2.5-flash` at low `maxOutputTokens` (512) can consume its entire budget on internal
   "thinking" and return empty visible text (`finishReason: MAX_TOKENS`, `thoughtsTokenCount`
   near the cap). Fixed by raising `maxOutputTokens` to 2048 — used successfully for all 63
   subsequent PHASE 11.9 calls with zero further occurrences. Any PHASE 12.1 adapter MUST default
   `maxOutputTokens >= 2048` for this model.
3. **A second, already-deployed, ADC-authenticated Cloud Function exists**: `functions/dialogue/`
   (`gcloud functions describe dialogue --region=asia-northeast1
   --project=gas-test-runner-20260620-wjxf`), `state: ACTIVE`, calling the same
   `gemini-2.5-flash` via `@google/genai` with the function's own Application Default Credentials
   — proving the "browser → server-side proxy with ADC → Vertex" shape is not merely theoretical
   for this project; it is live, billed, and Owner-authorized infrastructure. It is currently
   hardcoded to an unrelated product surface (CASE-001's 5-persona reasoning-companion schema) and
   is explicitly NOT modified or redeployed this phase (redeploying live infra is a RELEASE-class
   action, out of scope for a design-only phase).

## Recommended architecture (design only)

```
Browser (Vite dev server, npm run dev)
  → fetch("/api/npc-dialogue", { method: "POST", body: <bounded packet> })
  → Vite dev-server middleware (configureServer plugin, DEV-ONLY, never in the built bundle)
      - obtains a short-lived bearer token server-side (gcloud ADC on the developer's own
        machine, same method direct_vertex_probe.json already proved works -- no new
        service-account key file needs to be created or committed)
      - performs the direct REST POST to the SAME generateContent endpoint already proven live,
        with maxOutputTokens >= 2048
      - returns a structured JSON response (classification + proposedStateEffect + visibleLine,
        per NG_RESPONSE_SEMANTICS_V1.md's shape) to the browser
  ← structured response, never a raw credential, never a raw provider response object
```

This is a genuinely LOCAL adapter (runs only inside the developer's own `npm run dev` process,
never deployed), deliberately separate from `functions/dialogue/` (which stays untouched,
production-track infrastructure). Reusing the SAME GCP project/model/region as the already-proven
probe, per directive Section 16's "reuse the existing Vertex AI environment where feasible."

## Why this satisfies "no credential in browser JS"

The bearer token is obtained and used entirely inside the Vite dev-server's Node process (server-
side), never serialized into any response sent to the browser, never present in any file the
client bundle includes. This is the same "compile-time/runtime boundary" discipline already
hard-won in PHASE 11.12 (`import.meta.env.DEV` literal call-site check, not a default parameter) —
here applied to a genuinely separate server-side process rather than a client-side dead-code
branch, which is a STRONGER guarantee (the credential-handling code is never even shipped to the
browser's JS bundle, not merely tree-shaken out of it).

## Honest feasibility statement (directive Section 16's "fail honestly" requirement)

**FEASIBLE, with one caveat stated plainly.** The credential-safety pattern and the underlying
Vertex call path are BOTH already proven working in this repository's own history (not assumed) —
that is the hardest part of "is this achievable at all," and it is already answered yes. What is
NOT yet proven is the NEW piece this phase's directive actually asks for: an actual running local
proxy process wired into the Vite dev server, invoked from live browser interaction rather than a
one-off Orchestrator-executed probe script. That wiring has not been built or tested.

**Why no fresh spike was attempted this phase**: this Claude Code session has no outbound network
access (confirmed by this project's own `ORCHESTRATED EXECUTION MODEL`, CLAUDE.md §16 — a real
network call to Vertex AI is exactly the class of action that must route through Orchestrator or
a human-executed step, not Code directly, matching how the original `direct_vertex_probe.json`
evidence was itself produced). Re-attempting the probe from inside this session would either fail
for an environment reason unrelated to the design's validity (misreported as "BLOCKED" when the
real blocker is sandboxing, not the architecture) or would require exactly the kind of
Orchestrator delegation Section 26 does not ask this phase to perform. **Building and test-running
the actual dev-server middleware is the correct PHASE 12.1 implementation task** (a "very small
spike" in the directive's own words is warranted THERE, at the point of actually needing it,
against a real running dev server this session can start and a real network call the environment's
Orchestrator/human execution path can make) — not fabricated here as already-done.

## Verdict

**LIVE AI PATH: FEASIBLE.** Grounded in real prior evidence, not optimism. The remaining work
(dev-server middleware wiring) is normal PHASE 12.1 implementation scope, not a research unknown.
