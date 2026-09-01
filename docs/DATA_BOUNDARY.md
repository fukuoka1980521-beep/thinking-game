# DATA_BOUNDARY — SPEC AMENDMENT

This document sets principles for data this product **could** collect in a future networked version. In
this MVP nothing leaves the device (`docs/SAFETY_PRINCIPLES.md`), so no consent UI or transmission code
exists yet — these are boundaries to design against later, recorded now so they aren't improvised under
deadline pressure.

## Three data categories (Section N)

1. **GAMEPLAY DATA** — `case_id`, `factOrder`, structured player actions (choices, confidence, info-option
   selections, AI action, problem-type selection), `decisionChanged`, trap detection, timestamps. This is
   the `TrajectoryLog` schema minus its two free-text fields (`docs/TRAJECTORY_SCHEMA.md`).
2. **OPTIONAL TEXT** — `firstDecision.reason`, `secondDecision.reason`, `aiIntervention.freeText`,
   `reflectionNote`. Auxiliary, never read by the evaluation or growth engines (Section D), and the
   category a future export/consent flow would need to treat most carefully.
3. **REAL WORLD SENSITIVE DATA** — REAL QUEST original text and similar. **Not collected in this MVP**
   (REAL QUEST itself is `NOW_NOT_IMPLEMENT`, `docs/FUTURE_IDEAS.md`). If REAL QUEST ships later, this
   category's default is **device-local storage**, not server sync, unless a much more deliberate consent
   design is built first.

## Purpose separation (Section O)

If cloud storage is introduced later, any stored data must be tagged with one of:

- `PERSONALIZATION` — improving what this specific player sees.
- `PRODUCT_IMPROVEMENT` — aggregate product analytics.
- `RESEARCH` — the validation hypotheses in `docs/VALIDATION_PLAN.md`.
- `EXTERNAL_USE` — anything leaving this product entirely.

A single blanket consent is not an acceptable substitute for this — each purpose needs its own opt-in.
This MVP is local-only, so no consent UI exists yet; this section is a placeholder for the Run that adds
cloud sync.

## No permanent profile (Section P)

If a future Run estimates a player's tendencies (e.g. "often accepts AI claims without verifying"), that
estimate must:

- Use a rolling window (e.g. `WINDOW_10`, `WINDOW_20` — matching the `RECENT_WINDOW_SIZE` pattern already
  used in `src/engine/growthAggregator.ts`), never a lifetime aggregate treated as a fixed trait.
- Never be phrased as an identity claim ("あなたは確認バイアス型") — only as an observation about a
  specific recent window ("最近10ケースでは…"). This is already enforced for the shipped ability/AI-action
  displays; the same rule extends to anything added later.

## External reuse boundary (Section R)

What is safe to summarize for `thinking-os` or similar in the future:

- Which *questions* prompted a judgment update (structural, not textual).
- Which *AI interventions* correlated with over-reliance.
- Which *evidence formats* increased verification behavior.
- Which *reasoning errors* were most frequent, in aggregate.

What is never passed:

- A player's free-text `reason` / `freeText` / `reflectionNote` content.
- Any fixed per-person label derived from their history.

**No code integration with `thinking-os` exists today.** This document only sets the boundary for if/when
one is built; see `docs/DECISIONS.md` for why `thinking-game` is a separate repository in the first place.
