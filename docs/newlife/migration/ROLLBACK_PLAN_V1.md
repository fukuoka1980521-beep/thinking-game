# NEW LIFE — Gemini Migration Rollback Plan V1

Two independent rollback levels, as required by the migration-eval request.
Neither level exists yet as a *taken* action — both describe what to do
**if** a future migration (per `MIGRATION_PLAN_V1.md`) needs to be reversed.

## Level 1 — model override rollback (fast, while 2.5 remains available)

If a deployed candidate model regresses conversation quality or safety after
a migration:

- **Legacy** (`functions/newlife-dialogue/`): unset or revert the
  `NEWLIFE_DIALOGUE_MODEL` Cloud Functions environment variable so the
  function falls back to its source default,
  `"gemini-2.5-flash"` — no code change, no redeploy of application logic,
  only an environment-variable update plus a function restart/redeploy of
  config. This is reversible in minutes and requires no code review.
- **Refoundation** (`functions/newlife-refoundation-ai/`): same mechanism via
  `NEWLIFE_REFOUNDATION_AI_MODEL`, applied through the
  `newlife-refoundation-live.yml` manual workflow's repository
  variables/inputs.
- **Precondition:** this level only works while `gemini-2.5-flash` itself is
  still live in the target project/region. Per the Google retirement notice
  cited in `IMPACT_REPORT_V1.md`, that is expected to hold at least through
  2026-10-20, with a harder boundary at 2027-03-31. If 2.5 has been fully
  retired for this project by the time a rollback is needed, level 1 is no
  longer available and level 2 applies.

## Level 2 — endpoint/provider-path rollback (if the provider path itself
   degrades, independent of which model is configured)

If the AI-dialogue provider path degrades for a reason broader than model
choice (elevated `malformed_model_response`/`empty_model_response` rates,
Vertex AI outage, quota exhaustion, cost spike):

- **Legacy:** clear `NEWLIFE_DIALOGUE_ENDPOINT_URL` back to `""` in
  `src/newlife/semantic/config.ts` (the exact mechanism this constant's own
  doc comment already describes: "Clearing this constant back to `""`
  reverts to the fully local, no-network behavior"). Every free-talk turn
  then resolves through the existing deterministic Phase 27/28/28B router
  instead of calling any model — this is the same fallback path already
  exercised whenever a player declines AI-dialogue consent today, so it is a
  previously-validated code path, not a new one.
- **Refoundation:** the isolated vertical slice already defaults to this
  state — `src/newlife/refoundation/config.ts`'s
  `NEWLIFE_REFOUNDATION_AI_ENDPOINT_URL` stays `""` until an Owner explicitly
  deploys and wires it, and `RefoundationApp.tsx` already falls back to the
  deterministic `Null*` adapters whenever the endpoint is unset or the
  request fails — no additional change would be needed to "roll back" a
  refoundation live-provider issue beyond re-clearing the endpoint constant
  if it had been set.
- This level does not depend on which Gemini version is configured — it
  removes the network call entirely, which is why it is listed as a
  separate, more severe level from a model-only rollback.

## What is common to both levels

- Neither level requires a code change beyond an environment
  variable/config-constant edit that a future PR (not this one) would apply
  deliberately, with its own review — this plan does not pre-authorize
  either edit now.
- Neither level requires touching
  `chatgpt/newlife-phase34-human-playtest-repair` or any legacy behavior
  beyond the single constant/variable being reverted.
- Both levels are exercised, in the direction of *adopting* rather than
  *reverting*, by the existing consent-gate/fallback tests already in this
  repo (`tests/newlife30AiConsentFlow.test.tsx`,
  `tests/refoundationConsentGate.test.tsx`) — so the fallback code path a
  rollback would rely on is already covered by CI today, not something that
  would need to be built at rollback time.
