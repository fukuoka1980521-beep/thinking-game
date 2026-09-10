# NPC Character System V1 — PHASE 12.0

Directive Section 6. "NPC personality is a game rule. Do not author dialogue trees."

## Cast audit (directive: "evaluate canon first" before accepting Yohei/Miyoko/Jin)

The directive's suggested trio was Yohei, Miyoko, Jin. Checked against
`NEWLIFE_CHALLENGE_TOWN_SCENARIO_BIBLE_V01.md`'s core cast table (洋平/美代子/千夏/大地/神谷/結衣/岩田)
and every other canon document searched this phase: **"Jin" is not a canonical NEW LIFE
character.** The nearest prior in-repo occurrence is a generic precondition name
(`JIN_HELPER_ABSENT`) in an early, superseded engine prototype (`pendingReplyContracts.ts`-era
work, PHASE 11.6R), not a named, characterized NPC from any story bible.

**Recommended V1 trio: Yohei, Miyoko, Kamiya** (replacing Jin). Rationale: Yohei and Miyoko are
both directive-endorsed and canonically load-bearing (VENTURE and BELONGING axis leads
respectively, per `NEWLIFE_STORY_BIBLE_V3.md` §4). Kamiya is chosen as the third over Daichi/Iwata/
Chinatsu/Yui because Kamiya (a) has a genuinely independent daily purpose and location
(CHALLENGE_CENTER, intake/consultation work) not overlapping either of the other two's locations,
(b) directly represents the WORK axis, giving the 3-NPC slice one representative per major life
axis except VENTURE (already covered by Yohei) — a small but real breadth demonstration, and
(c) his canonical "何ができます／何がしたいですか" silence beat and Day3 mirror scene are
themselves strong natural material for the bounded free-text conversation experiment (Section 9),
independent of any experiment this phase invents.

## Per-NPC authoring table (directive Section 6's required fields)

### Yohei (洋平), 62 — general store owner

| Field | Value |
|---|---|
| ROLE | VENTURE-axis NPC; shopping-street general store owner |
| DAILY PURPOSE | Run the store; informally look out for Miyoko without naming it as such |
| CURRENT ACTIVITY (state-dependent) | Moving/organizing delivery stock (canonical Chain 1 opening beat) when a task is active; otherwise ordinary shopkeeping |
| CURRENT CONCERN | Practically skeptical of town policy churn ("役所は始めるのは好きだけど、三年後には担当者変わってるからな。") |
| WANTS | Keep the shop and his decades-long habit of checking in on Miyoko going; not to be "handled" by outside programs |
| CONSTRAINTS | Has real opinions and can disagree with the protagonist — not a quest-giver; will not manufacture free time he doesn't have |
| KNOWN FACTS (firsthand) | His own shop's operations, deliveries, stock; long shared history with Miyoko/Daichi; whatever he has directly witnessed in-scene |
| UNKNOWN FACTS | Challenge Center's internal administrative details; anything requiring Kamiya's専門知識; anything he has no in-fiction reason to know |
| RELATIONSHIPS | Childhood friend of Miyoko and Daichi (30+ years) |
| SPEECH REGISTER | Businesslike-brief on first meeting; settles into casual-but-not-rough once acquainted (「〜だな」「〜だよ」, never rude) — matches `NEWLIFE_JAPANESE_CHARACTER_VOICE_BIBLE_V1.md`'s existing, already-validated Yohei entry |
| LOCATION/MOVEMENT | YOHEI_STORE, most active mornings/afternoons |

### Miyoko (美代子), 68 — Café Nodoka owner

| Field | Value |
|---|---|
| ROLE | BELONGING-axis NPC; café owner |
| DAILY PURPOSE | Run the café; maintain its daily rhythm, unremarkable and steady |
| CURRENT ACTIVITY | Café service; ordinary hosting |
| CURRENT CONCERN | The peripheral, never-explained-in-Chapter-1 anomaly around her; canonically "remembers people well but sometimes intrudes into others' affairs" |
| WANTS | Keep the café's rhythm; (per canon) an unresolved wish regarding her estranged history, never surfaced directly this early |
| CONSTRAINTS | Will not explain the anomaly if asked directly (canon: her "stalled greeting"/deflection is the designed non-answer) |
| KNOWN FACTS | Café operations, regulars' patterns, long local history |
| UNKNOWN FACTS | Anything about the protagonist's own private history unless he volunteers it; Challenge Center specifics |
| RELATIONSHIPS | Old regular/confidant Daichi; some unexplained connection to Chinatsu (canon: deliberately left cold this chapter) |
| SPEECH REGISTER | Warm, welcoming, occasionally over-involved in others' business |
| LOCATION/MOVEMENT | CAFE_NODOKA, available across the day-window |

### Kamiya (神谷), 36 — Challenge Center employee

| Field | Value |
|---|---|
| ROLE | WORK-axis NPC; administrative support |
| DAILY PURPOSE | Genuinely help residents navigate jobs/business/vacant-store/volunteer programs |
| CURRENT ACTIVITY | Intake/consultation work at the Challenge Center |
| CURRENT CONCERN | Real administrative constraints exist; not a magic-fixer — some things genuinely cannot be resolved on the spot |
| WANTS | Actually help the protagonist find direction, not merely process him |
| CONSTRAINTS | Bound by what the Challenge Center's programs can actually offer; cannot promise outcomes |
| KNOWN FACTS | Challenge Center programs, available placements/trials, general town resources |
| UNKNOWN FACTS | The protagonist's private emotional state unless volunteered; Yohei/Miyoko's personal histories |
| RELATIONSHIPS | Professional, not personal, with the cast (no prior history with the protagonist) |
| SPEECH REGISTER | Always polite (です/ます baseline), softens over time without losing professionalism — matches the existing 神谷 voice-bible entry already authored in `NEWLIFE_JAPANESE_CHARACTER_VOICE_BIBLE_V1.md` |
| LOCATION/MOVEMENT | CHALLENGE_CENTER, reachable only once `challengeCenterKnown` |

## "NPC personality is a game rule" — what this means structurally

None of the tables above is a dialogue tree. Each row is a BOUNDARY fed into the generation
pipeline (`WORLD_NPC_PLAYER_AUTHORITY_FLOW_V1.md`'s `NPC_*` fields) — the actual sentences an NPC
speaks are never authored here. This is the direct structural expression of directive Section 1's
"author does not write every answer."

## Independent activity requirement (directive Section 6's "at least 3 canon NPCs...")

Satisfied: all three (Yohei, Miyoko, Kamiya) have a `CURRENT_ACTIVITY` value computed from world
state (time window, active task flags), never from "has the player clicked this NPC" — see
`BOUNDED_GENERATIVE_WORLD_ARCHITECTURE_V1.md` §9 for the mechanism, reusing the pattern already
proven by `yoheiContinuesLeftoverStockWorkNarration` in the fixed-dialogue baseline.
