# NEW LIFE 30-Day Gamebook — RUN_B Corridor Retest, Days 14-21 (PHASE_24.2)

Persona unchanged from `NEWLIFE_30DAY_RUN_B_RAW_V2_1.md` (skeptical / direct / refuses often).
Replayed against the PHASE_24.2-repaired `NEWLIFE_30DAY_GAMEBOOK_TEXT_PROTOTYPE_V2_1.md` (Days
16-19 now carry the always-rendered guidance-sign B-plot). Days 14-15 and 20-21 reproduced
unchanged from the prior run for continuity; only 16-19 reflect new content. Choices not
re-optimized to pass the gate -- RUN_B still demurs/refuses exactly as its persona dictates; the
only genuinely new decision point is Day 17's visitor (helped, because concrete/practical help fits
this persona, consistent with Day 9's stock-sorting).

Fields: CHOICE | INTEREST(0-5) | TOMORROW_PULL(0-5) | WORLD_PROGRESS_VISIBLE(Y/N) |
PLAYER_CAUSALITY(YES/PARTIAL/NO) | WHAT_CHANGED_WITHOUT_PLAYER | WHAT_CHANGED_BECAUSE_OF_PLAYER.

D14: Asked "juggling how?" bluntly -- one item only. | 3|3|N|YES| -- |`noticed_hina_money_pressure`
created.
D15: Asked bluntly about the letter. | 4|4|N|YES| -- |`asked_about_fumikos_letter`,
`player_knows_fumiko_letter=true`, `promise_fumiko_help_soon=true` created.
D16: Listened to Miyoko once, briefly. **New**: the guidance-sign disagreement renders regardless
-- declined to back Hina up (not this persona's business). | 3|3|Y|PARTIAL|The disagreement between
Hina and Fumiko exists and is visible, unprompted.|`listened_to_miyoko_daughter_worry` created;
signage evidence NOT created (declined).
D17: Demurred on Yohei's shelf-help request. **New**: the visitor-confusion event renders
regardless -- helped redirect the courier (concrete, practical, in character). | 4|4|Y (the
confusion itself is independent)|YES (the help specifically)|A courier gets lost at the wrong end
of the street, regardless of the player.|`helped_confused_visitor=true` created.
D18: No promise conflict fires (Yohei's promise was never made). **New**: the signage fallout
renders regardless -- Fumiko is already calmer about it (`helped_confused_visitor` satisfies the
calm-manner condition even without emotional engagement); declined to reassure Hina (not this
persona's register). | 3|3|Y|PARTIAL|Fumiko's real-time reaction to yesterday's event, independent
of the player's own emotional involvement.|Indirectly colored calm by Day 17's practical help.
D19: Declined to help with festival prep generally or the sign specifically. **New**: the sign gets
revised regardless, in the calm manner already set by Day 17. | 4|3|Y (the revision itself is
guaranteed)|PARTIAL (witnessed, not personally executed)|The sign is corrected, unconditionally,
building on yesterday's already-calm trajectory.| -- 
D20: Helped Yohei decide carefully -- modest stock. | 4|4|N|YES| -- |`yohei_festival_stock=
"modest"`.
D21: Missed noticing Jin's work; no Jin evidence all month. | 2|2|N|NO| -- | -- 

## Corridor gate check

TOMORROW_PULL sequence, D14-D21: 3, 4, 3, 4, 3, 3, 4, 2. Every 3-day sliding window checked: (3,4,3)
no, (4,3,4)no, (3,4,3)no, (4,3,3)no, (3,3,4)no, (3,4,2)no. **No 3-consecutive-`<=2` window exists.
CORRIDOR PASS for RUN_B.**
