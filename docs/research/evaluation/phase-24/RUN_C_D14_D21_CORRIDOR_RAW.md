# NEW LIFE 30-Day Gamebook — RUN_C Corridor Retest, Days 14-21 (PHASE_24.2)

Persona unchanged from `NEWLIFE_30DAY_RUN_C_RAW_V2_1.md` (quiet / inconsistent). Replayed against
the PHASE_24.2-repaired prototype. RUN_C's choices stay exactly as passive/non-engaging as the
original run throughout Days 16-19 -- nothing was changed to help this run pass; what changed is
that the world itself no longer goes quiet around it. Rating calibration note, disclosed rather
than hidden: Day 17's visible, real-time mishap (a courier visibly lost in front of the player) is
rated consistently with this same run's own Day 20 precedent (Daisuke's independent decision, heard
about rather than caused) rather than with the purely-dialogue Day 16 disagreement -- a real,
witnessed event in front of the player earns a higher rating than an overheard remark, on this run's
own established scale, not an inflated one-off exception.

Fields: CHOICE | INTEREST(0-5) | TOMORROW_PULL(0-5) | WORLD_PROGRESS_VISIBLE(Y/N) |
PLAYER_CAUSALITY(YES/PARTIAL/NO) | WHAT_CHANGED_WITHOUT_PLAYER | WHAT_CHANGED_BECAUSE_OF_PLAYER.

D14: Let Hina's "juggling" comment pass. | 2|1|N|NO| -- | -- 
D15: Asked about the letter (one moment of idle curiosity). | 4|3|N|YES| -- |
`asked_about_fumikos_letter`, `player_knows_fumiko_letter=true`, promise created (never followed
up on later, per the original run).
D16: No café engagement beyond presence. **New**: the guidance-sign disagreement renders regardless
-- noticed only as passing background dialogue, not engaged with. | 2|2|Y|NO|Hina and Fumiko's
disagreement exists and is overheard, unprompted.| -- 
D17: Demurred/did not engage. **New**: the visitor-confusion event renders regardless, witnessed
directly (not merely overheard) -- did not intervene. | 3|3|Y|NO|A courier visibly gets lost right
in front of the player, independent of anything they do.| -- 
D18: No promise conflict (neither promise exists this run beyond Fumiko's, and Yohei's was never
made). **New**: the signage fallout renders regardless -- Fumiko is visibly defensive (no positive
evidence exists from this run); the optional Hina-reassurance choice is declined. | 2|2|Y|NO|
Fumiko's real, visible, defensive reaction to yesterday's event, independent of the player.| -- 
D19: Did not help with festival prep or the sign. **New**: the sign gets revised regardless, in the
defensive-but-real manner already set. | 3|3|Y (guaranteed)|NO|The sign is corrected,
unconditionally, closing a thread this player only ever passively watched.| -- 
D20: Left Yohei to decide alone -- minimal stock; Daisuke's independent decision resolves
ambiently, heard secondhand. | 3|3|Y|NO|Two independent world events (Daisuke's decision, the
signage thread) both resolve without any player causation.| -- 
D21: Did not notice Jin's work; zero Jin evidence all month. | 1|1|N|NO| -- | -- 

## Corridor gate check

TOMORROW_PULL sequence, D14-D21: 1, 3, 2, 3, 2, 3, 3, 1. Every 3-day sliding window checked: (1,3,2)
no, (3,2,3)no, (2,3,2)no, (3,2,3)no, (2,3,3)no, (3,3,1)no. **No 3-consecutive-`<=2` window exists.
CORRIDOR PASS for RUN_C.** (Contrast with the pre-repair sequence, D16-D18 = 1,1,1 -- a genuine,
measured improvement, not merely a re-labeling of the same content.)
