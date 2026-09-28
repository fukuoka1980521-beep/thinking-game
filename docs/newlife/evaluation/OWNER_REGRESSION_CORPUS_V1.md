# NEW LIFE Owner Regression Corpus V1

Purpose: preserve real owner-observed conversation failures as semantic regression evidence. These are NOT exact-string expected outputs.

## Cases

| ID | Context | Player utterance | Failure previously observed | Pass semantics |
|---|---|---|---|---|
| O-01 | Hina / trial staffing | ?????????? | recited that she bakes/sells alone instead of answering sufficiency | gives Hina's direct current estimate first; may add one reason; does not turn estimate into objective fact |
| O-02 | Hina / trial | ??????????? | responded with unrelated counting / ??????? | recognizes encouragement/wish and responds socially in context |
| O-03 | Yohei / shop | ????????????? | replied with disconnected numbers 12/18/30 | answers recommendation request using only known/allowed context, or naturally states what he can recommend |
| O-04a | Miyoko / cafe | ???????????? | first answer could mention scone/cookie | establishes an edible-item antecedent |
| O-04b | same conversation | ???? | lost antecedent and asked what the player meant | resolves ???? against immediately preceding food context without requiring noun repetition |
| O-05 | any NPC | typo / colloquial wording | brittle routing | recovers likely human meaning when unambiguous; does not demand canonical phrasing |
| O-06 | any NPC | two related intents in one turn | single-intent router drops one | responds coherently to both when reasonable, without database-style enumeration |
| O-07 | all six canonical NPCs | ordinary free talk | Jin/Daisuke previously outside validated generative path | all six use the same chat-first path while retaining distinct persona and truth boundaries |

## Scoring rubric (0/1 each)

A. Directness ? answers the actual conversational act.
B. Context ? uses relevant recent dialogue, including pronouns/ellipsis/????.
C. Persona ? sounds like the target person, not a generic assistant.
D. Truth ? no invented consent, promise, authority, completed action, or unsupported world fact.
E. Economy ? no unnecessary canon dump.
F. Variation ? not a canned repeated stock reply.
G. Continuity ? leaves a plausible next conversational turn.

Hard gate: D must be 1.
Quality gate for blind comparison: mean A+B+C+E+F+G must improve over the deterministic/hybrid baseline. Do not tune against exact wording.

## Hypothesis record

Observation: owner judged the earlier chat experiment natural, while productized routing repeatedly produced semantic drift.
Hypothesis: generation-first dialogue with scene/persona/recent context will outperform intent-first deterministic routing.
Alternative explanations: insufficient scene context; weak persona dossiers; rate-limit fallback; missing memory; prompt overconstraint.
Falsifier: no meaningful blind-quality improvement, or unacceptable truth violations.
Minimum test: run O-01..O-07 on both paths, multiple seeds/runs where generation is stochastic, blind labels, then compare rubric results.
Decision rule: keep chat-first only if it improves human conversational quality without violating Truth gate.
