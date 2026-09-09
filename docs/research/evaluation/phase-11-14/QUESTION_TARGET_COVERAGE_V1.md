# Question Target Coverage V1 — PHASE 11.14

Directive Section 7-13: semantic option exhaustion. Two genuinely distinct dimensions, kept
structurally separate (never conflated, per this project's running "don't merge two different
concepts into one flag" lesson).

## Dimension 1 — "I already asked this" (Section 7, minimum baseline)

Actor Experience (`experienceLog`), NOT State Admission. A question disappears once the PLAYER has
already dispatched it, regardless of what the response said.

| Action | Precondition | Mechanism |
|---|---|---|
| `ASK_WHAT_HELP_NEEDED` | `NOT_YET_ASKED_WHAT` (unchanged since PHASE 11.13) | `experienceLog` contains `"洋平に、何を手伝えばいいか尋ねた"` |
| `ASK_FESTIVAL_SCENE` | `NOT_YET_ASKED_FESTIVAL` (**new this phase** — it had NO one-shot gate before) | `experienceLog` contains `"洋平に祭りについて聞いた"` |

Before PHASE 11.14, `ASK_FESTIVAL_SCENE.eligibility` was `[ALWAYS]` — it stayed in the action list
forever. This alone was already a real defect independent of the redundancy issue below (Owner
point 7's minimum finding).

## Dimension 2 — "its target was resolved by ANOTHER response" (Section 8-13, the stronger finding)

State Admission (`materials`), NOT Actor Experience. A question disappears once its underlying
fact has become known, no matter which response supplied it. Structural (material-id membership),
never derived from response prose at evaluation time — same principle PHASE 11.13D/E established.

Two targets exist in this scene's real authored content:

### `FESTIVAL_SALES_STATUS`

Generic mechanism, `playableSceneContracts.ts`:

```ts
export type QuestionTarget = "FESTIVAL_SALES_STATUS";
export const RESPONSE_RESOLVES_SIMPLE_TARGETS: Record<string, QuestionTarget[]> = {
  ASK_FESTIVAL_SCENE: ["FESTIVAL_SALES_STATUS"],
  ASK_SALES_SCENE: ["FESTIVAL_SALES_STATUS"],
};
function questionTargetUnresolved(target: QuestionTarget): Precondition { /* materials-based */ }
```

`npcResponseCommit.ts`'s `commitSimpleTargetsIfApplicable` admits a plain
`question_target_known:FESTIVAL_SALES_STATUS` material whenever either action's response commits.
`ASK_SALES_SCENE.eligibility = [HAS_ASKED_FESTIVAL, questionTargetUnresolved("FESTIVAL_SALES_STATUS")]`.

Real authored content makes `ASK_SALES_SCENE` eligible for zero elapsed time: asking
`ASK_FESTIVAL_SCENE` sets `HAS_ASKED_FESTIVAL` true AND resolves `FESTIVAL_SALES_STATUS` in the
SAME response-commit step, so the two preconditions are never simultaneously satisfiable given
today's authored dialogue. Directive Section 11's Option B ("keep the richer natural answer and
remove the now-redundant sales question") is achieved this way rather than by deleting the
contract outright, deliberately: the mechanism stays real, tested, and would become reachable
again without any code change if a future content revision made the festival answer NOT mention
sales.

### `LEFTOVER_STATUS`

Reuses the EXISTING three-outcome material system from PHASE 11.13D (`LEFTOVER_RESPONSE_MATERIAL_
IDS`: CONFIRM/DENY/UNKNOWN) rather than inventing a second, parallel "known" tracker for the same
fact:

```ts
const LEFTOVER_TARGET_UNRESOLVED: Precondition = {
  id: "leftover_target_unresolved",
  check: (s) => !Object.values(LEFTOVER_RESPONSE_MATERIAL_IDS).some((id) => s.materials.some((m) => m.id === id && m.status === "ACTIVE")),
};
```

`ASK_ABOUT_LEFTOVER_STOCK.eligibility = [LEFTOVER_STOCK_MOVED, LEFTOVER_TARGET_UNRESOLVED]`.

`npcResponseCommit.ts`'s new `FESTIVAL_RESPONSE_RESOLVES_LEFTOVER` registry
(`{ "ASK_FESTIVAL::KNOWN": "CONFIRM" }`) makes `ASK_FESTIVAL_SCENE`'s response commit the SAME
`leftover_question_response_confirm` material `ASK_ABOUT_LEFTOVER_STOCK`'s own CONFIRM outcome
would — verified once, by a human, against the real captured festival text ("残りは今値引きして出す
準備してるところだ" genuinely confirms the box being moved is the discussed leftover stock), never
re-derived from that text at evaluation time. Every existing consumer of that material
(`evaluateLeftoverQuestionPrerequisite`'s `targetStatus`, the CONFLICTING-detection logic from
PHASE 11.13E) treats this exactly like a direct CONFIRM, with zero new logic required.

## "One response resolves multiple targets" (directive Section 8/10's explicit requirement)

`ASK_FESTIVAL_SCENE`'s response commit now does BOTH in one step:

```ts
ASK_FESTIVAL_SCENE: (state, packet) => {
  const withSimpleTargets = commitSimpleTargetsIfApplicable("ASK_FESTIVAL_SCENE", state); // FESTIVAL_SALES_STATUS
  const leftoverOutcome = FESTIVAL_RESPONSE_RESOLVES_LEFTOVER[packetKey(packet)];
  return leftoverOutcome ? commitLeftoverQuestionResponse(withSimpleTargets, leftoverOutcome) : withSimpleTargets; // LEFTOVER_STATUS
},
```

One real response (the captured festival answer) resolves TWO independently-gated question
targets, via two structurally different (but both material-id-based, never prose-based)
mechanisms combined at the commit-handler level. Tested directly in
`tests/newlifePlayable11RealPathIntegration.test.ts`.

## Question target != button id (directive Section 10)

`ASK_SALES_SCENE` and `ASK_ABOUT_LEFTOVER_STOCK` are two DIFFERENT buttons whose ELIGIBILITY both
depend on facts that `ASK_FESTIVAL_SCENE`'s single response can resolve. Eligibility is computed
from target-resolution state (materials), never from "has this specific button been clicked" —
satisfying the Owner's own framing: 「会話から残りの設問の回答は出てます」.

## Path-dependence (directive Section 12, PATH D)

Because both targets are gated by materials rather than by "was X ever asked", the SAME scene
produces different available questions depending on ORDER:

- Festival asked before the physical reveal: `ASK_ABOUT_LEFTOVER_STOCK` never becomes offerable
  (target already resolved by the time `LEFTOVER_STOCK_MOVED` becomes true).
- Physical reveal happens with festival never asked: `ASK_ABOUT_LEFTOVER_STOCK` remains
  legitimately eligible (target still open) until either it or `ASK_FESTIVAL_SCENE` resolves it.

Both orders are exercised as real test scenarios (`tests/newlifePlayable11RealPathIntegration.test.ts`,
the Playwright script's PATH B / PATH D sections) — this is genuine progression, not a fixed FAQ
menu (directive Section 13).
