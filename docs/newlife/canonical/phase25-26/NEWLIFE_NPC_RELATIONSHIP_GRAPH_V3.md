# NEW LIFE — directed NPC relationship graph V3

Phase 25 proposal. Names abbreviate H=Hina, Y=Yohei, D=Daisuke, J=Jin, M=Miyoko, F=Fumiko. An entry `T0..T3 / X0..X3` records *this person's* working trust and current friction toward the other; T3 is comfortable reliance, X3 is acute disagreement. These are internal authoring bounds, not player-visible affection points. No relation is changed merely because two people share a scene. Evidence records who witnessed what, where a request was accepted or declined, and what actually changed.

| Person | Likes / turns to | Misreads or disagrees with | Behaves differently around |
|---|---|---|---|
| Hina | Miyoko (checks taste without losing ownership) | Yohei (he may count promises rather than judge her talent) | Daisuke (allows jokes, refuses his “temporary” fixes) |
| Yohei | Daisuke (long friendship, calls out his delay) | Fumiko (publication rule without named stock owner) | Hina (goes clipped, checks exact numbers) |
| Daisuke | Yohei (can interrupt his grumpiness) | Jin (temporary repair versus safe replacement) | Fumiko (jokes less, fears promised venue duty) |
| Jin | Miyoko (practical favors with no ceremony) | Daisuke (jokes over a real load limit) | Fumiko (asks for a written work boundary) |
| Miyoko | Jin (sees labor most visitors miss) | Fumiko (quietly overbooks café seats) | Hina (offers direct commercial critique rather than hostess warmth) |
| Fumiko | Daisuke (trusts his repair judgment) | Miyoko (mistakes her welcoming words for consent to unlimited seats) | Jin (must say who owns the task, cannot volunteer him) |

### Directional starting edges (all other pairs neutral T1/X0)

| FROM → TO | Starting state | Distinctive interpretation and possible event evidence |
|---|---|---|
| H → M | T2/X0 | Accepts taste feedback; may mishear limit on café seating as personal distance. |
| M → H | T2/X0 | Likes initiative, refuses to promise her own room to support it. |
| H → Y | T1/X2 | Hears “30 includes reservations?” as “your food won't sell.” A revised sign can correct this inference. |
| Y → H | T1/X1 | Respects craft without trusting the public promise. He changes after she revises a number herself. |
| H → D | T2/X0 | Jokes while setting up; recoils if he decides her display for her. |
| D → H | T2/X0 | Proud to help, but forgets she needs a decision, not another folding table. |
| Y → D | T3/X1 | Can tell him he has delayed too long. Refusal can increase respect even if it harms the project. |
| D → Y | T3/X0 | Takes bluntness as friendship, risks using him as an excuse not to choose. |
| D → J | T1/X1 | Calls an unstable table “fixable”; hears Jin's load warning as fussiness. |
| J → D | T1/X2 | Thinks Daisuke is postponing a safer replacement; a firm venue answer can reduce friction. |
| J → M | T2/X0 | Helps shift seating without demanding praise; asks her before moving anything. |
| M → J | T3/X0 | Trusts repair, may accidentally rely on unpaid overtime; a bounded request strengthens it. |
| F → M | T2/X1 | Thinks her “we'll manage” includes café spillover, later accepts a genuine boundary. |
| M → F | T2/X2 | Feels the committee treats café labor as free; may say so independently of player. |
| F → D | T2/X1 | Enjoys his craft, impatient with venue indecision; talks plainly with him alone. |
| D → F | T1/X1 | Respects her organizing, more reserved and less comic under a deadline. |
| F → J | T2/X0 | Trusts work, must learn to ask about capacity before scheduling. |
| J → F | T1/X1 | Demands a named cutoff, unlike his casual favors for Miyoko. |
| Y → F | T1/X2 | Won't be bound by a flyer whose author doesn't own stock. |
| F → Y | T1/X2 | Mistakes a correct warning delivered curtly for refusal to collaborate. |

### Independent relationship updates

- E1: H and Y clash over “30” before the player arrives. D tries a joke; Y tells him not to use friendship to avoid a venue answer. F assumes M has seats; M notices but may not object yet.
- E2: Y shows the dated reservation list to H; whether H examines it or rejects it changes **H→Y** and **Y→H separately**. M can tell F about the café burden with no player present. J may decline D's proposed patch even if they like each other.
- E3: D decides about the workshop whether or not the player visits. F offers one sign editor if her own process was shown inadequate. Y can accept a corrected limited offer while still disliking the meeting. Valid counterexample: H can trust M and still decline her commercial advice.
- Off-screen reports must preserve provenance: `witnessed`, `told_by(actor)`, `inferred` are distinct. Player may learn “F and M argued” from a report, but cannot know private evaluations until someone expresses them.

### Integrity rules

Trust and friction can both be high; a correct warning can be irritating. T3 does not compel agreement, T0 does not forbid practical help. Conflict can survive apology; repair requires a changed action. Do not give all six uniformly warmer feelings toward a kind player. A player has no authority to order NPC-to-NPC reconciliation.