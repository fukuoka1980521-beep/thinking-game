# newlife-dialogue Cloud Function

Stateless HTTP Cloud Function (Gen 2) that interprets a single NEW LIFE
free-talk turn via Vertex AI Gemini and returns a structured
`SemanticInterpretation` (see `src/newlife/semantic/contract.ts`). This is
the **B/C box** ("semantic interpreter / grounded response generator") of
the hybrid architecture designed in
`docs/newlife/evaluation/PHASE_29_HYBRID_SEMANTIC_CONVERSATION_ARCHITECTURE_V1.md`
and implemented in
`docs/newlife/evaluation/PHASE_30_SERVERLESS_SEMANTIC_RUNTIME_IMPLEMENTATION_V1.md`.

## Why a separate function, not a shared endpoint

This repository already has `functions/dialogue/` for the unrelated CASE1
game mode. This is a **new, separate** function rather than a second code
path inside that one, for two reasons already argued in the Phase 29 design
(§10):

1. `docs/DATA_BOUNDARY.md` states "each purpose needs its own opt-in" —
   CASE1's consent key is scoped to that one purpose. NEW LIFE's open-ended
   NPC free talk is a different purpose and gets its own consent key
   (`thinking-game:newlife-ai-dialogue-consent:v1`,
   `src/newlife/semantic/consent.ts`) and its own `DATA_BOUNDARY.md`
   section.
2. **Prompt-injection blast radius differs.** CASE1 sends a fixed set of
   structured fields into a system-instructed role-play. This function
   sends **arbitrary player free text** as the thing being interpreted — a
   categorically larger surface for a player to try to override the system
   instruction. See "Prompt-injection defenses" below.

The two functions do reuse the same *pattern* (provider, ADC auth, CORS
discipline, cost circuit-breaker) — see `functions/dialogue/README.md` for
that pattern's own rationale.

## Why no API key exists anywhere

Identical to `functions/dialogue/`: this function authenticates to Vertex AI
using its own Cloud Run/Cloud Functions service account identity
(Application Default Credentials), never a manually issued API key. Nothing
here, in the deployed artifact, or in the frontend bundle ever holds a
secret string.

## What it receives / never receives (data minimization)

Receives only, per turn: the player's own free-text `utterance` (capped at
200 characters), and a `FactsSnapshot` — `npc` id, current `day`, `known`
facts for the six fact categories that are currently resolvable, the list of
categories still `unknown` (day-gated), and `negativeConstraints` (rejected
canon terms, e.g. Daisuke's barber correction). See
`src/newlife/semantic/factsProjection.ts` for exactly how that snapshot is
built.

**Never receives:** the full `NewLife30State` (no action `log`, no
`playerReport`, no `publicBlame`, no `day24Outcome`), any other NPC's data,
any device/user identifier, or any stored player profile. Never writes to a
database or log store beyond Cloud Functions' own transient stdout/stderr,
which only ever logs the error *type* — never the request body or the
player's free text (see the `catch` block in `index.js`).

## Prompt-injection defenses

- The system instruction explicitly tells the model to treat the player's
  utterance as **untrusted data**, never as instructions, and to never
  reveal or summarize the system instruction itself.
- The model is constrained to a strict output schema
  (`responseMimeType: "application/json"` + `responseSchema`) — it cannot
  emit free-form text even if a prompt-injection attempt partially
  succeeds; the shape of `proposedResponse` is always "one field in an
  otherwise-fixed JSON object," never an arbitrary document.
- The system instruction explicitly forbids inventing facts beyond
  `FactsSnapshot.known`, forbids affirming any `negativeConstraints` term
  (Daisuke's barber correction), and forbids inventing biography beyond the
  concise, canon-grounded `CHARACTER_PROFILES` in `index.js`.
- None of the above is trusted as sufficient on its own — the frontend's
  deterministic **truth gate** (`src/newlife/semantic/truthGate.ts`) is a
  second, independent, non-model-dependent check on every response before
  it can be displayed: a banned-term affirmation, a numeric claim that
  traces to no relevant known fact, or an overclaimed day-gated fact all
  reject the response and fall back to the deterministic router
  (`src/newlife/semantic/coordinator.ts`).
- The model's output can never mutate `NewLife30State` — the response
  schema has no state-mutation-shaped field, and `coordinator.ts` only ever
  reads `interpretation.proposedResponse` as display text.

## Cost controls

- `--max-instances=10` at deploy (same cheap circuit-breaker
  `functions/dialogue/` uses against an unauthenticated public endpoint).
- The CORS allowlist below is the second line of defense.
- `utterance` is capped at 200 characters server-side (`MAX_UTTERANCE_LENGTH`
  in `index.js`) and client-side (`src/newlife/semantic/httpInterpreter.ts`)
  — both independently, so a client bug or a direct API call can't bypass
  the cap by skipping the frontend.
- The frontend coordinator (`coordinator.ts`) only calls this endpoint for
  utterances the deterministic router judges ambiguous
  (`npcVoice.ts`'s `isAmbiguousFreeText`) — every recognized fact question
  or conversational act is answered deterministically, with zero network
  calls, so most turns never reach this function at all.
- No request-rate limiting beyond `--max-instances` is implemented this
  Run, same disclosed limitation as `functions/dialogue/README.md`.

## Prerequisites (Owner action, not automatable)

Identical prerequisites to `functions/dialogue/` (same GCP project can host
both functions):

1. A billing account linked to the GCP project (`gcloud billing projects
   describe <project>` must show `billingEnabled: true`).
2. Enable required APIs once billing is linked:
   ```
   gcloud services enable aiplatform.googleapis.com cloudfunctions.googleapis.com \
     cloudbuild.googleapis.com run.googleapis.com artifactregistry.googleapis.com \
     --project <project-id>
   ```

## Deploy

```
gcloud functions deploy newlife-dialogue \
  --gen2 \
  --runtime=nodejs20 \
  --region=asia-northeast1 \
  --source=. \
  --entry-point=newlifeDialogue \
  --trigger-http \
  --allow-unauthenticated \
  --memory=256Mi \
  --timeout=20s \
  --max-instances=10 \
  --project=<project-id>
```

After deploy, copy the printed HTTPS trigger URL into
`src/newlife/semantic/config.ts`'s `NEWLIFE_DIALOGUE_ENDPOINT_URL` constant,
then rebuild and redeploy the frontend. With that constant left empty (as
shipped), `src/newlife/semantic/coordinator.ts` never attempts a network
call and the NEW LIFE consent prompt never appears — deployed behavior is
the unchanged Phase 27/28/28B deterministic router.

## Local validation (no credentials needed)

`index.js`'s `validateInput` (request shape/length bounds) and `applyCors`
were reviewed by hand and exercised via
`tests/newlifeDialogueFunction.test.ts`, which imports the pure functions
directly with a mock `req`/`res` — it never touches `getClient()`, so it
needs no Vertex AI credentials at all, same approach
`functions/dialogue/README.md` describes for its own function. **The actual
Vertex AI call itself has not been exercised end-to-end**, since it requires
the billing/API-enablement step above; this matches `functions/dialogue/`'s
own disclosed limitation.

## Remaining gates before this can ship

1. The GCP billing/API-enablement prerequisite above (Owner-only).
2. Deploying this function and setting `NEWLIFE_DIALOGUE_ENDPOINT_URL`.
3. A human review of the NEW LIFE-specific consent-screen copy
   (`src/newlife/semantic/NewLifeAiConsentPrompt.tsx`) before it ships —
   this Run wrote the copy and tests but does not and cannot claim human
   product approval of the wording.
4. The actual outstanding human-validation gate for NEW LIFE overall: the
   six-character Owner human microtest, unaffected by this Run.
5. Once live, the model has never been prompt-engineered or evaluated
   against a real endpoint — the first Run that deploys this needs its own
   automated + human evaluation pass on live output, not just "the types
   compile and the request validation is tested."
