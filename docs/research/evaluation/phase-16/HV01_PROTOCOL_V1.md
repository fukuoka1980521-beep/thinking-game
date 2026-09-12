# HV-01 -- HUMAN VALIDATION PROTOCOL

BASELINE: `57032ae` (PHASE 16 CLOSE + live-model acceptance check, `READY_FOR_EXTERNAL_HUMAN_VALIDATION = YES`).

STATUS: development frozen. This is a protocol document only -- no session has been run, no observation data exists yet. This file is meant to be followed live by whoever administers the session, filled in with real observations, and the completed copy becomes the actual HV-01 report.

**Why this exists as a template rather than a completed report**: HV-01 requires a real, first-time human player reacting genuinely to the build. Nothing in this codebase (including Claude) can supply that -- any simulated "tester" quote or behavior would be fabricated, not observed, and would be indistinguishable from real data to a future reader. This protocol exists so a real session can be run and recorded faithfully.

---

## 0. Before starting

- Confirm the tester has never seen this build, this codebase, or any design discussion about it.
- Have the build running and reachable (`npm run dev`, `?newlifecore=1`).
- Have this document open for the OBSERVER to fill in live -- the tester should not see Sections 3 or 6 (special watch items) at any point, before or after.
- Decide who is the OBSERVER (records behavior, asks questions) before starting -- do not let the tester read this protocol.

## 1. Tester briefing -- SAY ONLY THIS

> 「知らない町で30日暮らすゲームです。好きに動いてみてください。」

**Do not explain, even if asked:**
- objectives
- trajectories (job/opportunity system)
- events (Moment Events / Event Threads)
- Fortune House
- the Big Choice moment
- relationship mechanics
- the Day-30 retrospective
- what the tester is "supposed" to do

**If the tester is confused**: record the confusion (what they said, what they tried, how long they hesitated) in Section 2.3. Do not rescue the product by explaining it. A tester who quits from confusion is itself a valid, important finding -- do not prevent that outcome by intervening.

## 2. Session

Target ~20-40 minutes, or roughly in-game Day 3-5 if reached naturally. **Do not require completing 30 days.** Let the tester stop whenever they want to stop (see 2.9).

### 2.1 What the tester tries first
_(fill in: first action, first location, first NPC talked to, in their own order)_


### 2.2 Places/NPCs revisited voluntarily
_(fill in: which locations or NPCs did the tester choose to go back to without being prompted, and roughly when)_


### 2.3 Moments of hesitation or confusion
_(fill in: exact moment, what was on screen, what the tester said or did, how it resolved -- did they figure it out, ask you, or give up on that path)_


### 2.4 Does yesterday's event read as continuing today?
_(fill in: did the tester notice/react to a carried-over consequence, e.g. the shelf being fixed, a local problem still open, a thread continuing? Quote their reaction if any.)_


### 2.5 Do event scenes feel different from ordinary conversation?
_(fill in: when a Moment Event / local problem / Event Thread action appeared, did the tester's behavior or comments suggest they noticed something was "happening" vs. just browsing dialogue options?)_


### 2.6 Fortune House reaction (if encountered)
_(fill in: did they choose to go there on their own? What did they say when they saw the card picker? Any reaction to the card reveal or the opening question?)_


### 2.7 Big Choice reaction (if encountered)
_(fill in: did they notice the "この返事で、しばらく生活が変わるかもしれない。" line? How long did they pause before answering? What did they say, if anything, while deciding?)_


### 2.8 Does the tester seem to feel they must visit everywhere?
_(fill in: observable behavior only -- e.g. systematically checking every location every day vs. skipping places freely. Do not infer an unspoken feeling; note only what was said or done.)_


### 2.9 Any moment they wanted to stop
_(fill in: exact moment, what prompted it -- boredom, confusion, natural session-length fatigue, or something else observable)_


### 2.10 Spontaneous future-oriented comments
_(fill in: exact quotes only, e.g. wanting to meet someone again, wondering what happens next, wanting to see the next day, wanting to try a different choice. Do not paraphrase into a stronger claim than what was said.)_


## 3. Special watch items -- DO NOT TELL THE TESTER, observer notes only

These exist to catch specific authored hypotheses without leading the tester toward them. Record only what naturally surfaces; do not ask about these directly.

- **Completionist saturation**: does the tester try to "complete" or "finish" every location/NPC, or do they move on freely?
- **Fortune House conversational specificity**: does Shizuko's live dialogue feel generic/repetitive to the tester, or specific to what they said? (Only note if the tester comments on this unprompted, or if directly asked in Q8 the answer touches on it.)
- **Big Choice perceived neutrality**: does the tester feel pushed toward one answer, or genuinely free? (Only from their own words, never from a leading question.)
- **Thin differentiation between low-engagement life paths**: if the tester ignores most systems, does the resulting experience still feel like "a life," or does it feel empty/repetitive?
- **Only three trajectory families visible**: does the tester notice (or fail to notice) that the "opportunity" system only has 3 possible paths (Jin/Miyoko/Fumiko)?

## 4. Post-play questions -- ask in order, record answers close to verbatim

**Q1.** 今、何をしているゲームだと思いましたか？

**Q2.** 一番覚えている人は誰ですか？なぜですか？

**Q3.** 一番覚えている出来事は何ですか？

**Q4.** 分かりにくかったところはどこですか？

**Q5.** 次に開いたら何をしたいですか？

**Q6.** もう一度やるなら、誰に会う／どこへ行くと思いますか？

**Q7.** やめたくなった瞬間はありましたか？どこですか？

**Q8.** 自由に話せるところについて、どう感じましたか？

**Q9.** 続きを遊びたいですか？ YES / MAYBE / NO -- 理由も聞く。

## 5. Finding classification

Tag every finding after the session, not during:

- **A** = multiple testers / strong repeated signal
- **B** = single tester / hypothesis only
- **C** = contradicts author expectation / highest-priority learning
- **D** = explained-and-understood / likely UI or communication issue, not a design problem

**For HV-01 specifically: almost every finding should stay classified B** (this is the first and only session so far) unless something is clearly C (directly contradicts what PHASE 15/16's own CLOSE reports assumed would happen).

## 6. Final report structure (fill in after the session)

- Direct observations (from Section 2, behavior only)
- Exact tester quotes (verbatim, wherever the tester's own words are available)
- Post-play answers (Section 4, close to verbatim)
- Observer interpretations, **clearly separated** from the above (label these explicitly as interpretation, not fact)
- Hypotheses arising from this session -- **not fixes**. Do not propose code changes in this report.
- Strongest positive signal
- Strongest negative signal
- Biggest surprise (something that didn't match what the team expected going in)
- Evidence of DAY-NEXT-PULL (or its absence) -- tie this to Section 2.10 and Q5/Q6/Q9 specifically
- Recommendation: **CONTINUE HV** (run HV-02+ before deciding anything) or **STOP FOR DEFECT** (something concrete enough to warrant pausing HV and returning to development)

**Do not implement anything based on this session's findings without a separate, explicit decision to do so.** A completed HV-01 report should be returned for review before any code changes are considered.
