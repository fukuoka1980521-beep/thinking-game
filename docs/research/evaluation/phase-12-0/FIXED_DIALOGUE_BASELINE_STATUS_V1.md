# Fixed-Dialogue Baseline Status V1 — PHASE 12.0

## Baseline commit

`3f97b4873da40ad93ae7594059cf897c1252cd37` — "research: preserve fixed-dialogue owner feedback
baseline", classified `FIXED_DIALOGUE_BASELINE`, NOT `NEW_LIFE_PRODUCT_DIRECTION`. Sits on
`aabc5043a814e1b4aaffbfc6d686d6e536dc357e` (PHASE 11.13 semantic repair) and root-fix checkpoint
`f43d5345ef856ece5cb56c496ff515696514c6fc` (PHASE 11.12/11.12R contamination containment).

## What this baseline is worth keeping for

The `?newlifeplayable11=1` scene (PHASE 11.11–11.14) is not being discarded as wasted work. It
remains valuable as:

1. **A regression fixture for the systemic gates.** Product Surface ownership
   (`productSurface.ts`), the counterfactual causal-unlock invariant (`causalUnlockInvariant.ts`),
   the QA/TestProbe separation, and the dev/build compile-time boundary were all proven against
   this scene's real code, not a synthetic stand-in. PHASE 12.1+ should re-run
   `tests/productSurfaceGate.test.ts`, `tests/dependencyDirection.test.ts`,
   `tests/devOnlyDisclosureBoundary.test.ts`, and `tests/testProbeSeparation.test.ts` unmodified
   against any new architecture — these gates are boundary infrastructure, not fixed-dialogue-
   specific.
2. **A concrete "what a fixed table cannot do" comparison point.** Section 8's AI necessity
   argument is strongest when it can point at a real, working, fully-tested fixed-response system
   and show specifically what it structurally cannot express (see
   `BOUNDED_GENERATIVE_WORLD_ARCHITECTURE_V1.md` §AI necessity).
3. **A validated State Admission / Actor Experience pattern.** `LifeMaterial`, `experienceLog`,
   the response-commit-point separation (PHASE 11.13C), and structural (never prose-based)
   authority (PHASE 11.13D/E) are exactly the primitives PHASE 12.0's authority boundary
   (`WORLD_NPC_PLAYER_AUTHORITY_FLOW_V1.md`) reuses, unchanged in kind, for the generative
   architecture's hard-validation layer.

## What is explicitly NOT carried forward as mainline direction

- The one-question-one-button, author-every-answer interaction model.
- Treating "which button is visible" as the primary conversational surface.
- Any further polish of `NewlifePlayable11App.tsx`'s fixed dialogue content.

## Why the direction changed (Owner findings after PHASE 11.14)

Per this phase's directive: even with fully correct semantic state handling (one-shot questions,
cross-response target resolution, zero prose-authority — all delivered and verified in PHASE
11.13–11.14), the fixed question→fixed response model does not produce unpredictability, NPC
autonomy, or freedom of interaction. This is not a bug the semantic-authority work could have
fixed — it is a ceiling inherent to authoring every possible answer in advance. The correct next
step is not more repair of this model; it is a different model (`BOUNDED_GENERATIVE_WORLD_ARCHITECTURE_V1.md`).

## Status of the working tree going forward

The baseline commit is the last commit touching `newlifeplayable11`/`playableSceneContracts.ts`/
`npcResponseCommit.ts` under the fixed-dialogue model. PHASE 12.1's implementation, when it comes,
should be a NEW code surface (a new isolated route, following this project's established pattern
of `?newlifeplayableNN=1` isolated prototypes) rather than a further mutation of this one — keeping
the fixed-dialogue baseline inspectable and diffable against, per this document's stated purpose.
