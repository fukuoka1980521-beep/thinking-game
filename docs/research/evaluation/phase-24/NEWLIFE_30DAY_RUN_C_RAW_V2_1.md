# NEW LIFE 30-Day Gamebook — RUN_C Raw Playthrough V2.1 (quiet / inconsistent)

Played against `NEWLIFE_30DAY_GAMEBOOK_TEXT_PROTOTYPE_V2_1.md`. This run specifically tests
Section 2's "no engagement is a branch, not a void" -- with the home_hub removed, this player can no
longer simply "end the day early" to skip content; the day's main scene always plays regardless.
Raw record only, no interpretation.

Fields: CHOICE | INTEREST(0-5) | TOMORROW_PULL(0-5) | WORLD_PROGRESS_VISIBLE(Y/N) |
PLAYER_CAUSALITY(YES/PARTIAL/NO) | WHAT_CHANGED_WITHOUT_PLAYER | WHAT_CHANGED_BECAUSE_OF_PLAYER.

D1: Helped Hina (easy, low-effort default click). | 3|2|N|YES| -- |`helped_hina_move_box` created.
D2: Said nothing about the change; declined the roam. | 2|2|Y|NO|The overnight restock happens
regardless, mentioned in passing whether noticed or not.| -- 
D3: Ignored the flyer. | 2|2|N|NO| -- | -- 
D4: Said nothing to Hina; declined the roam to Yohei. | 2|2|N|NO| -- | -- 
D5: No Jin offer; declined the roam. | 1|1|N|NO| -- | -- 
D6: No comment on the NPC-NPC moment; declined the roam. | 2|2|Y|NO|The moment happens regardless,
mentioned ambiently even though unwatched.| -- 
D7: Watched the comedy day with no comment. | 3|2|N|NO| -- | -- 
D8: Did not ask anything personal. | 2|2|N|NO| -- | -- 
D9: Visited Yohei, browsed, didn't help. | 2|1|N|NO| -- | -- 
D10: Visited the Hall, didn't suggest anything about the bench. | 2|1|N|NO| -- | -- 
D11: Gave a flat, minimal reaction to the beans. | 2|1|N|PARTIAL| -- |`reacted_to_miyoko_new_beans`
still created (honesty, even minimal, still counts) -- a small, real surprise this run.
D12: Did not return to Daisuke. | 1|1|N|NO| -- | -- 
D13: Chose "let it be" on Yohei's phone moment. | 2|2|N|NO|(nothing disclosed this scene)| -- 
D14: Let Hina's "juggling" comment pass. | 2|1|N|NO| -- | -- 
D15: Asked about the letter, out of one moment of idle curiosity -- the only deep-talk this whole
run. | 4|3|N|YES| -- |`asked_about_fumikos_letter`, `player_knows_fumiko_letter=true`, promise
created (though never followed up on later).
D16: No café visit engagement beyond presence. | 1|1|N|NO| -- | -- 
D17: Demurred on Yohei's request. | 1|1|N|NO| -- | -- 
D18: No promise conflict (Yohei's side never made). | 1|1|N|NO| -- | -- 
D19: Did not help Fumiko with prep. | 2|2|Y (she manages anyway)|NO| -- | -- 
D20: Left Yohei to decide alone -- minimal stock. **Daisuke's independent arc resolves here on its
own schedule, entirely unwitnessed** -- the game still mentions it ambiently in passing narration
("you heard, secondhand, that Daisuke finally decided on the shop"), a real, perceivable sign the
world moved even though this player did nothing to cause it and wasn't present for it. | 3|3|Y|NO|
Daisuke's three-month decision resolved on its own, reported ambiently, not witnessed firsthand.|
`yohei_festival_stock="minimal"` (a real, if modest, choice this player still made by being present
at all).
D21: Did not notice Jin's work; no thanks, no offer (zero Jin evidence all month). | 1|1|N|NO| -- |
-- 
D22: Gate not met -- ordinary evening. | 2|2|N|NO| -- | -- 
D23: Did not investigate. | 1|2|N|NO| -- | -- 
D24 (festival): Spent one slot briefly at Yohei's thin stall, the second slot resting rather than
choosing another location. | 3|3|Y (the assembled composite scene, even in its thinnest form, is
still real and specific)|PARTIAL| -- |Witnessed a specifically thin, low-engagement version of the
day -- still a real, distinct outcome, not a generic placeholder.
D25: Rested. | 2|1|N|NO| -- | -- 
D26: **`yohei_son_call_happened` becomes true regardless (independent world progress)** -- gate for
learning it is NOT met (no distinct additional Yohei evidence exists at all this run) -- but the
day's own narration still gestures ambiently at Yohei seeming different, unexplained. | 2|2|Y|NO|
The call happened; ambiently sensed, not explained.| -- 
D27: Gate not met -- ordinary afternoon. | 1|1|N|NO| -- | -- 
D28: Rule resolves: no Miyoko evidence beyond none of the two required items ->
`miyoko_daughter_outcome="undecided"`. | 1|1|N|NO| -- |Thread stays open past Day 30, a legitimate,
honestly-reported non-outcome.
D29: Did the quiet kindness almost by accident. Fumiko's write-back: `player_knows_fumiko_letter`
true but `helped_fumiko_festival_prep` false -> `"undecided"`. | 2|2|N|PARTIAL| -- |The letter
thread resolves to still-undecided, reflecting the one moment of real engagement this run had and
nothing more.
D30: Skipped the reflection. | 3|N/A|N|PARTIAL|A quiet, mostly-unresolved month -- but, distinctly
from V2's RUN_C, this Day 30 explicitly reports TWO independent world events (Daisuke's decision,
Yohei's son call) that happened and were sensed ambiently despite zero player initiation, plus one
small, real exception (Fumiko's letter, noticed once).

## Summary tally, and the specific hard-gate check this run exists to test

Consecutive TOMORROW_PULL <= 2 check: Days 16-18 = 1,1,1 (three in a row), and Days 5/8-10/12 also
dip to 1-2 repeatedly. **This does not clear the <=2-for-3-consecutive-days gate either** -- flagged
honestly in the verdict, same category of finding as RUN_B's. However, the SPECIFIC gate this run
exists to test ("RUN_C becomes mostly blank/ordinary days") is **substantially improved from V2**:
Days 2, 6, 20, 24, and 26 all carry `WORLD_PROGRESS_VISIBLE=Y` even under zero-to-minimal player
initiation -- real, perceivable signs the town moved, which V2's RUN_C never had (V1/V2's actual
documented failure was that a passive player's world felt frozen; this run's world does not feel
frozen, even though its INTEREST/PULL numbers are honestly low on many individual days).
