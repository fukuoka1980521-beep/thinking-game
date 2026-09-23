# NEW LIFE — Phase 28 final conversation router V1

Date: 2026-09-22.

## Purpose
This finalizes the two human-found conversation failures as one coherent deterministic router:

1. A factual question such as 「おはようございます。どんな焼き菓子売るのですか」 must answer the semantic target first.
2. A directed conversational act such as 「口調が堅苦しいよ」 must acknowledge that act, not return an unrelated flavor line.

## Final routing order
1. Conversation-repair / tone-feedback acts that are about the interaction itself.
2. Meaning-first factual routing across the six tracked fact domains, using normalized natural-Japanese question/request detection.
3. Remaining directed conversational acts: compliment, criticism, agreement, disagreement, greeting, leave-taking.
4. Unmapped but clearly question/request-shaped input -> per-character clarification.
5. Generic flavor -> only genuinely content-light chatter/plain observation.

## Combined evidence
- Phase 28: NFKC + greeting/preamble normalization, 11 paraphrases x 6 fact domains = 66 routing cases, direct-answer-first checks, unknown-fact guard, UI smoke tests.
- Phase 28B: tone-feedback / repair / compliment / criticism / agreement / disagreement / greeting / leave-taking across all six NPCs; generic-flavor adjacency guard.
- Daisuke remains furniture/chair repair.
- Free talk remains read-only with respect to canonical world state.
- HUMAN_VALIDATION_STATUS = PENDING.

## Release boundary
Engineering verification can pass automatically. Product/human validation still requires the Owner to play the deployed candidate; AI tests are not substituted for that gate.
