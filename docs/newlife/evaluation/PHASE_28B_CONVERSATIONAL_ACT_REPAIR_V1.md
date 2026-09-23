# NEW LIFE — Phase 28B conversational-act repair V1

Date: 2026-09-21. Run: `PHASE_28B_CONVERSATIONAL_ACT_REPAIR_V1` (GitHub issue #1). `HUMAN_VALIDATION_STATUS = PENDING` throughout — this is engineering evidence, not a claim of human/product validation.

## 1. Route note (important, not a design change)

This run's checkout is a fresh, single-commit snapshot of `master` (`98ef4ce`). The "unmerged Phase 28 branch" (`claude/newlife/issue-1-20260921-2126`) referenced by the prior run's report is not reachable from here — cross-branch `git fetch` requires interactive approval unavailable in this unattended run, and `git log --all` shows only the current tip. What is actually on `master` is the narrower PR #6 fix (a literal regex expansion for one exact sentence). The fuller generalized router described in that unmerged branch's own report was never merged. This change is implemented fresh on top of current `master`, which achieves the same goal (fix the reported failure and generalize the router) without depending on the unreachable branch's exact diff.

## 2. Owner human evidence (the bug)

Player: 「口調が堅苦しいよ」 (feedback about Hina's manner of speaking, not a question, not a compliment).
Hina replied: 「焼き上がりの方が段取りより言うこと聞くんですけどね」と笑う — one of Hina's two generic, topic-free flavor lines, chosen only because the input didn't match a fact-question regex. This is a broken adjacency pair: the reply ignores the semantic content of what the player said.

## 3. Root cause

Before this change, `answerFreeText` classified every non-fact-question line as one undifferentiated "plain statement" bucket and answered it with a random flavor line from `GENERIC_FLAVOR[npc]`. A directed statement about the NPC (feedback, a compliment, criticism, agreement, disagreement, a greeting, a leave-taking line, or a request to repeat) is not equivalent to genuinely content-light chatter, but both fell into the same bucket.

## 4. Fix: conversational-act layer

`src/newlife/npcVoice.ts` now classifies a line by **conversational act before topic**, exported as `detectAct(text): ConversationalAct | null` with the acts `tone_feedback | repair_request | compliment | criticism | agreement | disagreement | greeting | leave_taking`. `answerFreeText` routes in this order:

1. `tone_feedback` / `repair_request` — acts about the conversation itself that never compete with a fact lookup (a food-texture complaint like "クッキーが固い" is excluded from `tone_feedback` by an explicit food-word guard, so it can't shadow a real menu question).
2. The existing six fact-topic domains (`detectIntent`, unchanged) — a compound line like a greeting-prefixed question ("おはようございます。どんな焼き菓子売るのですか") still answers the fact, not the greeting.
3. The remaining acts (`compliment`/`criticism`/`agreement`/`disagreement`/`greeting`/`leave_taking`) — only once no fact topic claimed the line, and only for non-question-shaped input, so a real question like "美味しいですか？" still reaches fact routing.
4. `clarificationLine(npc)` — a line that is clearly a question/request (`isQuestionLike`) but maps to no known fact domain gets a per-character clarification, never a flavor nonanswer. (This closes the same class of gap Phase 28's own core rule named, for the unmapped-question case that hadn't actually reached `master` yet.)
5. `flavorLine(npc, seed)` — reserved for genuinely content-light chatter or a plain observation with no directed act (e.g. "今日はいい天気だ").

Each act has one fixed, in-character line per NPC (`TONE_FEEDBACK_LINE`, `REPAIR_REQUEST_LINE`, `COMPLIMENT_LINE`, `CRITICISM_LINE`, `AGREEMENT_LINE`, `DISAGREEMENT_LINE`, `GREETING_LINE`, `LEAVE_TAKING_LINE`, `TOPIC_CLARIFICATION_LINE`) written from each character's canonical `SPEECH MODEL`/`Apology`/`Disagreement` fields in `NEWLIFE_CHARACTER_MODELS_V3.md` (e.g. Yohei's canonical apology pattern "言い方がきつかった。数はこれだ" underlies his `tone_feedback` line; Fumiko's canonical apology pattern "私が掲示を通した。ここを直して知らせる" underlies hers).

Not implemented, by design: a general NLU model, sentiment scoring, or conversation-history-aware repair (the module is stateless per call — `repair_request` responds by asking the player to restate rather than literally repeating a prior line it never received). This keeps the layer deterministic and testable rather than adding an LLM dependency this game doesn't otherwise have (see Phase 27 report §6 for that scope boundary).

## 5. Test evidence

`tests/newlife30ConversationalAct.test.ts` (new):
- Owner's exact sentence, asserted against `detectAct` and against `isFlavorLine` (a new test-only export) rather than exact-string-equals, so the assertion is about *not falling into the flavor bucket*, not about matching one hardcoded reply.
- A 6-phrase tone-feedback paraphrase matrix (`口調が堅苦しいよ`, `ちょっと固いね`, `もっと普通に話して`, `なんか他人行儀だね`, `その言い方ちょっと変だよ`, `話し方が機械っぽい`) × all six NPCs — none produce a flavor line.
- A food-texture guard case (`クッキーが固いですね`) confirmed **not** classified as `tone_feedback`.
- One representative phrase each for `compliment`/`criticism`/`agreement`/`disagreement`/`greeting`/`leave_taking` × all six NPCs, plus an assertion that all six map to distinct acts (not collapsed into one bucket).
- A `repair_request` case.
- The unmapped-but-clearly-a-question guard (`明日は晴れますか？`) — confirmed `detectIntent` is `null` and every NPC still returns the per-character clarification line, not flavor.
- A compound case (`おはよう。工房、貸してくれるんですか？`) confirming a fact topic still wins over the greeting wrapper.
- A plain-observation case (`今日はいい天気だ`) confirming genuinely content-light chatter still reaches `flavorLine`.
- A state-immutability check across all new act branches (same invariant as the existing engine test, re-asserted here because it's a new code path, not duplicated as new evidence of an already-covered path).

Existing `tests/newlife30Engine.test.ts` fact-routing/state/Day-24 tests are unchanged and still pass under manual trace (see §6); the two files do not re-test the same behavior.

## 6. Build/typecheck/test execution — blocked, verified by trace instead

`npm`/`npx`/`node_modules` are not available in this run (bare `npm --version` requires interactive tool-permission approval that isn't available in this unattended run; `node_modules/` is not installed either). This is the same infra gap the Phase 27 report already flagged, still not enabled for this workflow. Per CLAUDE.md §16 I checked for another execution path first (`ListAgents` → no reachable session to delegate to) before treating this as non-blocking rather than escalating.

In place of a live run, every new branch was traced by hand against `src/newlife/npcVoice.ts`'s actual regex logic for each test input in `tests/newlife30ConversationalAct.test.ts`, and every existing test in `tests/newlife30Engine.test.ts` was re-traced against the edited file to confirm no regression (menu/reservation/seats/workshop/yesterday/profit/barber_check routing, state-immutability, and Day 24 causality are all unchanged code paths). **This repo's own `newlife-pr-ci.yml` runs `npm install && npm run typecheck && npm test && npm run build` automatically on any PR touching `src/newlife/**` or `tests/newlife30*`**, so opening the PR from this branch gives a real, independent, automated verification of this change — not just this manual trace.

To let a future run execute these checks directly instead of tracing by hand: add `Bash(npm install)`, `Bash(npm run typecheck)`, `Bash(npm test)`, `Bash(npm run build)` to this workflow's `--allowedTools`.

## 7. Known limitations (non-blocking)

- Act detection is regex/keyword-based, not true NLU — ambiguous bare adjectives (e.g. "固い") are disambiguated only by a food-word exclusion list, which will miss novel phrasings outside the paraphrase matrix tested here.
- `repair_request` cannot literally repeat what the NPC last said (no conversation history is threaded into `answerFreeText`); it asks the player to restate instead, which is itself a normal human repair strategy but is a narrower behavior than "repeat the previous line."
- `HUMAN_VALIDATION_STATUS` remains `PENDING`; the six-character Owner human microtest remains the actual outstanding validation gate, unchanged by this run.
