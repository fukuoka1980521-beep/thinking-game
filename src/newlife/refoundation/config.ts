/**
 * NEW LIFE refoundation — live provider endpoint configuration.
 *
 * UNDEPLOYED. Left empty on purpose: this session has no GCP credentials,
 * no `gcloud`/`npm` execution approval, and no billing/API-enablement
 * evidence for a refoundation project (see
 * `functions/newlife-refoundation-ai/README.md` "Prerequisites"). With this
 * constant empty, `RefoundationApp.tsx` never attempts a network call and
 * never shows the refoundation AI-dialogue consent prompt — the vertical
 * slice stays the fully deterministic, action-button-driven experience
 * already shipped in V11 stages 1-8. Deploying the function and pasting its
 * HTTPS trigger URL here (mirroring
 * `src/newlife/semantic/config.ts`'s `NEWLIFE_DIALOGUE_ENDPOINT_URL`
 * pattern) is the only step needed to switch this on; no other code change
 * is required.
 */
export const NEWLIFE_REFOUNDATION_AI_ENDPOINT_URL = "";
