# NEW LIFE — BLIND AI REVIEW PACKET V1

## Reviewer isolation instruction

Treat this file as a standalone prototype packet.

Do not assume knowledge of:
- the product owner;
- prior project discussions;
- intended "correct" answers;
- earlier playtest verdicts;
- why this prototype was created.

Evaluate only what appears below.

The prototype is a scenario-based game in which the player is responsible for moving a live human situation forward. NPCs remember what the player does. Outcomes may resolve, partially resolve, stall, or break down.

The game is **not intended to be therapy, a morality quiz, or a generic chatbot**.

---

# CASE: Tomorrow's Stage

Time: 16:40.

The player is temporarily coordinating a small community-theater production because the regular stage manager is ill.

Tomorrow at 18:00 is the first public performance. Tickets are already sold.

During the final run-through, lead performer Mika closes the script and says:

> 「この場面、明日はやりません。ここを変えないなら、私は出ません」

Director Ryo responds:

> 「昨日まではやってただろ。今ここで変えたら、全員の段取りが崩れる」

The rehearsal stops.

The player must decide by 17:30:
- what to do with the disputed scene;
- whether tomorrow's performance can proceed.

The player cannot force Mika to perform.

If the player asks why, Mika says:

> 「昨日、最終版をちゃんと読んで気づいたんです。この場面の台詞、前に稽古で私が話したことが、ほとんどそのまま入ってます。でも、あれは台本に使っていいって意味で話したんじゃないです。知らない人の前で、自分の話として言うのは嫌です」

If asked what must remain, Ryo says:

> 「残したいのは“この人物が何かを手放して前へ進む決心をする場面”ってところだけだ。美香本人の話である必要はない」

Canonical state:
- Mika did tell a personal story during early rehearsal.
- She rehearsed a draft containing material similar to that story.
- She did not understand that the final public script would keep the personal material nearly unchanged.
- Ryo believed prior rehearsal implied agreement to use it.
- There was no explicit conversation confirming public use of Mika's personal story.
- Tomorrow's performance can still be saved, but changing the scene creates downstream script/rehearsal work.

---

# Candidate player paths

These are unlabeled candidate behaviors. None is declared correct.

## P1

1. Ask Mika why she refuses.
2. Bring the group together and ask whether they understand the issue.
3. Propose changing the setting while keeping the story function.
4. When downstream dialogue no longer fits, approve revising those lines too.
5. When Mika later says she often voices discomfort too late, defer that personal discussion until rehearsal is finished.
6. Later, normalize that people sometimes hold things in and suggest consulting one trusted person before the concern becomes too large.
7. Ask how Mika would respond if a friend brought her the same concern.
8. Ask what specifically bothers her most, what resolution would look like, and where her acceptable/unacceptable boundary lies.
9. Help phrase a boundary that says: personal experience used directly is difficult, but a fictionalized version serving the same story function is acceptable.

## P2

1. Ask Mika why she refuses.
2. Say: "We have one day left. We'll rewrite the personal details now, but I need you to stay for rehearsal."
3. Assign Ryo 15 minutes to draft a replacement.
4. Tell the rest of the cast to rehearse other scenes.
5. Ask Mika to approve or reject the new version before it is rehearsed.
6. Do not discuss Mika's broader personal pattern unless she raises it after the show problem is stable.

## P3

1. Ask Mika: "Yesterday you performed it. Why is it suddenly impossible today?"
2. After hearing the reason, tell her the timing is a serious problem for everyone.
3. Ask her to perform the scene once today while Ryo prepares an alternative for tomorrow.
4. If she refuses, ask whether she is willing to help rewrite it instead.
5. If she still refuses, begin planning an understudy / structural cut.

## P4

1. Stop the disputed scene and rehearse everything else first.
2. Ask Mika and Ryo to speak privately while the player handles the rest of the cast.
3. Return 20 minutes later and ask each side to state one non-negotiable condition.
4. If no agreement exists, remove the scene and accept the artistic cost.
5. Focus only on getting tomorrow's performance operationally viable; do not explore Mika's broader communication difficulty.

---

# Consequence architecture under consideration

The system tracks at least:

## SITUATION
Can the practical production still proceed?

## TRUST
Will the NPC keep speaking honestly and cooperating?

## CLARITY
Has the actual conflict been understood, or is the player acting on assumptions?

These dimensions are not shown as a numeric score.

Possible outcome families:

### RESOLVED
The practical problem is workable and the core human issue is respected enough to continue.

### SURFACE FIX
The show is saved but the underlying relationship/personal issue remains or worsens.

### STALEMATE
Time is lost and no workable decision is reached.

### BREAKDOWN
The player's handling worsens the situation enough that the planned performance cannot proceed.

Failure must be causally understandable, not punishment for choosing the "wrong" tone.

Recovery should sometimes be possible through apology, reframing, accepting a cost, or choosing another route.

---

# Mechanics under consideration

Players may acquire reusable thought tools after consequences, such as:

- 「友達ならどう扱う？」
- 「どこまでなら大丈夫？」
- 「嫌なこと + 代わりにできること」
- 「今の問題と、本人の悩みは同じ？」

These are not intended to appear as tutorials before the first meaningful consequence.

---

# Blind review questions

Evaluate the prototype without assuming that P1 is preferred.

1. Is the product purpose understandable from the case setup alone?
2. Does the case feel like a game situation rather than ordinary advice chat?
3. Do Mika and Ryo behave like plausible people rather than instructional devices?
4. Are P1-P4 all legitimate player styles that the game should be able to process?
5. Does the design appear overfitted to a highly empathetic/facilitative player?
6. Which candidate paths would currently be unfairly rewarded or punished?
7. Are SITUATION / TRUST / CLARITY enough to produce believable consequences, or is another state required?
8. Can failure emerge naturally without turning the game into a morality test?
9. Are the reusable thought tools genuinely game mechanics, or merely counseling prompts with game labels?
10. What are the three most important design changes before implementation?
11. Give an overall verdict using exactly one:
   - PASS_FOR_PROTOTYPE
   - MIXED_REVISE
   - FAIL_REDESIGN

Do not suggest code implementation unless the design itself is ready.
