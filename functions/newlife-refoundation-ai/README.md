# newlife-refoundation-ai Cloud Function

Stateless HTTP Cloud Function (Gen 2) providing the live model provider for
the isolated NEW LIFE refoundation vertical slice
(`docs/newlife/refoundation/`, `src/newlife/refoundation/`). Implements five request paths (four existing adapters plus one bounded NPC-to-NPC continuation path):

- `ConversationAdapter` (`src/newlife/refoundation/converse.ts`) — the V37
  generative-character-reasoning primary free-conversation path.
- `ThoughtOrganizerAdapter` (`src/newlife/refoundation/thoughtOrganizer.ts`)
  — V37's separate, non-NPC problem-solving support layer.
- `SemanticInterpreterAdapter` (`src/newlife/refoundation/semanticInterpreter.ts`)
  — retained for compatibility/testing (V37 §7); no longer primary.
- `NpcGenerationAdapter` (`src/newlife/refoundation/npcGeneration.ts`) —
  retained for compatibility/testing (V37 §7); no longer primary.

## Why a separate function, not a shared endpoint

Same purpose-separation rule `functions/newlife-dialogue/README.md` already
argues from `docs/DATA_BOUNDARY.md`: this is a different purpose (the
blind-validated V13-V24 four-layer turn ontology + V27 ending vector + V31
NPC generation contract) from both `functions/dialogue/` (CASE1) and
`functions/newlife-dialogue/` (legacy NEW LIFE free talk). It gets its own
consent key (`thinking-game:newlife-refoundation-ai-consent:v1`,
`src/newlife/refoundation/consent.ts`) and does not share prompts, response
schemas, or character profiles with either existing function.

## Why no API key exists anywhere

Identical to the other two functions: this function authenticates to Vertex
AI using its own Cloud Run/Cloud Functions service account identity
(Application Default Credentials), never a manually issued API key. Nothing
here, in the deployed artifact, or in the frontend bundle ever holds a
secret string.

## Operations

One function, one `operation` discriminator in the POST body:

- `converse_turn` (V37, primary free-conversation path) — input:
  `{ operation, caseId, targetNpc, rawPlayerUtterance, recentDialogue,
  dynamicState }`. The client sends only dynamic/conversational data; the
  function builds the full `CharacterConversationContext` server-side from
  the canonical `SCENE_CANON`/`CHARACTER_DOSSIERS` in `lib.js` (never sent
  by the client — V37 §1's explicit prohibition). Output: `{ npc, npcLine, understoodPlayerMeaning, candidateTurn, candidateFactRevealIds, candidateCommitments, uncertainty, thoughtSupportSignal, sceneStatus, nextNpc, sceneRevisionProposal }`. `sceneRevisionProposal` is a concrete working-script draft only when `hasProposal=true`; it is not approval. Only `npcLine`
  is meant for immediate display; `candidateTurn`/`candidateFactRevealIds`/
  `candidateCommitments` are proposals only, validated and applied by the
  deterministic client (`relationshipReducer.ts`/`ending.ts`), never by this
  function or the model itself.
- `continue_npc_exchange` (V41/V42) — input: `{ operation, caseId, targetNpc, recentDialogue, continuationDepth, dynamicState }`. This is used only after a normal `converse_turn` has handed the scene to the other NPC. The final `recentDialogue` entry must be the other NPC; no synthetic player utterance is accepted. The browser and server cap the exchange at three continuation turns, and the final continuation must stop with `AWAIT_PLAYER`, `RESOLVED`, or `STALLED`.
- `organize_thought` (V37 §5, a separate non-NPC layer) — input:
  `{ operation, validatedWorldFacts, recentDialogue, currentProblem }`.
  Output: `{ known, possible, unknown, options, nextCheck }`. Never speaks
  as a character, never invents facts, never a moral/diagnostic score.
- `interpret_turn` (compatibility/testing, V37 §7) — input:
  `{ operation, utterance, caseContext }`. Output: only the closed
  `TurnClassification` shape
  (`action`/`boundaryMode`/`relationalEvents`/`needsClarification`) plus an
  optional `personalTrackSignal`. Never a state delta, never an NPC line,
  never a score.
- `generate_npc_line` (compatibility/testing, V37 §7) — input:
  `{ operation, projection }` where `projection` matches
  `NpcVisibleStateProjection`
  (`npc`/`relationshipState`/`boundaryStatus`/`lastPlayerTurn`/`sceneContext`).
  Output: only `{ npc, text }`. Never the full hidden world, never another
  NPC's record, never a state mutation.

All five operations are validated field-by-field server-side (`lib.js`'s
`validateInput`) before any model call, and the client-side adapters
(`src/newlife/refoundation/httpAdapters.ts`) re-validate the response shape
a second, independent time (`isValidRawConverseResult` /
`isValidRawThoughtOrganizerResult` / `isValidRawTurnClassification` /
`isValidRawNpcLine`) before trusting it — same two-layer discipline
`functions/newlife-dialogue/` already uses.

## Health / deployment identity (V42)

`GET` on the same endpoint (no body, no `operation`) returns `200` with:

```json
{
  "service": "newlife-refoundation-ai",
  "buildSha": "<NEWLIFE_REFOUNDATION_BUILD_SHA env var, or \"unknown\">",
  "contractVersion": "V42",
  "operations": ["converse_turn", "continue_npc_exchange", "organize_thought"]
}
```

This never calls Vertex AI, never consumes a rate-limit slot, and never reads
player data — it exists so a test page (or the permanent GitHub Actions
deploy workflow) can confirm which build a deployed instance is actually
running without spending a model call. `NEWLIFE_REFOUNDATION_BUILD_SHA` is not
set by any code in this repo yet; a future deploy step may set it to the
deployed commit SHA.

## Prompt-injection / tone-bias defenses

- The `interpret_turn` system instruction explicitly tells the model to
  treat the player's utterance as untrusted data, to never let politeness,
  dialect, verbosity, or emotional language act as a quality signal, and to
  emit the conservative `CLARIFY` tuple rather than a guessed high-impact
  classification whenever intent is uncertain — the same invariant
  `isValidRawTurnClassification`'s CLARIFY-pairing check already enforces
  mechanically on the client, now stated to the model as well (defense in
  depth, not a replacement for that check).
- The `generate_npc_line` system instruction forbids inventing facts,
  permissions, promises, motives, or completed actions beyond the supplied
  `NpcVisibleStateProjection`, forbids leaking internal ontology labels
  (`relationshipState`/`boundaryMode`/etc.) into the generated line, and
  states that `WITHDRAWN` must stay non-cooperative rather than being
  silently reset.
- The `converse_turn` system instruction carries the same untrusted-input,
  tone-blindness, and no-invented-facts rules as the two above, plus its own
  V42 artifact rule: `SCENE_CANON.disputedSceneExcerpt` is the concrete script text, `dynamicState.sceneRevisionText` is the only actual current draft, and a player claim that a rewrite exists never substitutes for text. Mika compares a real draft against her private identifying anchors and must name concrete remaining problems instead of repeatedly asking to see a nonexistent script.
  requirements specific to generative reasoning: forbidden knowledge
  (`characterDossier.forbiddenKnowledge`) must stay unknown to the NPC unless
  actually raised in `recentDialogue`, a `CLARIFY`-shaped `candidateTurn`
  must be paired with `uncertainty: "HIGH"`, and the NPC must never become a
  generic helpful assistant or counselor.
- The `organize_thought` system instruction forbids speaking as any
  character, forbids diagnostic/therapeutic language, forbids moral or
  personality scoring, and requires `known` (fact) and `possible`
  (inference) to stay visibly distinct.
- All model-backed operations are constrained to a strict output schema
  (`responseMimeType: "application/json"` + `responseSchema`).
- None of the above is trusted as sufficient on its own: the client-side
  validators reject any response that doesn't match the closed enum values,
  and `generateNpcLine`'s `containsForbiddenLabel` check independently
  rejects a literal ontology-token leak regardless of what the model
  promised.

## Cost controls

- `--max-instances=1` at deploy (same prototype-validation circuit breaker
  `functions/newlife-dialogue/` uses).
- The CORS allowlist below is the second line of defense.
- `utterance` is capped at 400 characters and `caseContext`/`sceneContext`
  at 2000 characters, both server-side (`lib.js`) and enforced again
  client-side before a request is ever sent.
- No request-rate limiting beyond `--max-instances` plus the in-process
  fixed-window limiter is implemented this Run, same disclosed limitation as
  the other two functions.

## Prerequisites (Owner action, not automatable from this session)

Same prerequisites as `functions/newlife-dialogue/`. This session has no
`gcloud` authentication, no GCP project credentials, and no permission-layer
approval to run `gcloud`/`npm` install commands (see the PR comment
disclosing this exact limitation) — deployment is not attempted from this
session:

1. A billing account linked to the GCP project (`gcloud billing projects
   describe <project>` must show `billingEnabled: true`).
2. Enable required APIs once billing is linked:
   ```
   gcloud services enable aiplatform.googleapis.com cloudfunctions.googleapis.com \
     cloudbuild.googleapis.com run.googleapis.com artifactregistry.googleapis.com \
     --project <project-id>
   ```

## Deploy (not run this session)

```
gcloud functions deploy newlife-refoundation-ai \
  --gen2 \
  --runtime=nodejs20 \
  --region=asia-northeast1 \
  --source=. \
  --entry-point=newlifeRefoundationAi \
  --trigger-http \
  --allow-unauthenticated \
  --memory=256Mi \
  --timeout=20s \
  --max-instances=1 \
  --project=<project-id> \
  --set-env-vars=GCP_PROJECT=<project-id>
```

After deploy, copy the printed HTTPS trigger URL into
`src/newlife/refoundation/config.ts`'s
`NEWLIFE_REFOUNDATION_AI_ENDPOINT_URL` constant. With that constant left
empty (as shipped), `RefoundationApp.tsx` never attempts a network call and
never shows the refoundation AI-dialogue consent prompt — deployed behavior
stays the fully deterministic, action-button-driven vertical slice this PR
already shipped, and legacy public NEW LIFE is unaffected either way.

## Local validation (no credentials needed)

`lib.js`'s `validateInput`/`applyCors`/prompt-and-schema builders are
exercised directly by `tests/newlifeRefoundationAiFunction.test.ts`, which
imports the pure functions with a mock `req`/`res` and never touches
`getClient()` — no Vertex AI credentials needed, matching the other two
functions' own "Local validation" sections. **The actual Vertex AI call
itself has not been exercised end-to-end this session**, since it requires
both the billing/API-enablement step above and deployment, neither of which
this session can perform (no credentials, no interactive approval for
`gcloud`/`npm`).

## Remaining gates before this can ship to a real player

1. Deploy this function (Owner action) and set
   `NEWLIFE_REFOUNDATION_AI_ENDPOINT_URL`.
2. A human review of the refoundation AI-dialogue consent-screen copy before
   it ships.
3. The refoundation vertical slice's own stated human-playtest gate (see
   `RefoundationApp.tsx`'s purpose screen / `HUMAN_VALIDATION_STATUS`),
   unaffected by whether a live provider is wired in.
4. Once live, the model has never been prompt-engineered or evaluated
   against a real endpoint — the first deploy needs its own automated +
   human evaluation pass on live output, not just "the types compile and
   request validation is tested."
