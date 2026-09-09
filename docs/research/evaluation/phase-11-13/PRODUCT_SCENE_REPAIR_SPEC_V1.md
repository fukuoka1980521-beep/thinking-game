# Product Scene Repair Spec V1 — PHASE 11.13

Product repair of the PHASE 11.11 small playable Yohei scene, performed entirely through the
PHASE 11.12/11.12R systemic gates (checkpointed at commit `f43d534`). No gate was bypassed or
weakened; every change below is either (a) new/changed authoritative content
(`playableSceneContracts.ts`) that the existing gates then evaluate differently, or (b) a
generalization of `buildAskCandidates` so every ask-action's own eligibility (not just
`ASK_ABOUT_LEFTOVER_STOCK`'s) drives composition.

## P1 — genuine causality for the post-ACCEPT question

**Before:** `ASK_WHAT`'s real captured Vertex line named the box as festival hand towels before
ACCEPT; the box's actual contents were therefore already known, making
「これ、祭りの残り？」merely state-gated, not a real discovery.

**After:**
- `ASK_WHAT`'s reply is now a `SYSTEM_AUTHORED_PRODUCT_FIXTURE` line (`productFixtureLines.ts`):
  「店先の箱を、値引き用の棚まで運んでくれるか。」— names only the task, not the contents.
- `ACCEPT_HELP`'s narration (`playableSceneContracts.ts`, `PLAYER_ACCEPTS_HELP_MOVE_STOCK`) now
  includes the physical reveal as an authoritative, authored (not LLM) event: 「棚に置いて蓋を開ける
  と、中には祭りの柄の手ぬぐいがたくさん入っていた。」— festival-patterned towels become visible,
  but their status as specifically the unsold festival *leftover* is deliberately not stated here.
- The `leftover_stock_moved` material's `concreteContent` (State Admission evidence) matches the
  reveal narration, giving the causality gate an authoritative, path-independent source.
- `ASK_ABOUT_LEFTOVER_STOCK`'s answer is unchanged, the real captured Vertex line: 「ああ、そうだ。
  祭りの残りだよ。値引きで出すから、棚に並べるんだ。」— now genuinely supplies one novel fact
  (`IS_FESTIVAL_LEFTOVER`) the player could not have had before the reveal.
- Verified mechanically: `evaluateRealLeftoverStockCausalClaim` now returns `CAUSAL_UNLOCK_VALID`
  with `novelFacts: ["IS_FESTIVAL_LEFTOVER"]` (`tests/newlifePlayable11RealPathIntegration.test.ts`).

## P2 — DECLINE social response

**Before:** PLAYER's decline utterance was followed immediately by the generic world-continuity
line, with no distinct Yohei acknowledgment.

**After:** `PLAYER_DECLINES_HELP_MOVE_STOCK`'s narration now has two lines: PLAYER's decline
(unchanged) + Yohei's short, non-punitive acknowledgment: 「ああ、分かった。じゃあ俺でやるよ」と、
洋平は言った。 Rendered as two separate paragraphs in the log, structurally distinct from the
separate world-continuity `<div>` below it (unchanged mechanism) — SOCIAL RESPONSE and NPC
INDEPENDENT CONTINUATION are never merged into one string.

## P3 — post-resolution UI consistency

**Before:** `ASK_WHAT_HELP_NEEDED.eligibility = [ALWAYS]` — remained offered after DECLINE.

**After:** `eligibility = [PENDING_REPLY_OPEN, NOT_YET_ASKED_WHAT]` (both reused: `PENDING_REPLY_OPEN`
from `pendingReplyContracts.ts`; `NOT_YET_ASKED_WHAT` reads `experienceLog`, Single Precondition
Authority against the same string `ASK_WHAT_HELP_NEEDED.actorExperienceWrite` writes). Disappears
once resolved (accept OR decline) AND once already answered, whichever comes first.

## P4 — flat-menu reduction

**Before:** 7 simultaneous actions on the initial screen (1 QA-owned, already fixed by PHASE
11.12R's ownership gate; the remaining 6 were still a flat, undifferentiated list).

**After:** initial screen has 5 actions (directive Section 9's expected maximum): 手伝う, 今日は
やめておく, 何を手伝えばいい？, 祭りどうだった？, その場を離れる. `ASK_SALES_SCENE.eligibility =
[HAS_ASKED_FESTIVAL]` (reused `experienceLog` check against `ASK_FESTIVAL_SCENE`'s own write) keeps
it hidden until conversationally earned. Visual hierarchy (`playable11.css`, directive Section 18):
`.pw11-primary` (ACCEPT/DECLINE, bold border), `.pw11-secondary` (ASK_* actions, slightly reduced
weight/opacity), `.pw11-leave` (dashed border, distinct from both) — modest, not a redesign.

## What did NOT change

`engine.ts`, `types.ts`, `contracts.ts`, `pendingReplyContracts.ts` (the tracked, PHASE-11.6R/11.8
committed core) — untouched. `yoheiSourceEvents.ts`, `capturedYoheiLines.ts`, `languageAdapter.ts` —
untouched (the real captured lines for ASK_FESTIVAL/ASK_SALES/ASK_ABOUT_LEFTOVER_STOCK are reused
verbatim; only ASK_WHAT's rendered text changes, via an intercepting fixture layer, not by editing
the captured-line data). `productSurface.ts`'s ownership registry, `causalUnlockInvariant.ts`'s
core comparison logic, `dependencyDirection.ts`, `devOnlyDisclosure.ts` — unchanged mechanisms;
only the underlying narrative content they evaluate changed.

## Language source labeling (directive Section 17)

| Line | Label |
|---|---|
| ASK_WHAT reply ("店先の箱を、値引き用の棚まで運んでくれるか。") | `SYSTEM_AUTHORED_PRODUCT_FIXTURE` |
| ASK_FESTIVAL reply | `CAPTURED_REAL_VERTEX_REPLAY` (unchanged) |
| ASK_SALES reply | `CAPTURED_REAL_VERTEX_REPLAY` (unchanged) |
| ASK_ABOUT_LEFTOVER_STOCK reply | `CAPTURED_REAL_VERTEX_REPLAY` (unchanged) |
| ACCEPT narration (incl. reveal), DECLINE narration (incl. Yohei ack), world-continuity | `NON_LLM_SYSTEM_NARRATION` (unchanged mechanism — never routed through the language adapter) |

No new Vertex calls were made this phase (directive Section 17's explicit prohibition).
