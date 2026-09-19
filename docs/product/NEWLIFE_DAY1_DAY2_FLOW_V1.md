# NEW LIFE — Day 1 + Day 2 Flow V1 (PHASE_22)

Scene-level flow design, per directive Sections 7-13. Design-only; no code written. Reuses the
existing scene structure (`scene.ambientLine` → NPC card → structural actions → optional free
talk → leave), not a new UI pattern.

## Day 1 flow

```
ARRIVAL
  short visual orientation (仮住まい, 1-2 lines, no system explanation)
  ↓
CHOOSE (2 destinations reachable: 洋平商店, 商店街 -- both visible, no forced order)
  ↓
ACTION 1 -- player picks ONE
  ├─ 洋平商店 path: see "Yohei scene" below
  └─ 商店街 path: see "Hina scene" below
  ↓
ACTION 2 -- the OTHER of the two (or the same one again, or LEAVE if the player wants a quiet day --
             never forced to use both actions on new content)
  ↓
EVENING (仮住まい, 1 line: one concrete thing to wonder about tomorrow, drawn from whichever
         scene(s) actually happened)
  ↓
NEXT DAY
```

The player is never forced to meet both Hina and Yohei on Day 1 (directive Section 7's explicit
"do not force the player to meet both"). If they spend both actions at 洋平商店 (e.g. once
ordinary, once re-engaging), that's a fully valid Day 1.

### Yohei scene (per directive Section 12's required shape)

```
ARRIVAL       -- player enters 洋平商店 (location hero shown, ambient line: delivery hasn't come)
CONTEXT       -- Yohei's opening line acknowledges the player as new, mentions the delivery in
                 passing (not as a hook, just as what's actually happening)
INTERACTION   -- structural actions shown: [買い物をする] [配達のことを気にかけておく] [自由に話す]
                 [立ち去る] -- never just "talk" as the only option
REACTION      -- whichever action was taken gets a real, specific reply (a purchase confirmation,
                 an acknowledgment of the delivery choice, or an AI free-talk reply)
OPTIONAL CONTINUATION -- "もう少し話す" only after at least one structural action, never as the
                 first thing offered (directive Section 11's explicit rule)
LEAVE         -- farewell line appears ONLY here, never mid-scene (directive Section 12's explicit
                 "farewell only on leave" rule -- the direct fix for the previously-identified
                 GREETING→CHAT→PREMATURE FAREWELL→PROMISE pattern)
```

### Hina scene (same shape, different content)

```
ARRIVAL       -- player enters 商店街, sees Hina's shop-in-progress (visibly unfinished, per asset
                 spec)
CONTEXT       -- her opening line is about the shop specifically (not a generic greeting) --
                 e.g. she's mid-task, glances up, says something concrete about today's setup work
INTERACTION   -- structural actions: [様子を見る] [手伝う] [自由に話す] [立ち去る]
REACTION      -- a specific reply per action (watching produces a small, concrete observation;
                 helping produces a small, specific outcome -- never a generic "thanks")
OPTIONAL CONTINUATION -- "もう少し話す" after a structural action
LEAVE         -- farewell only here
```

## Day 2 flow

```
MORNING (仮住まい) -- one line establishing this is a new day, distinct from Day 1's arrival framing
  ↓
CHOOSE (same 2 destinations, now in a genuinely different state -- see event spec)
  ↓
ACTION 1 + ACTION 2 (same shape as Day 1, different content)
  ↓
EVENING -- one line reflecting what actually happened today (not a repeat of Day 1's evening line)
  ↓
[END OF SLICE -- no Day 3 in this phase]
```

### The Day 2 world-change proof point (directive Section 8, non-negotiable for this slice)

Whichever of the two locations the player did NOT visit on Day 1 must show a real, checkable
difference on Day 2 -- not merely different wording from an NPC, but a state the player can notice
independent of talking to anyone (the delivery having arrived at 洋平商店, per the event spec) or,
if the player skipped 商店街 instead, Hina having made visible progress on the shop
(fewer visible unpacked boxes, one new fixture in place -- a location-visual difference, not just
a line of dialogue, per directive Section 8's explicit "do not fake this only with different
dialogue wording").

## Core loop trace (directive Section 13 -- every arrow must be present)

| Loop step | Where it happens in this slice |
|---|---|
| NOTICE | Day 1 arrival line; Day 2 morning line |
| CHOOSE | The 2-of-2 destination choice, both days |
| GO | Location transition (existing `moveTo`-equivalent) |
| INTERACT | The Yohei or Hina scene's structural actions |
| SOMETHING CHANGES | The delivery event's WorldFact / Hina's shop-progress state |
| REMEMBER | Yohei's/Hina's Day 2 opening line referencing what happened (or didn't) on Day 1 |
| WONDER ABOUT TOMORROW | Day 1's evening line (delivery still pending, or the small
  cross-location Hina/Yohei connection) |

No arrow is missing. This table is the slice's own self-check against directive Section 13's hard
requirement.

## No-free-talk path (directive Section 17's hardest test)

A player who never opens free talk still experiences: arrival, a real choice of destination, a
concrete interaction with a structural reply, the delivery event (ambient + optional structural
choice, no chat required), and a Day 2 state change they can see without asking anyone anything.
**The slice is designed to be fully coherent with zero AI-generated text**, using only the
deterministic adapter -- this is a design requirement checked here, and a testable claim to verify
once implemented (see `NEWLIFE_DAY1_DAY2_TEST_MATRIX_V1.md`).
