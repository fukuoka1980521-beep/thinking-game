# NEW LIFE — Town Design V1 (PHASE_21, 7-Day Core)

Six locations, all already existing as canonical `LocationId`s in the current codebase
(`src/newlifecore/types.ts`) -- no new location type is proposed. Each is redesigned here around a
real gameplay role, not "a room to chat in" (Section 14's explicit ban).

## 仮住まい (Trial House)

- **Visual concept**: small, plain, temporary-feeling -- boxes not fully unpacked even by Day 7 if
  the player never does anything about it (a legitimate, visible non-outcome, not a failure state)
- **Main NPC**: none (this is the player's own space)
- **Secondary NPCs**: none
- **Ordinary activity**: waking up, a short evening moment before sleep
- **Special event type**: morning "notice the town" beat (Section 6's MORNING step) -- one line
  that tells the player something changed or is about to
- **What can player do here**: rest, look back on the day (Section 35's "今日を振り返る"), leave
- **Why come back**: it's the only way to end a day and see tomorrow -- not optional, but never
  the site of new content itself
- **Day/night difference**: morning light vs. evening lamp -- the two bookends of every day
- **Day 1 state**: freshly arrived, mostly unpacked boxes, a note about a return date
- **Day 7 state**: same room, now visibly lived-in only if the player spent time on it (a personal
  touch added, or not) -- deliberately the smallest, least eventful location, on purpose

## 洋平商店 (Yohei's General Store)

- **Visual concept**: old, well-kept, slightly cluttered with real stock -- the "long-running small
  business" register
- **Main NPC**: Yohei
- **Secondary NPCs**: Kiyoshi (background regular, ambient only)
- **Ordinary activity**: stocking shelves, checking a delivery, minding the register
- **Special event type**: the festival-stock thread (a dated, resolving beat, not a repeatable loop)
- **What can player do here**: buy, watch, help briefly, ask, leave
- **Why come back**: real groceries the player's own trial-house life can plausibly want, plus the
  slow-building succession thread
- **Day/night difference**: open daytime, shuttered/closed by evening (a visible, legible state
  change, not just a palette shift)
- **Day 1 state**: ordinary open day
- **Day 7 state**: shipment thread resolved one way or another; relationship warmth reflects how
  often the player actually came

## 喫茶のどか (Café Nodoka)

- **Visual concept**: warm, small, a handful of tables, window light -- the "come sit down" register
- **Main NPC**: Miyoko
- **Secondary NPCs**: none required for the 7-day core (Daichi/Chinatsu-style extra regulars are a
  later-expansion candidate, not needed now -- see content budget)
- **Ordinary activity**: sitting with a drink, watching the street through the window
- **Special event type**: "new beans to try" -- a small, one-off tasting beat with a real dated
  callback
- **What can player do here**: ORDER → DRINK → CONVERSATION (Section 34's own required sequence),
  ask, promise, leave
- **Why come back**: the one place in town built entirely around "sit and stay a while" -- the
  closest thing to a guaranteed-pleasant visit, which is itself the point (not every location needs
  to be effortful)
- **Day/night difference**: daytime bustle vs. a quieter, lamp-lit evening pour
- **Day 1 state**: ordinary
- **Day 7 state**: "regular" recognition if visited often; otherwise still warmly received as any
  guest would be (Section 34: never a gated reward)

## 商店街 (Shopping Street)

- **Visual concept**: the town's actual "outside" -- a short street with visible individual
  storefronts (Hina's bakery-in-progress, Daisuke's barbershop, passing color), not one flat
  background image reused for every visit
- **Main NPC**: Hina (bakery) and Daisuke (barbershop) -- two MAIN NPCs sharing one street location,
  the way a real small shopping street holds several shops
- **Secondary NPCs**: ambient passersby (unnamed, flavor only)
- **Ordinary activity**: walking through, browsing, watching Hina's shop take shape
- **Special event type**: the bakery's actual opening day; Daisuke's renovation decision
- **What can player do here**: watch, help briefly, talk, get a haircut (Daisuke's only-event),
  leave
- **Why come back**: two independent, unrelated threads live here, so there's always a reason even
  if the player isn't interested in one of them
- **Day/night difference**: daytime foot traffic vs. a quieter evening street, shops closing
- **Day 1 state**: Hina's shop visibly not open; Daisuke's quote still undecided
- **Day 7 state**: independently resolved per-thread, not coupled to each other

## 集会所 (Community Hall)

- **Visual concept**: a modest multi-use building, noticeboard by the entrance, a slightly wobbly
  bench -- civic, not commercial
- **Main NPC**: Fumiko
- **Secondary NPCs**: Jin (does odd jobs here, this is his most likely at-work location)
- **Ordinary activity**: reading the noticeboard, small talk, helping tidy
- **Special event type**: community-hall event prep (Section 29's "relationships cross" day) -- the
  one place multiple MAIN NPCs' threads can visibly intersect (Jin fixing Fumiko's bench, discussed
  by Miyoko, etc.)
- **What can player do here**: watch, help, ask, join, leave
- **Why come back**: the noticeboard changes; the bench thread; it's where Jin is most reliably
  found for his own arc
- **Day/night difference**: daytime activity vs. closed/quiet in the evening
- **Day 1 state**: something new on the noticeboard
- **Day 7 state**: bench fixed or not; the shared event happened or the player missed it -- both
  legible, neither punished

## Fortune House

- **Visual concept**: small, homey, NOT a mystical/app-like space -- one quiet room, tea, a short
  stack of hand-sized cards; visually belongs to the same warm town, not a separate "system menu"
- **Main NPC**: Shizuko (kept as a real, lightly-written character, not one of the 6 MAIN daily
  choices -- see character roster)
- **Secondary NPCs**: none
- **Ordinary activity**: tea, quiet conversation
- **Special event type**: the card draw itself -- Section 3's "small, repeatable game act," already
  built and tested in the current codebase (`FortuneCardPicker`, cross-day memory)
- **What can player do here**: draw a card, ask, leave
- **Why come back**: the existing cross-day "that card" callback -- proven, tested, genuinely liked
  mechanic, kept as-is
- **Day/night difference**: not meaningfully different -- deliberately the one location where
  atmosphere stays constant, reinforcing its "a little outside ordinary town rhythm" character
- **Day 1 state**: no card drawn yet
- **Day 7 state**: 0-1 cards drawn (a full day budget of 2 actions makes more than one draw a real,
  felt tradeoff, not a freebie)

## Locations explicitly NOT in the 7-day core

`CHALLENGE_CENTER` (Kamiya's own space) stays reachable on Day 1 only, for orientation, then is not
one of the 6 daily-choice destinations for the rest of the week -- consistent with Kamiya's
BACKGROUND classification in the character roster.
