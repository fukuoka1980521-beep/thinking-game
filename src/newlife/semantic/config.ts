/**
 * Phase 30 serverless semantic runtime — endpoint configuration.
 *
 * PHASE 33: ACTIVE. `functions/newlife-dialogue/` is deployed (asia-northeast1, project
 * `gas-test-runner-20260620-wjxf`) and this constant now points at it. `resolveFreeText`
 * (`coordinator.ts`) still checks this before ever attempting a network call or showing the
 * NEW LIFE-specific consent prompt, and still requires that consent (opt-in key
 * `thinking-game:newlife-ai-dialogue-consent:v1`) before any request is sent — but for a
 * player who consents, an ambiguous free-talk turn now does reach this endpoint. Declining, or
 * an unambiguous turn, keeps the unchanged Phase 27/28/28B deterministic router. See
 * `docs/DATA_BOUNDARY.md` for the disclosed payload shape and `README.md` under
 * `functions/newlife-dialogue/` for the deploy path (mirrors `src/lib/aiDialogueClient.ts`'s
 * `DIALOGUE_ENDPOINT_URL` pattern). Clearing this constant back to `""` reverts to the fully
 * local, no-network behavior.
 */
export const NEWLIFE_DIALOGUE_ENDPOINT_URL = "https://newlife-dialogue-zqtk74q2ra-an.a.run.app";
