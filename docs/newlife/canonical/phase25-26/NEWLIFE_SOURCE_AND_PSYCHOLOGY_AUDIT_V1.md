# NEW LIFE Phase 25 — source and psychology audit

Date: 2026-09-20. Scope: character/event research and design only. This is a proposal, not a change to playable canon or code.

## Audited game material

1. `NEW_LIFE_30DAY_OWNER_PLAYTEST_PACKAGE_V2.zip`: `NEWLIFE_30DAY_OWNER_PLAYTEST_HOWTOPLAY_V1.md` and `NEWLIFE_30DAY_OWNER_GAME_MASTER_V1.md` (the supplied playtest copy; the GM file calls itself V1). Six characters: Hina, Yohei, Daisuke, Jin, Miyoko, Fumiko. The present system advances through 30 preauthored days, with evidence lists and fixed story gates. Its stated rule is “system owns truth, AI owns expression.”
2. `NEW_LIFE_SECOND_EVALUATOR_ALL_V2.txt`: bundled Phase 24 provenance, character arcs, story spine, state ledger, rules, and RUN_A/B/C. Its provenance audit attributes only three episodes to documented Owner development history, all other 47 to original fiction; it explicitly did not inspect original thinking-os consultation records. These are **claims of the earlier evaluator**, not independent verification of its missing `docs/DECISIONS.md`.
3. `PHASE_22_AI_SELF_PLAY_RAW_EVIDENCE_V1.md`: an earlier AI self-play, **not** an Owner consultation. It observed that a concrete box-carry action and a direct answer about shop timing held interest, while the conversation disappeared from view on exit. This supports an interaction design problem, not any claim about real human clients.
4. The Owner's Phase 25 instruction directly identifies ten patterns from his own work and game development. The visible Owner playtest messages additionally show specific business questions (“what are you selling?”, staffing, planned quantity and price) and the complaint that a response felt cold. These are direct Owner-provided sources; the pattern bank paraphrases them.

## Diagnosis grounded in these artifacts

- The old scripts describe a voice in one or two adjectives; they do not specify what each person initiates under changing interests or how the same question changes across relationships. The old six often require player evidence to surface their personal issues.
- The How-to-play describes Daisuke as a furniture/chair repairer. The GM voice block and Phase 24 arcs call him a barber. This is a **present source conflict**. Phase 25 selects furniture repair for its proposal; the canonical product remains unchanged until an approved later phase resolves it.
- The owner's direct questions about Hina's product, staffing, volume and pricing cannot be answered convincingly from the public opening. Canon contains a trial and a money-pressure fact but no reliable public quantity or price. An LLM forced to improvise will either invent a commitment or become evasive. The event proposal defines provisional public facts and explicitly permits “not decided” where true.
- A fixed Day 24 festival and automatic shop-readiness progression consume much of the suspense. The proposed three-event experiment lets the last decision depend on earlier behavior, with a valid no-player path and a genuine pause or separation outcome.
- The older provenance document says consultation and external tester files were not opened. This run has no authenticated original consultation transcript plus reuse provenance. **Verified REAL_CONSULTATION_CORE = 0; COMPOSITE_REAL = 0.** Generic conflict examples are labeled FICTIONAL_SYNTHESIS. This is a provenance gap, not a fictionalized consultation claim. No names, employers, places, ages or confidential quotes from consultations are copied into this package.

## External research used as descriptive design scaffolding

| Framework | Source inspected | Safe design use | Inference boundary |
|---|---|---|---|
| Big Five / Five-Factor | Oliver P. John & Sanjay Srivastava (1999), [original chapter PDF](https://jenni.uchicago.edu/econ-psych-traits/John_Srivastava_1995_big5.pdf) | Five broad *qualitative* tendencies and counterexamples in each NPC | Descriptive taxonomy; no diagnosis, invented scores, or deterministic behavior. |
| Interpersonal Circumplex | Jerry S. Wiggins, Paul Trapnell & Norman Phillips (1988), [original study DOI](https://doi.org/10.1207/s15327906mbr2304_8); Michael B. Gurtman (2009), [publisher article](https://compass.onlinelibrary.wiley.com/doi/10.1111/j.1751-9004.2009.00172.x) | Agency and communion distinguish disagreement, initiative, requests and repair | Describes interpersonal position, not moral worth or a fixed response to every actor. |
| Self-Determination Theory | Richard M. Ryan & Edward L. Deci (2000), [author-hosted article](https://selfdeterminationtheory.org/SDT/documents/2000_RyanDeci_SDT.pdf) | Specify how autonomy, competence and relatedness can be supported or threatened by a concrete event | Internal authoring guide only; never present need scores to the player or assume a precise causal law. |
| Person × situation | Walter Mischel & Yuichi Shoda (1995), [original paper](https://www.elaborer.org/cours/psy7124/lectures/Mischel1995.pdf), [journal DOI](https://doi.org/10.1037/0033-295X.102.2.246); William Fleeson (2001), [original paper PDF](https://simine.com/407/readings/Fleeson_2001.pdf) | Stable tendencies can yield different behavior under different appraisals and relationships; permit regression | Our state machine is **an original narrative design inference**, not a validated psychological predictor. |

## Source category rule

`OWNER_REAL_CORE` refers only to Owner-authored statements identifiable above. `REAL_CONSULTATION_CORE` requires an actual authorized, source-audited consultation record; none qualifies here. `COMPOSITE_REAL` requires two independently verified compatible real sources, also unavailable. `EXTERNAL_RESEARCH_PATTERN` is a general design inference from a cited framework, not an individual story. `FICTIONAL_SYNTHESIS` is invented narrative material, including things that merely *sound* like a consultation. Each NPC's life history and the proposed town incidents are fiction even if an abstract dilemma comes from the Owner.

## Access / preservation

The original ZIP and evaluation files were only read. No current game repository or `.git` checkout was available in the active workspace. These design files therefore cannot truthfully be reported as a commit in that game repository. No source code, art, UI or 30-day script was changed.