# NEW LIFE V32 — THOUGHT TOOLS CONTRACT V1

Status: SMALLEST NORMATIVE CONTRACT FOR V11 STAGE 6.

## 1. Source

`docs/newlife/refoundation/blind/BLIND_AI_REVIEW_PACKET_V3.md`'s "Thought tools" section — the most concrete version across V1-V3, and the version the V21 "Blind Review Round 3 — Game Systems" review (`PASS_FOR_PROTOTYPE`) evaluated Q8 ("Are all four thought tools now mechanically meaningful?") against. Implements only the four already-accepted tools; adds no new tool and no morality/empathy scoring.

## 2. Per-tool mechanical mapping

### 2.1 「どこまでなら大丈夫？」— boundary check

V3: "Structured boundary check. 1 min rather than 2." The tool *is* the player's turn for this exchange — it does not itself decide the NPC's answer (that is case-specific ground truth a future game loop supplies, matching `ending.ts`'s existing case-agnostic-caller pattern; this module does not invent hidden per-case truth). Mechanically: `useBoundaryCheckTool()` returns the deterministic turn effect `{ action: "ASK_BOUNDARY", boundaryMode: "DISCOVER" }` (V13 §B: DISCOVER = "the player is trying to learn the boundary/scope," exactly this tool's function) at `TIME_COSTS.THOUGHT_TOOL_BOUNDARY_CHECK` (1 min) instead of the ordinary `QUICK_FACTUAL_OR_BOUNDARY_QUESTION` (2 min), plus the three-option answer shape (`NO`/`OK`/`SUBSTITUTE`) the NPC's reply will take — collapsing what would otherwise be a multi-turn clarification into one.

### 2.2 「嫌なこと + 代わりにできること」— alternative plan slot

V3: "Creates one editable alternative-plan slot. Saves 2 min plan-generation cost." Gated on `EndingBoundaryStatus === "STATED"` per the V2 packet's explicit precondition ("When BOUNDARY is STATED"), preserved in V3 by inheritance (no packet revision removed the gate). `openAlternativePlanSlot` returns `null` when the gate fails — the slot cannot exist before a boundary is known, so the tool cannot be used to pre-empt discovering one. Opening the slot costs 0 minutes; the 2-minute saving applies once the slot is filled and turned into a real committing action (`applyAlternativePlanDiscount`), not to opening it. The slot's existence is not itself a commitment and does not guarantee NPC acceptance (V3: "acceptance is not guaranteed") — turning it into an accepted resolution still requires an ordinary `ActionType` turn through `ending.ts`/`relationshipReducer.ts`, unmodified by this stage.

### 2.3 「今の問題と、本人の悩みは同じ？」— task/personal split

V3: "Splits CURRENT TASK and PERSONAL PATTERN. Allows personal track to be parked without current-task CLARITY penalty." This codebase has no `CLARITY` field (V26/V30 already document that gap; `ending.ts` implements only `SHOW`/`BOUNDARY`/`TRUST`/`TIME_LEFT`/`PERSONAL_TRACK`), so there is no penalty for this tool to protect against in the first place — `ending.ts`'s `personalTrackOpened` is already non-required for `SHOW`/`BOUNDARY` by construction (V27 §4.3). This tool's real, implementable contribution is a **board-bookkeeping split** (`splitTaskAndPersonalTrack`): two opaque, caller-supplied labels plus an explicit `personalTrackDeferred: true` marker, for a future UI to render as two separate columns rather than one conflated one. It does not, and structurally cannot, emit `PersonalTrackSignal: "OPENED"` — opening the track remains exclusively the semantic interpreter's job (V27 §4.1: "only when that turn explicitly and voluntarily raises the NPC's deeper personal pattern"). V3 states no minute cost for this tool (unlike the other three, which each name one); `TIME_COSTS.THOUGHT_TOOL_TASK_PERSONAL_SPLIT` is set to 0 as the most conservative reading available from the text, flagged here as an assumption rather than silently invented.

### 2.4 「友達ならどう扱う？」— counterfactual role swap

V3: "Generates one alternative-action candidate not currently on the board. Costs 1 min. Suggestion may be rejected and is not guaranteed correct." `useRoleSwapTool` takes a caller-supplied `ReadonlySet<ActionType>` of actions already used/considered this case and returns the first not-yet-used candidate from a fixed pool of the same operational `ActionType`s `ending.ts` already treats as legitimate resolutions (`COMMITTING_ACTION_TYPES` plus a small set of non-committing-but-concrete moves: `REASSIGN_WORK`, `MOVE_PRIVATE`, `APOLOGIZE_AND_REPAIR`), or `null` if the pool is exhausted. The suggestion is a candidate only — the player must still perform it as a real turn for it to have any effect; the tool itself never applies a turn or mutates state.

## 3. Cross-cutting constraints (all four tools)

- **Optional, never required.** No tool function reads or writes `NpcRelationshipRecord`/`CaseEndingState`; each takes only the minimal read-only input it needs (a `ReadonlySet<ActionType>`, an `EndingBoundaryStatus`, or nothing) and returns plain descriptive data. `ending.ts`'s `deriveShowOutcome`/`deriveEndingBoundary`/`derivePersonalTrack` do not import this module, so no ending field can structurally depend on tool usage.
- **No morality/empathy score.** None of the four functions read `RelationshipState`/trust, and none combine into a point total — consistent with `ending.ts` §1's "no field is weighted, summed, or combined into a single score."
- **Style-neutral acquisition** (V3 "Style-neutral acquisition examples": facilitative→role-swap, managerial→task/personal split, analytical→boundary+substitute, direct→exact boundary scope) is a case-authoring/UI concern (which tool a future game loop offers after which kind of player move) — out of scope for this deterministic-mechanics module, which exposes all four uniformly to any caller.

## 4. Self-audit (inline, single-pass — bounded deterministic-mechanics module, no case-level design surface beyond §2.3's already-disclosed assumption)

- **Checked:** does gating §2.2 on `boundaryStatus === "STATED"` silently block `RESPECTED`-state use? Re-read V2/V3: the tool's purpose is proposing a substitute *before* disposition, so gating on the pre-disposition `STATED` value (not also `RESPECTED`/`OVERRIDDEN`) matches the packets' own "When BOUNDARY is STATED" precondition exactly — not a blocker, a deliberate narrowing already present in source.
- **Checked:** could §2.4's candidate pool overlap with `ending.ts`'s `NPC_DEPENDENT_COMMITTING_ACTION_TYPES` in a way that lets a "suggestion" silently commit the case? No — `useRoleSwapTool` returns an `ActionType` value only; nothing in this module or `ending.ts` treats a suggested-but-unperformed `ActionType` as a `TaskCommitment` (which requires an actual `EndingTurnInput`, `turnRef` included).
- **No blocker found.** `PASS_FOR_IMPLEMENTATION` for this narrow scope.
