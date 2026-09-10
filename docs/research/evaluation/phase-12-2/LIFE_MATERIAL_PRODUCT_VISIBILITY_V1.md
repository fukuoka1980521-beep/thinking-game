# Life Material Product Visibility V1 — PHASE 12.2

Directive Section 14. State admission/`LifeMaterial` semantics themselves are unchanged (frozen,
directive Section 1) — this covers only how a commit is SURFACED to the player.

## What changed

When `sendUtterance` receives an envelope carrying a non-null `proposedConsequenceId` and the
commit succeeds, the UI now sets a small piece of presentation-only state (`justCommitted`) and
renders one line, `.bgw-consequence-note`: 「何かが、今日の記憶に残ったようだ。」 — shown once, above
the conversation log, styled as a soft in-fiction aside (a muted green note card), not an alert or
a system toast.

## What is never exposed (directive Section 14's explicit prohibitions, verified)

- No `LIFE_MATERIAL` label, no `PROMISE` type name, no material id (`yohei_help_promise`), no raw
  state JSON anywhere on the primary surface. Verified directly:
  `tests/newlifeBgw121VisualProduct.test.tsx`'s "persistent consequence" test asserts the note's
  own text does not match `/yohei_help_promise|LIFE_MATERIAL|PROMISE|\{/`.
- The debug panel (`bgw121-debug-panel`, unchanged, toggle-gated) still shows the full raw state
  for development purposes — this is the ONE place such detail remains visible, exactly as before,
  never on the primary surface.

## Why the wording is intentionally vague/universal rather than content-specific

`justCommitted` currently only ever holds `"YOHEI_HELP_PROMISE"` (the one registered consequence
this slice has), but the displayed sentence does not name Yohei or the specific promise — it is a
generic "something persisted" note. This was a deliberate minimal choice: writing a
consequence-specific natural-language line per registered id would require either (a) a second,
parallel per-id display-text registry (a real design cost for a single-consequence slice) or (b)
reading `concreteContent` for display, which is exactly the LifeMaterial's already-designed
audit/display field (safe to read for DISPLAY, per PHASE 11.13D's established distinction between
display text and authority) — deferred to a future phase since one generic sentence already
satisfies directive Section 14's actual requirement ("the PLAYER should understand: something from
that encounter remains") without overbuilding for a single-consequence slice.

## Return-to-map visibility (directive Section 15, cross-referenced)

The consequence's effect is also visible structurally on return to the map: `YOHEI_STORE`'s map
marker gains a small badge (`.bgw-map-node-badge`, `bgw121-map-badge-yohei`) while
`yohei_help_promise` is active, and Yohei's own activity line changes
(`yoheiCurrentActivity` — unchanged PHASE 12.1 function — now reads "プレイヤーと一緒に倉庫の在庫を
運んでいる" instead of the pre-commit line). Both are real, state-derived changes, not animation
added to simulate change (see `RETURN_TO_MAP` coverage in `MOBILE_VISUAL_QA_V1.md`).
