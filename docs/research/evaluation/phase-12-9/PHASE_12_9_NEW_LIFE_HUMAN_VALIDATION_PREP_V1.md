# PHASE_12_9_NEW_LIFE_HUMAN_VALIDATION_PREP_V1 -- READINESS REPORT

BASELINE: `1356b1a` (PHASE 12.8 CLOSE, judgments `30_DAY_ARC_ENGINE = CONDITIONAL`, `RETROSPECTIVE_V1 = CONDITIONAL`, `30_DAY_FUN_READY = YES`).

This phase is **prep-only**: no NPC, trajectory, event family, Reality Bridge feature, or UI feature was added. No game code was touched. The only repository changes are this document and its two companion templates, plus a local git tag (not pushed) pinning the build under test. No blocking UI bug was found (§7 below), so no code fix was made or needed.

`30_DAY_FUN_READY = YES` from PHASE 12.8 means **the build is ready for a human to validate**, not that human fun has already been demonstrated. Nothing below should be read as claiming the second thing.

## 1. TEST BASELINE COMMIT

- Commit: `1356b1a1c5b1f791c772772492f9a94c4beb9b7b`
- Local tag: `phase-12-9-human-validation-baseline` (annotated, **not pushed** -- for internal reference only, so "which build did HV-0X play" is never ambiguous even if `master` moves on before all sessions finish)
- Every human-validation session in this round must run from this exact commit. If `master` advances before all 3-5 sessions are done, check out the tag for remaining sessions rather than testing a moving target: `git checkout phase-12-9-human-validation-baseline`.

## 2. TEST URL / LAUNCH METHOD

This is a local dev-server module inside a larger multi-module repo, not a deployed production build -- deliberately kept separate from whatever this repo's production/GitHub Pages build currently serves (per Section 17's explicit separation requirement). Do not send testers to any public production URL; the NEW LIFE CORE module under validation only exists on the local dev server.

**Desktop tester, same machine as the developer:**
1. `npm run dev`
2. Open `http://localhost:5173/?newlifecore=1`

**Phone/tablet tester, same Wi-Fi as the developer's machine:**
1. `npm run dev:lan`
2. Note the LAN URL Vite prints (e.g. `http://<machine-LAN-IP>:5173/`)
3. On the tester's device, open `http://<machine-LAN-IP>:5173/?newlifecore=1`

Live NPC dialogue (`useLive`) defaults **on** automatically whenever the app runs under `vite dev` -- no toggle needed for a normal test session. This requires the developer's machine to already have its Vertex dev-adapter credentials configured (already true in this environment; nothing tester-facing to set up). If live dialogue ever visibly fails, the deterministic fallback still renders a reply rather than hanging (existing test coverage, PHASE 12.x) -- if a tester's session shows a visibly broken/stuck reply instead of a fallback line, record it as a blocking bug per §16 of the phase directive, with a screenshot/description, and only then consider a scoped fix.

**Do not** pre-seed a save state, pre-configure the intake form, or otherwise touch state before a tester arrives -- start from a fresh browser context per §3.

## 3. TESTER INSTRUCTIONS (say this and nothing more)

Read verbatim, or as close as natural speech allows:

> 「知らない町で30日暮らすゲームです。好きに動いてみてください。」
>
> ("It's a game where you live in an unfamiliar town for 30 days. Feel free to move around however you like.")

That is the entire briefing. Do not additionally explain, even if asked directly before starting: the trajectory system, the recurring world/NPC-schedule engine, social memory, Reality Bridge, the Thinking Resident (Daisuke), or that anything is being judged/recorded internally at Day 30. If a tester asks "is there a goal?" or "what am I supposed to do?", the honest minimal answer is a repeat of the same line above, not an expansion of it -- the game itself is what's being tested for whether it can teach this without a manual.

Session length target: **20-40 minutes, or roughly in-game Day 3-5** -- whichever comes first. Do not push a tester toward Day 30 in this first round (§12). If a tester wants to stop earlier because they're naturally done for now, that itself is data (§5/§6) -- don't talk them into continuing.

## 4. OBSERVATION -- what to do during the session

Say as little as possible once the one-line briefing is given. Use `OBSERVER_SHEET_TEMPLATE.md` (duplicate one per tester, named `HV-01_observer.md`, `HV-02_observer.md`, ...) to record, live, in the tester's own words where possible:
- first place they went, first person they talked to
- whether they used free text, and roughly what they wrote (paraphrase is acceptable if verbatim isn't practical to capture live; prefer verbatim for anything striking)
- whether they revisited the same NPC
- where they hesitated or seemed lost
- any on-screen text they visibly skipped/didn't read
- any "back"/undo-style action
- moments where they said or visibly acted out not understanding something
- any spontaneous "what about tomorrow?"-type remark
- whether they found Reality Bridge on their own (never point them to it)
- whether they described an opportunity/offer as if it were a job/quest
- whether they noticed or remarked that the town moves on its own

Do not correct a tester's misunderstanding mid-session. Do not confirm or deny a guess they make about how the game works. A wrong guess, followed through, is itself the observation.

## 5. POST-PLAY QUESTIONS -- ask, don't lead

Use `POST_PLAY_QUESTIONS_TEMPLATE.md` verbatim, in order, Q1 through Q11 (extended this pass by the Feynman diagnostic -- see §11 below; the original Q1-Q9 content is unchanged, just renumbered/extended in place). These are the only questions to ask. In particular, never ask any of the following (they lead the witness):
- 面白かった？ / 良かった？ / 分かった？ / 覚えていて良かった？ -- any yes/no question that names a specific feature and invites approval.

If a tester's own free-text answer raises something interesting, it's fine to ask a genuine follow-up **in their own words** ("さっき『あの人また来るかな』って言ってましたけど、それはどのNPCのことですか？"), but never introduce a system name, mechanic, or feature the tester did not bring up themselves.

## 6. THE SIGNAL THAT MATTERS MOST

Not "did they say it was fun." **PLAYER PULL**: did the tester, unprompted, name a *specific* person, place, or open thread they want to return to ("あの人にまた会いたい", "あれどうなったかな", "次の日を見たい", "別のことを試したい")? A generic "まあ続けてもいいかな" with no named target is a weak signal and should be recorded as such, not rounded up to a strong one.

## 7. KNOWN CURRENT WEAKNESSES (carried forward honestly from PHASE 12.8 CLOSE, §11 there)

Tell no tester about any of these in advance. They exist here only so the person running the session can recognize, rather than be surprised by, a related observation:

- **Completionist saturation** -- all 3 trajectory seeds (Jin/Miyoko/Fumiko) can be taken to full depth simultaneously at a real but thin cost (neglecting NPCs who have no competing trajectory content of their own). §9 of the phase directive asks whether a first-time human actually feels pulled toward "collect everything" -- this is exactly the open question that finding could not settle from scripted traces alone.
- **Retrospective differentiation is thin specifically when two different play styles both produce zero career engagement** (found comparing two structurally similar no-engagement 30-day scripted traces) -- not reachable in a 20-40 minute / Day 3-5 session, relevant only if/when a tester reaches Day 30 (§12/second stage).
- Only 3 of the eventual 4-6 trajectory families exist (Jin, Miyoko, Fumiko) -- a tester who gravitates toward Yohei, Kamiya, Hina, or Daisuke as their "main" relationship will find comparatively less trajectory depth there. Worth recording as a real observation (§7 of the phase directive: does the player try to build a life around a character the game doesn't yet support?), not something to explain away in the moment.
- No blocking bug is currently known. The full newlifecore test suite (245 tests) and a 4-viewport visual gate of the Day30 screen both passed clean at this baseline. If a session surfaces a real blocking bug, record it with evidence per §16 of the phase directive before considering any fix -- do not fix speculatively.

## 8. PRIVACY / DATA HANDLING BOUNDARY

- Explicit opt-in required before any session is used for research purposes beyond immediate iteration -- same standard as the game's own existing Reality Bridge opt-in checkbox (off by default, gameplay identical either way).
- Testers are referred to only as `HV-01`, `HV-02`, ... in any report, comparison, or write-up. No name, and no other identifying detail, goes into a shared document.
- Free-text a tester types in-game (conversation input, the optional Day30 reflection) is the tester's own private input to the game, exactly as for any other player -- it is not to be pasted into an analysis document. If a specific line is genuinely needed as evidence for a finding, quote only that line, with the tester's separate, explicit permission, and keep it minimal.
- If Reality Bridge is used, its low or zero uptake in this small a sample is not itself a failure signal (§10 of the phase directive) -- report usage plainly, without editorializing about the rate.

## 9. WHAT HAPPENS IF A TESTER PUSHES BACK

Per the phase directive's most important rule (§15 there): when a tester is confused or critical, do not explain the mechanism to win them back over ("実はこういう仕組みで..."), and do not supply the good parts they didn't discover on their own. If they didn't find it, or didn't understand it, that is recorded as a finding against the game, full stop -- not corrected in the room.

## 10. AFTER 3-5 SESSIONS

Classify every finding using the phase directive's own four buckets before any development decision is made:
- **A. Multiple testers, same finding** -> strong improvement candidate
- **B. One tester only** -> hold as a hypothesis, not yet acted on
- **C. Runs opposite to the author's own expectation** -> highest-priority thing to look at
- **D. Tester understood once told** -> a UI/UX clarity problem, not a content problem

No feature or content development happens on this game until this round is reported and classified (§16 of the phase directive). PHASE 13 design, if any, comes only after.

## 11. FEYNMAN UNDERSTANDING DIAGNOSTIC (added: THINKING_GAME_FEYNMAN_UNDERSTANDING_DIAGNOSTIC_V0_1)

This is a diagnostic layer on top of the human-validation plan above, not a separate test round. Purpose: find out whether a tester can explain, in their own words, the game's goal, current state, cause of that state, and next intended action -- and where they can't, tell apart a deliberate design mystery from an accidental dead end. It is explicitly not a tutorial-planning pass; nothing here should produce added in-game explanation text on its own.

- `POST_PLAY_QUESTIONS_TEMPLATE.md` now runs Q1-Q11. Precisely, not as a blanket claim: STATE (Q2) and CAUSE (Q3) are the two genuinely new questions (neither was asked by the original Q1-Q9 at all); old Q4 (now Q6) and old Q5 (now Q7) were each minimally extended in place, not replaced (Q6 absorbed the GAP question's "try to explain it" framing; Q7 absorbed the NEXT question's "why"); every other original question is wording-preserved, renumbering only. See that file's own changelog note for the exact per-question mapping.
- `OBSERVER_SHEET_TEMPLATE.md` gained a "Understanding gap classification" section: the 11-category taxonomy (`INTENDED_MYSTERY`, `ACCIDENTAL_CONFUSION`, `GOAL_CONFUSION`, `STATE_CONFUSION`, `CAUSAL_CONFUSION`, `ACTION_CONFUSION`, `WORDING`, `UI`, `FEEDBACK`, `WORLD_CONTINUITY`, `UNKNOWN`) plus the rule for telling `INTENDED_MYSTERY` apart from `ACCIDENTAL_CONFUSION` (does the tester want to find out, or are they also stuck on what to do next), plus a gap-log table to fill in per session.
- `OPEN_ANOMALY_REVIEW_V1.md` (new) -- **corrected framing**: `OPEN_ANOMALY_REVIEW` is an already-existing cross-project standard, not something invented this pass. This file is New Life's own project-local application of that standard -- its governing question ("assuming every mechanic works exactly as designed, where could a player still form a wrong model of the world?") run against this specific game. No prior file by this name existed *within thinking-game* (checked before writing it), which only means New Life had no application of the standard yet, not that the standard itself is new; no new review mechanism was created. Contains 8 hypotheses, each tagged with a gap category and an INTENDED_MYSTERY/ACCIDENTAL_CONFUSION lean, 3 of them checked directly against current source this pass (NPC busy/closed ambiguity for some NPCs, no persistent money display, and the neutral wording of trajectory offers). Explicitly not acted on -- these are things to watch for, not scheduled fixes.

## Completion

Templates in this directory (`OBSERVER_SHEET_TEMPLATE.md`, `POST_PLAY_QUESTIONS_TEMPLATE.md`) are ready to duplicate per tester. Baseline is tagged and fixed. No code change was required or made.

**`NEW_LIFE_HUMAN_VALIDATION_READY`**
