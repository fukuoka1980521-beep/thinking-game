# OPEN ANOMALY REVIEW -- New Life (project-local application, V1)

**Provenance note (corrected)**: `OPEN_ANOMALY_REVIEW` is an already-existing cross-project standard/methodology, not something this document invents. A full-text search of *this repository* (tracked files, working tree, and history) found no prior file by this name *within thinking-game* -- that search only establishes that New Life had no project-local application of the standard yet, not that the standard itself is new. This document is that project-local application: New Life's own observation-hypothesis artifact, produced by running the existing standard's governing question against this specific game. It is not a new review mechanism, and it does not define or modify the standard itself -- it is meant to be read and extended by future New Life phases the way any other project-local application document would be.

**Governing question** (asked of the game as it stands, not changed to answer it): *assuming every mechanic here is working exactly as designed, are there places where a player would still build a wrong model of the world?*

**Ground rules for this document**:
- Every item below is a **hypothesis to watch for during human validation**, not a confirmed finding. None of them justify a tutorial, explanation text, or mechanic change on their own -- that would be exactly the over-explaining the diagnostic task explicitly prohibits.
- Each item is tagged with its most likely gap-location category (from the taxonomy now in `OBSERVER_SHEET_TEMPLATE.md`) and a best-guess INTENDED_MYSTERY vs. ACCIDENTAL_CONFUSION lean -- the lean is a prediction to test, not a verdict.
- Items marked **[code-verified]** were checked directly against the current source this pass. Items marked **[structural]** are reasoned from the existing, already-documented design (PHASE 12.3-12.8 CLOSE reports) but were not re-verified line-by-line this pass.

## 1. NPC "busy" vs. "closed" may be indistinguishable for some NPCs [code-verified]

`content/day1.ts`'s `npcAvailabilityAt` produces both `BUSY` and `CLOSED` states, and for some NPCs (Kamiya, Jin) `BUSY` gets an explicit "待つ" (wait) action alongside its ambient line -- a clear "come back very soon" signal. For others (Yohei, Daisuke), `BUSY` returns the *same shape* as `CLOSED` (an ambient line, zero actions, zero NPCs present) -- e.g. Yohei's `BUSY` line is "洋平は伝票の整理で手が離せないようだった" with nothing else on screen, identical in structure to his `CLOSED` line. A player has no in-game way to tell "he's tied up right now, try again later today" from "the shop is done for the day" for these NPCs specifically.
- Category: `STATE_CONFUSION` / `WORLD_CONTINUITY`
- Lean: likely `ACCIDENTAL_CONFUSION` if a tester leaves and never returns same-day believing the shop is closed for the day when it wasn't -- but only a real observation can confirm whether anyone actually acts on this distinction at all in a 20-40 minute session.

## 2. No persistent money display [code-verified]

`money` is only ever shown inside the shopping picker, at the moment of a purchase. There is no always-visible balance anywhere else in the UI (topbar, sidebar, etc.) -- confirmed by search of `NewlifeCoreApp.tsx`.
- Category: `STATE_CONFUSION` / `FEEDBACK`
- Lean: likely `ACCIDENTAL_CONFUSION` if a tester tries to reason about affordability before opening a shop screen and can't -- but this may simply never surface as a felt problem in a short session with few purchases, in which case it's a non-finding, not a false negative.

## 3. Trajectory offers ("話を聞いてみる") deliberately avoid quest language, but the underlying shape (a person asks, you accept/decline, a reward sometimes follows) still resembles a quest system from genre convention [structural]

The wording itself was a deliberate PHASE 12.7 design choice specifically to avoid quest-board framing (confirmed this pass: the actual button label is the neutral "話を聞いてみる", never "クエストを受注" or similar). But this is exactly the open question the existing Human Validation §8 (`opportunityを仕事/クエストだと感じたか`) already asks about directly -- this item does not add a new observation, it explains *why* that existing item is worth taking seriously: wording alone may not be sufficient to prevent a player pattern-matching to "quest" from outside experience.
- Category: `GOAL_CONFUSION` / `ACTION_CONFUSION` / `WORDING`
- Lean: genuinely unknown -- this is precisely what the existing observation item is for.

## 4. "Experience before label" makes the cause of an offer's sudden appearance invisible by design [structural]

An opportunity only surfaces after repeated *unlabeled* ordinary help actions cross an internal threshold (PHASE 12.7). Nothing on screen counts this down or hints "keep doing this." A player who reaches the threshold sees the offer appear with no visible antecedent -- from their side, "I helped a few times, then suddenly this new choice existed."
- Category: `CAUSAL_CONFUSION`
- Lean: this is the sharpest INTENDED_MYSTERY-vs-ACCIDENTAL_CONFUSION test case in the whole game. If a tester notices the offer appeared *because* they'd been helping repeatedly (even without knowing the exact number), that's `INTENDED_MYSTERY` working as designed. If a tester is surprised in a way that reads as arbitrary ("this just popped up") with no sense of having caused it, that's `ACCIDENTAL_CONFUSION` against a mechanic this phase's PHASE 12.7/12.8 CLOSE reports treated as a settled design strength -- worth watching precisely because the author's own prior judgment could be wrong here (Section 6 of the directive: "作者の想定と逆" is the highest-priority bucket).

## 5. Stepping back from a trajectory silently reverts action labels and offer eligibility [structural]

`stepBackFromTrajectory` clears the accepted flag (relabeling "work" language back to "help" language) while permanently preserving the fact that the player once stepped back (PHASE 12.8's `_ever_stepped_back` flag). Nothing tells the player "your relationship with this just changed category" at the moment of stepping back beyond whatever the stepback action's own result text says.
- Category: `STATE_CONFUSION` / `CAUSAL_CONFUSION`
- Lean: likely low-risk (`INTENDED_MYSTERY`-adjacent, since stepping back is always a deliberate player-initiated action, not something that happens to them) -- listed for completeness rather than strong suspicion.

## 6. Declining an opportunity produces no framing at all, by design [structural]

PHASE 12.7 explicitly built decline as a first-class, unpunished, silently-resolved choice with zero negative text. A player unfamiliar with this design norm may read total silence as "nothing happened" / a possible bug, rather than "your choice was respected."
- Category: `FEEDBACK` / `ACCIDENTAL_CONFUSION` (candidate)
- Lean: this is exactly the directive's own §3 boundary case (silence + player understood their choice was honored = fine; silence + player doesn't know if anything registered = real problem) -- cannot be resolved without a real decline observation, which no current trace/test captures from a human's felt perspective.

## 7. Reality Bridge has zero discovery surface -- it only ever emerges from a player's own real-life-shaped phrasing to Daisuke [structural]

There is no hint anywhere that this exists; it is reachable only by a player happening to write something real-life-concern-shaped in free text to Daisuke specifically. A player who never does this will see literally nothing related to it, with no signal that anything was missed.
- Category: `WORLD_CONTINUITY` (in the sense of: this content-branch's existence is itself invisible) -- explicitly **not** to be treated as a failure if uptake is low or zero (directive §10 says so directly).
- Lean: `INTENDED_MYSTERY` by design intent -- worth recording only if a tester actively wanted this kind of outlet and could not find any way to express it, which would be a different, more specific finding than "didn't use it."

## 8. Day30 retrospective's factual sentences could still read as a verdict despite the no-personality-inference guarantee at the mechanism level [structural]

PHASE 12.8 verified mechanically that the retrospective never infers personality/rank/ending-type -- but a sentence like "特定の仕事や役割は、結局持たなかった" (never settled into a job or role) is still a sentence *about the player*, and tone/wording risk is a different axis from mechanism-level correctness. This is squarely a Section 12 (second-stage, Day30-only) concern, not reachable in the first 20-40 minute round.
- Category: `WORDING`
- Lean: unknown; explicitly deferred to the second-stage 30-day sessions per the existing Human Validation plan (§12 there) -- listed here now so it isn't forgotten when that stage starts.

## How to use this during a session

Do not brief testers on any of the above. Do not steer observation toward confirming these specific items over anything else that comes up naturally -- an anomaly not listed here is exactly as valid a finding as one that is. When something in this list is actually observed, log it on the observer sheet's gap-classification table like any other gap, and note in the free-text cell that it matches one of these numbered hypotheses (e.g. "matches anomaly review #1") so the eventual PHASE 13 classification (§16 of the human-validation directive: A/B/C/D buckets) can see which predictions held up and which didn't -- item 4 in particular is the one this review most wants tested, since it runs against the author's own prior judgment.
