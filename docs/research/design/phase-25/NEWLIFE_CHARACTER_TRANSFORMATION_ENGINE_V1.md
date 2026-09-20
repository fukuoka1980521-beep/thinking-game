# NEW LIFE — Character Transformation Engine V1 (PHASE_25, Sections 8-12)

## Section 8 — the state shape

Per character:

```
CHARACTER_STATE {
  stable_traits {              // SLOW-CHANGING, effectively fixed within one 30-day month
    openness, conscientiousness, extraversion, agreeableness, neuroticism,   // qualitative
    agency, communion                                                        // qualitative
  }
  beliefs {                    // CHANGEABLE
    working_assumption: <the character's FALSE_BELIEF/WORKING_ASSUMPTION from the model doc>,
    updated: bool,             // has this specific belief been revised this month?
    evidence_for_update: []    // named events/exchanges that could justify revision
  }
  needs_state {                // CHANGEABLE
    autonomy: { satisfaction: LOW|MED|HIGH, recent_threat: bool },
    competence: { satisfaction: LOW|MED|HIGH, recent_threat: bool },
    relatedness: { satisfaction: LOW|MED|HIGH, recent_threat: bool }
  }
  emotion_state {               // FAST-CHANGING, resets/decays scene to scene
    stress: LOW|MED|HIGH,
    defensiveness: LOW|MED|HIGH,
    confidence: LOW|MED|HIGH
  }
  relationships {                // DIRECTIONAL, per actor — see NEWLIFE_NPC_RELATIONSHIP_GRAPH_V3
    <other_npc>: { warmth, trust, misreading, ease }   // qualitative, this character's OWN view
  }
  open_threads []                // event-dependent, e.g. "hasn't asked for help yet",
                                  // "Fumiko/Jin tension unresolved"
  memories []                    // specific remembered interactions, named, not vague feelings —
                                  // e.g. "player sat with me after the wiring incident, said nothing,
                                  // stayed anyway" — referenceable verbatim later, per the existing
                                  // callback-as-core-mechanic discipline
  commitments []                 // promises made, to whom, roughly when due
  transformation_axis_progress: NONE | ATTEMPTED | REGRESSED | ADVANCED | REALIZED
}
```

Never exposed to the player as raw values (Section 8's explicit instruction) — this is GM/system-
internal state, read out only as narration and dialogue, exactly like the existing PHASE_24-era
VAR-block discipline already established for this project.

## Section 9 — the state transition rule

```
CURRENT STATE + EVENT + OTHER ACTOR + PLAYER MOVE + CHARACTER TENDENCY = CANDIDATE RESPONSE
                                            |
                                   CANON / CONSISTENCY GATE
                                            |
                                    ACCEPTED STATE DELTA
```

**SYSTEM owns** (never an LLM live decision): event truth (what objectively happened — e.g., the
hot-plate actually sparked, at a specific severity), relationship state (the actual current
warmth/trust/misreading values), beliefs (whether a working assumption has actually been revised),
commitments (what was actually promised), world consequence (what concretely, externally changes
because of an event — e.g., whether the market day continues).

**LLM owns**: wording, tone, conversational expression, and *plausible minor initiative proposals*
(an NPC offering a specific small gesture, a specific phrase, a specific joke) that the Canon Gate
then accepts, rejects, or bounds down — exactly the same discipline already established for
free-talk state-delta proposals in this project (`NEWLIFE_30DAY_GAMEBOOK_CAUSAL_RULES_V2.md`
Section 7), now extended explicitly to NPC-NPC and event-response generation, not only player-facing
free talk.

## Section 10 — the response algorithm (for any open conversation, player-facing or NPC-NPC)

1. Parse the literal intent of what was said/done.
2. Answer direct factual questions directly, whenever canon permits (e.g., "what happened
   yesterday?" gets the real, system-owned answer, not evasion for its own sake).
3. Evaluate, in order: current `emotion_state`, the specific relationship in play, the character's
   stable traits/Agency-Communion baseline, the current event's pressure, and which need(s) are
   currently supported or threatened by this exact exchange.
4. Produce a character-specific reply, using that character's own SPEECH MODEL fields
   (`NEWLIFE_CHARACTER_MODELS_V3.md`) — sentence length, tempo, vocabulary, humor style, etc. — not
   a generic register.
5. Optionally generate one of: a question back, a disagreement, a joke, a refusal, a topic change,
   a request, or a small initiative — whichever this specific character would actually produce given
   steps 3-4, never a menu offered uniformly to every character.
6. Propose a bounded state delta (an evidence item, a belief-update candidate, a commitment, a minor
   callback flag) — never invents a NAMED fact not already grounded in the character model, event
   engine, or relationship graph.
7. The Canon Gate decides: ACCEPTED, REJECTED, or MODIFIED (bounded down), exactly as the existing
   free-talk contract already specifies. **This step must never be used as an excuse for short,
   robotic replies** (Section 10's explicit instruction) — the gate governs what becomes canonical
   state, not how rich or characterful the conversational turn itself is allowed to be.

## Section 11 — transformation must not be linear

Explicitly rejected: `trust +1, trust +1, trust +1, REVEAL`. Instead, per character, transformation
tracks as a real, non-monotonic sequence using the `transformation_axis_progress` enum
(`NONE -> ATTEMPTED -> REGRESSED -> ADVANCED -> REALIZED`, not strictly ordered — REGRESSED can
follow ADVANCED, and often should).

**Worked example (Jin, OTHER-FOCUS -> OWN VOICE)**:
- Event 1: `NONE` (no attempt yet; the silent-initiative pattern actively causes the Event 2 setup).
- Event 2 (after the burn): high competence threat + high habitual defensiveness -> a candidate
  response of "I'm fine" is generated and ACCEPTED by the gate as the canonical reaction —
  `transformation_axis_progress` stays `NONE`, `emotion_state.defensiveness` rises to HIGH. This is
  the "gets worse before better" beat Section 11 requires, not a wasted scene — it is the necessary
  precondition for the harder Event 3 test to mean anything.
- Event 3, IF a trusted actor (player or Fumiko) directly and specifically asks what he needs (not
  a vague "are you okay"): a candidate response of stating one plain need is generated. The gate
  checks it against his stable traits (LOW Agency makes this a genuinely effortful proposal, not a
  cheap one) and his relationship state with the asker (requires at least MEDIUM trust to be
  plausible) — if trust is insufficient, the gate MODIFIES the candidate down to a smaller, safer
  version ("it's fine, really" again) rather than accepting the full reveal. If trust is sufficient,
  ACCEPTED: `transformation_axis_progress -> ATTEMPTED`, then `-> ADVANCED` if the asker responds
  well, colored into `REALIZED` only if this is later referenced and held (e.g., someone follows up
  on it days later) — never completed in a single exchange.

This demonstrates: progress, regression, resistance, and later reinterpretation, using the same
character across the same three events, without a single linear counter anywhere in the model.

## Section 12 — the player is not a therapist (hard rule, restated for this engine specifically)

NPCs in this engine: act without the player in every event above (see the Event × NPC Matrix's
"NO-PLAYER OUTCOME" row on every single cell — no cell requires player presence to resolve); talk to
one another (Fumiko/Jin's tension, Yohei/Daisuke's venting, Miyoko's comfort of Hina, all NPC-NPC,
all independent); make bad decisions (Fumiko's unilateral crisis rules, Yohei's unchecked
secondhand equipment, Jin's unconfirmed build); make good decisions (Yohei helping Jin adjust the
display, Daisuke's morale-saving humor); sometimes repair things themselves (the town's own Event 3
resolution can occur with zero player involvement); sometimes ignore or reject player input (a
player advocating for Jin's promotion to real responsibility can simply be overruled by Fumiko if
her own state hasn't moved); sometimes change because of another NPC instead of the player (Jin
speaking to Fumiko, not the player, is the model's own preferred realization path for his axis).
The player role is explicitly **PARTICIPANT / NEIGHBOR / INTERVENOR**, never COUNSELOR or
OMNISCIENT FIXER — enforced structurally by the NO-PLAYER OUTCOME existing on every matrix cell,
not just stated as a principle.
