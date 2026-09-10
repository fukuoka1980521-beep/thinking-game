# Canon Authority Failure Trace V1 — PHASE 12.0R

Directive Section 1. Exact trace of how PHASE 12.0's cast audit reached the wrong conclusion.
Reconstructed from the actual tool calls made that phase — not a reconstruction after the fact
designed to look better than what happened.

## What was actually searched

1. `Grep "洋平"` scoped to `docs/product` only → 27 files matched, including
   `docs/product/NEW_LIFE_DAY1_DAY2_CAUSAL_SPEC_V1.md` (listed first in the results).
2. That result was never opened. Instead, the next step read
   `docs/product/NEWLIFE_RELATIONSHIP_GRAPH_V2.md` (chosen because it was near the top of the file
   list and its name suggested cast-relationship content).
3. That document's mystery-plot content (美代子/千夏/大地/洋平 grandmother-granddaughter thread)
   looked internally rich but self-contained, prompting a check for "is this still canonical,"
   which led to reading `docs/product/NEWLIFE_FINAL_CANON_V3_3.md` (chosen for having "FINAL_CANON"
   in its filename — an unverified assumption that filename prominence implies current authority).
4. That document pointed to `NEWLIFE_STORY_BIBLE_V3.md`, which was read and found to describe
   "Challenge Town" — a DIFFERENT setting from the あさひ町/relationship-graph material just read.
5. A follow-up discovery step ran `ls docs/product/ | grep -i "STORY_BIBLE\|CHALLENGE_TOWN"` — a
   **substring-based filename search**, which by construction could only find files whose names
   contained those two literal phrases. It found `NEWLIFE_CHALLENGE_TOWN_SCENARIO_BIBLE_V01.md`.
6. That document's own text states it "supersedes the あさひ町 / Chinatsu-Seiichi-mystery lineage,"
   which was correctly interpreted as confirming Challenge Town as the live setting.
7. That document ALSO contains a "Core cast" table (洋平/美代子/千夏/大地/神谷/結衣/岩田) presented
   under a section header claiming this document, together with 3 named companions, "is the
   authoritative NEW LIFE canon." **This table was then treated as an exhaustive, closed cast
   list** — the reasoning step that produced "Jin is not canonical" was: "Jin does not appear in
   this table; this table is authoritative; therefore Jin is not canonical."
8. No further search was performed for the literal strings "Jin," "相馬," or "迅" before writing
   that conclusion into `NPC_CHARACTER_SYSTEM_V1.md`.
9. **`docs/world/` was never listed or searched at all this phase** — not by the initial `洋平`
   grep (scoped to `docs/product` only), not by the filename-substring follow-up, not by any later
   step. `docs/world/NEW_LIFE_CAST_MASTER_V1.md`/`V2.md` (PHASE 11.0/11.1 — later than every
   document actually read) were consequently never discovered.

## Root causes (plural — this was not one mistake)

1. **Directory-scope tunnel vision**: the very first search was scoped to `docs/product` only.
   Nothing after it ever broadened that scope, even after the あさひ町/Challenge-Town split was
   discovered (which should have raised the prior "is there yet another parallel canon location"
   question, and didn't).
2. **Filename-based authority inference**: "FINAL_CANON" and a substring match on "CHALLENGE_TOWN"
   were both used as proxies for "this is the authoritative document," without checking phase
   numbers against every other candidate or checking whether a differently-named directory existed.
   `docs/world/NEW_LIFE_CAST_MASTER_V2.md` is PHASE 11.1 — later than `NEWLIFE_CHALLENGE_TOWN_
   SCENARIO_BIBLE_V01.md`'s PHASE 7.40 — but this comparison was never made because the later
   document was never found.
3. **The exact error directive Section 2 names**: a "Core cast" table's OWN scope (this
   particular document's chapter-1-relevant subset, itself scoped to "Chapter 1 only: DAY1-DAY3")
   was silently treated as "the complete, project-wide cast enumeration." `NOT FOUND IN THIS ONE
   DOCUMENT'S TABLE` was treated as `NON-CANONICAL`, exactly the conflation Section 2 prohibits.
4. **No negative-search discipline**: at no point did the process explicitly search for the
   candidate name being evaluated for rejection ("Jin," "相馬," "迅") before writing the rejection
   into a deliverable. A rejection was reached by absence-from-one-table, never by finding an
   explicit retraction.

## What should have happened

Before writing "X is not canonical" for any named entity, search the ENTIRE `docs/` tree (not one
subdirectory) for the entity's own name(s), and require an explicit supersession/retraction
statement — not mere absence from whichever single document was read — before concluding rejection.
This is now the rule fixed in `NEW_LIFE_CURRENT_CANON_INDEX_V1.md`'s companion authority model.

## Not erased, corrected forward

`docs/research/evaluation/phase-12-0/NPC_CHARACTER_SYSTEM_V1.md` (the phase-12.0 artifact
containing the incorrect conclusion) is left as historical evidence, unmodified, per directive
Section 16's "do not silently erase the mistake." Its cast-audit section is superseded, not
deleted, by `CAST_CANON_AUDIT_V1.md` in this same phase-12-0r directory — see
`STRATEGIST_CANON_AUTHORITY_AUDIT_PACKET_V1.md`'s "Section 16 update summary" for exactly which
PHASE 12.0 documents this phase corrects and which are left untouched.
