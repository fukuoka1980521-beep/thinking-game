# BLIND AI VALIDATION PROTOCOL V1

Date: 2026-09-24
Status: ACTIVE DESIGN GATE

## Why this gate exists

Owner human playtesting is necessary but not sufficient.

A product can become highly coherent for one person's:
- communication style;
- tolerance for ambiguity;
- problem-solving habits;
- preferred tone;
- moral intuitions.

That can be valuable as a deliberate niche product, but it must be a conscious product decision rather than accidental overfitting.

Therefore NEW LIFE uses two separate evidence tracks:

1. **OWNER FIT**
   - Does the product feel natural and useful to the Owner?
   - Owner feedback is preserved as first-class evidence.

2. **GENERALIZATION FIT**
   - Does the design remain coherent for players who are more direct, avoidant, skeptical, analytical, playful, or less verbally skilled?
   - This must be checked without revealing which path came from the Owner.

Neither automatically overrides the other.

## Blindness rules

An AI blind reviewer must not be told:
- which path was produced by the Owner;
- which path the designer considers successful;
- previous pass/fail judgments;
- target lesson names;
- the Owner's background, work, personality, or communication preferences.

The reviewer receives only:
- case facts;
- candidate paths;
- consequence model;
- neutral evaluation questions.

## Required AI roles

At least two independent review runs:

### Reviewer A — Game-systems/generalization
Focus:
- agency;
- causal consequences;
- multiple viable play styles;
- game feel;
- overfitting risk.

### Reviewer B — Adversarial human-behavior
Focus:
- impatient/direct/avoidant/skeptical players;
- whether the system moralizes;
- whether NPC reactions are believable under non-ideal input;
- exploitability and forced "nice" answers.

Preferred:
- use a model/run that did not author the packet;
- separate run/context for each reviewer.

## Verdict handling

Do not average away disagreement.

If reviewers disagree, record:
- where;
- why;
- which design assumption produced the disagreement.

Implementation gate requires:
- Owner opening/play path is coherent;
- at least one external/blind AI reviewer finds no structural blocker;
- adversarial reviewer does not find a single "approved personality" required to succeed;
- believable failure and at least one recovery path exist.

## Product strategy note

If later evidence shows the design works unusually well for the Owner's style but less broadly, two valid strategies remain:

A. General product:
- broaden successful player styles.

B. Deliberately opinionated product:
- make the distinctive thinking style explicit as the game's identity.

Do not drift into B accidentally.
