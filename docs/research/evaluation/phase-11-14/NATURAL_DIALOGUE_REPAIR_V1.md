# Natural Dialogue Repair V1 — PHASE 11.14

One narrow human-language editing pass over Owner-visible text in `?newlifeplayable11=1`, per
directive Section 3-6/14. Every change is a plain text substitution — no new runtime mechanism.

## 1. Opening narration (Section 2/3)

- File: `src/research/action-contract-v2/playableSceneContracts.ts`
  (`openYoheiLeftoverStockRequest`) and `src/newlifeplayable11/NewlifePlayable11App.tsx`
  (pre-scene paragraph).
- Before: `「ちょっと手伝ってくれる？」と、洋平が言った。` / pre-scene: `祭りの翌日。洋平商店を訪れた。`
- After: `値引き用の棚を整理していた洋平が、話しかけてきた。「ちょっと手伝ってくれる？」` / pre-scene:
  `祭りの翌日。顔なじみの洋平の店を訪れた。`
- Rationale: Owner point 1 (話しかけた, not 言った, as the OPENING framing verb) + relationship
  grounding (see `RELATIONSHIP_GROUNDING_AUDIT_V1.md`) + physical continuity with the pre-scene
  paragraph's own claim that Yohei is arranging the discount shelf.
- Also fixed a latent duplication bug found while making this change: `NewlifePlayable11App.tsx`'s
  `begin()` had a SECOND, independently hand-typed copy of this exact opening line as a defensive
  fallback (`state.narration.length ? state.narration : ["..."]`). Two independently-authored
  copies of the same string is exactly the kind of drift risk this project's prior phases have
  repeatedly hunted down (e.g. PHASE 11.13B's substring-matching incident). Replaced with a single
  reference to `state.narration` (always populated by the time `begin()` runs) — one authority, not
  two.

## 2. Yohei's request-verb register (Section 4)

- File: `src/research/action-contract-v2/productFixtureLines.ts` (`ASK_WHAT::KNOWN` fixture line —
  this is the actual displayed response when the player asks "何を手伝えばいい？"; the SEPARATE
  real-captured-Vertex line for the same packet key, in `capturedYoheiLines.ts`, is left completely
  untouched as historical provenance evidence per PHASE 11.13's own precedent).
- Before: `店先の箱を、値引き用の棚まで運んでくれるか。`
- After: `店先の箱を、値引き用の棚まで運んでくれる？`
- Rationale: Owner point 3, directly. Cross-checked against
  `docs/product/NEWLIFE_JAPANESE_CHARACTER_VOICE_BIBLE_V1.md`'s Yohei entry: casual once
  acquainted, explicitly "not rough" (乱暴ではない) — 「〜くれる？」 fits this register better than
  the stiffer 「〜くれるか」.

## 3. PLAYER acceptance line (Section 5)

- File: `playableSceneContracts.ts` (`PLAYER_ACCEPTS_HELP_MOVE_STOCK.narration`).
- Before: `「分かった、運ぶよ」と答えた。洋平と二人で、箱を値引き用の棚まで運んだ。`
- After: `「OKです。この棚に置きますね」と答え、洋平と二人で箱を値引き用の棚まで運んだ。`
- Rationale: Owner point 4, exact wording adopted with only the grammatical join needed to keep it
  one flowing sentence with the existing "carried the box together" clause. Cross-checked against
  `NEWLIFE_JAPANESE_CHARACTER_VOICE_BIBLE_V1.md`'s protagonist entry (57-year-old male,
  polite-register baseline, "敬語をベースに") — the OLD line ("分かった、運ぶよ", plain/masculine-
  casual) was actually inconsistent with the established protagonist voice, not merely a stylistic
  preference; the Owner's suggested rewrite is the canonically-correct register.

## 4. Physical reveal narration (Section 6)

- Checked against the Owner's suggested text: `棚に置いて蓋を開けると、中には祭りの柄の手ぬぐいが
  たくさん入っていた。`
- Found: this is **already the exact live narration text**, unchanged since PHASE 11.13 (see
  `playableSceneContracts.ts`'s `PLAYER_ACCEPTS_HELP_MOVE_STOCK.narration`'s second line). No
  change was needed or made here. Recorded honestly rather than silently claimed as a fix.
- The structured reveal semantics from PHASE 11.13E (`REVEAL_MATERIAL_ASSERTED_FACTS`,
  `structuredFactsAssertedByRevealMaterial`) are untouched — this section only concerns the
  player-visible sentence, never the structural fact-tag registry.

## 5. PLAYER decline line (Section 14, general naturalness pass)

- File: `playableSceneContracts.ts` (`PLAYER_DECLINES_HELP_MOVE_STOCK.narration`).
- Before: `「ごめん、今日はちょっと」と、答えた。`
- After: `「今日はちょっと、やめておきます」と答えた。`
- Rationale: not explicitly named by the Owner, but caught by the Section 14 naturalness pass for
  the same reason as item 3 above — `NEWLIFE_JAPANESE_CHARACTER_VOICE_BIBLE_V1.md`'s protagonist
  voice bible lists, verbatim, as one of its 30 calibrated sample lines under "断り" (declining):
  「今日はちょっと、やめておきます」. The old line was plain-form/masculine-casual, inconsistent with
  the same polite baseline flagged in item 3. Yohei's own decline-acknowledgment line
  (`「ああ、分かった。じゃあ俺でやるよ」と、洋平は言った。`) was left unchanged: mid-conversation
  dialogue tags with `言った` are ordinary, unremarkable Japanese prose (unlike the OPENING line,
  where starting the very first interaction with a flat reporting verb reads mechanically) — not
  every instance of `言った` is an instance of the defect Owner point 1 identified.

## 6. Ask-question button labels — reviewed, not changed

Section 14 asks for a pass over "PLAYER speech" too, which could be read to include the ask-action
utterances ("祭りどうだった？", "これ、祭りの残り？", etc.). These were reviewed against the
protagonist voice bible and judged natural as-is: short, reactive, casual questions in an ongoing
conversation with someone already familiar are a normal register-mix even for a baseline-polite
speaker (the voice bible's own "運用ルール" section notes the baseline mixes in casual endings
during surprise/banter). Changing all five button labels to full 敬語 was judged to overreach past
what was actually flagged as unnatural, and risked making the buttons themselves feel stilted.
Recorded as a reviewed-and-intentionally-unchanged decision, not an oversight — a future phase
with explicit Owner signal on this specific point could revisit it.

## 7. Yohei's mid-conversation dialogue tags — reviewed, not changed

Beyond the opening line (item 1) and the decline acknowledgment (item 5, left as `言った`
deliberately), no other `と、洋平が言った`/`と、洋平は言った` instances exist in this scene's
authored contract text. Nothing further to change here.
