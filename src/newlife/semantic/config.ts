/**
 * Phase 30 serverless semantic runtime — endpoint configuration.
 *
 * Mirrors `src/lib/aiDialogueClient.ts`'s `DIALOGUE_ENDPOINT_URL` pattern
 * exactly: left empty until `functions/newlife-dialogue/` is actually
 * deployed (an Owner-only GCP billing/API-enablement prerequisite, see
 * `functions/newlife-dialogue/README.md`). `resolveFreeText`
 * (`coordinator.ts`) checks this before ever attempting a network call or
 * showing the NEW LIFE-specific consent prompt, so an empty value means
 * zero behavior change from the Phase 27/28/28B deterministic router that
 * currently ships behind `?newlife30=1`.
 */
export const NEWLIFE_DIALOGUE_ENDPOINT_URL = "";
