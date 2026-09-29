# NEW LIFE Human Comprehension Failure — Day 3 — 2026-09-29

Status: OWNER-OBSERVED PRODUCT FAILURE  
Source: live owner play / direct owner wording

## Raw owner observation

> 文子が会館に小さな掲示板を据え、「場所を貸すだけなら簡単、使った後まで考えるとね」と日付を入れる。美代子がコーヒーを持ってくるが、文子の「人が待つなら助かる」という言い方には返事を曖昧にする。
> 文子がこちらへ一瞬だけ視線を向け、「見ているだけでも記録にはなるわ」と独り言のように言う。意味が分からない会話

## Diagnosis

This failure originates in authored scene presentation, not in the live conversation model.

The hidden canonical design for Day 3 is actually specific:
- Fumiko is considering the waiting-location problem.
- Miyoko gives an ambiguous response rather than explicit consent.
- Fumiko may infer consent anyway.
- The system must keep Miyoko's actual reply separate from Fumiko's interpretation.

However, the player-visible wording compressed away the concrete referents:
- what place is being requested,
- who would wait there,
- what Fumiko is actually asking Miyoko to allow,
- what exactly Miyoko did or did not agree to.

The low-engagement hook then added a meta-sounding phrase ("見ているだけでも記録にはなる") that does not naturally belong to the immediate human situation.

Working mechanism:

**Hidden-design / visible-context gap (Context Compression Loss)**

A designer or AI can know the intended causal structure from hidden notes while producing player-facing prose that omits the very facts needed for a cold reader to reconstruct that structure.

This is a concrete subcase of Intent Decomposition Drift:
the implementation preserved the hidden rule ("ambiguous consent must remain ambiguous") but failed the higher-level experience goal ("the player understands what is happening").

## Repair

Day 3 presentation now explicitly shows:
- Fumiko looking at the waiting-location field,
- Fumiko asking whether some people can wait at Miyoko's café if the hall front gets crowded,
- Miyoko replying conditionally rather than consenting,
- Fumiko beginning to infer "a few may be okay",
- a natural player-facing hook asking whether that reply can really be written down as acceptance.

The underlying authority canon is unchanged:
only Miyoko can establish Miyoko's actual seating boundary.

## Research consequence

Add a player-visible context gate before calling a story scene complete.

A cold reader should be able to answer, from the visible scene alone:
1. Who wants what?
2. What concrete object/place/task is being discussed?
3. What did each person actually say/do?
4. What remains undecided or ambiguous?
5. Why is there a meaningful opening for the player to speak?

If these cannot be answered without reading hidden GM/design notes, the scene is not product-ready.
