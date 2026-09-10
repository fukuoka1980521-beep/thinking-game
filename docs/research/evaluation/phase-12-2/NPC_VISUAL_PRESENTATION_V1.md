# NPC Visual Presentation V1 — PHASE 12.2

Directive Section 6/7/8/9/10.

## Character asset contract (directive Section 6) — identical slot for all 3 NPCs

| Property | Value |
|---|---|
| Pixel dimensions (master) | 1024 × 1536 px |
| Aspect ratio | 2:3 portrait |
| Background | **Transparent** (PNG) — so the same character asset composites over any location background without a baked-in environment mismatch |
| Framing | Half-body / standing, visible roughly waist-up to allow a readable face at small mobile display sizes while still showing clothing/occupation cues |
| Mobile display size — conversation header | 48 × 72 CSS px (thumbnail, alongside name) |
| Mobile display size — location "who's here" card | 64 × 96 CSS px |
| Safe crop margins | Face and torso centered within the middle 80% horizontally; top 5% and bottom 10% may be cropped at small display sizes without losing the face or key clothing cue |
| Character-name placement | HTML overlay/adjacent label, never baked into the art (same "no baked text" principle as the map) |
| Activity-text placement | Separate HTML line below or beside the portrait, driven by real runtime state (`yoheiCurrentActivity`/`miyokoCurrentActivity`/Jin's location-derived line) — never baked into the art, since activity changes constantly and art does not |

Implemented now as `PortraitPlaceholder` (`NewlifeBgw121App.tsx`) — a plain bordered box at these
exact slot dimensions, one flat color per NPC, showing only the first kanji of their name. This is
an ENGINEERING PLACEHOLDER for layout wiring only — see directive Section 18 / `ART_ASSET_MANIFEST_V1.md`.

## Character identity briefs (directive Section 7) — canon-only, no invented biography

### Yohei (洋平) — final-generation brief

- Age impression: early-to-mid 60s (canon: general store owner, decades-long presence in the
  shōtengai).
- Build: solid, working build — someone who still physically moves stock himself.
- Hair: not specified by canon — leave to the art step's own reasonable default for the age/role
  (a plain, practical short cut), not invented as a personality point.
- Clothing: practical shopkeeper wear — an apron or work vest over ordinary clothes.
- Occupation/life cues: visible shop props context (crates, shelving) when shown in his own
  location.
- Facial impression: plain-spoken, a little weathered, not unfriendly (canon: "friendly,
  practically skeptical of town policy").
- Personality-visible cues: a grounded, no-nonsense posture; not a caricatured "gruff shopkeeper."
- Ordinary-Japanese-town context: general store / shōtengai setting.

### Miyoko (美代子) — final-generation brief

- Age impression: late 60s (canon: café owner).
- Build: average, unremarkable — presence should read as warmth, not physical stature.
- Hair: not specified by canon — a plain, neat, age-appropriate style, not invented as a
  personality point.
- Clothing: café apron over modest, neat everyday wear.
- Occupation/life cues: café counter/apron cues.
- Facial impression: warm, welcoming (canon: "remembers people well, sometimes intrudes into
  others' affairs" — the intrusiveness is a behavioral trait, not something to visualize as an
  expression).
- Ordinary-Japanese-town context: café interior/exterior setting.

### Jin (相馬迅) — final-generation brief

- Age impression: mid-to-late 50s (canon: 57, independent repair/odd-job worker).
- Build: practical, capable — someone whose work is physical but not staged as heroic/strong-man.
- Hair: not specified by canon — a plain, practical style suited to manual work, not invented as a
  personality point.
- Clothing: work clothes suited to odd jobs (not a uniform — canon: "no single fixed place of
  business," so his clothing should read as generalist repair/handyman, not shop-branded).
  Plausibly carrying a tool or tool bag, matching "moves between odd jobs."
  Clothing/props say "does physical work for a living" — never anything that visually implies the
  frozen behavioral rule (he is not visually coded as wise/mystical; the rule is a conversational
  trait, not a visual one).
- Facial impression: ordinary, approachable, pragmatic — canon explicitly forbids him reading as
  omniscient/a sage figure, and the art must not accidentally imply that.
- Ordinary-Japanese-town context: could be shown against a neutral/generic backdrop rather than
  one specific shop, since his own canon location is deliberately mobile.

**Explicitly not invented**: no eye color, specific hairstyle, height in cm, or backstory detail
was added beyond what canon states or what this brief flags as "not specified, use a plain
reasonable default" — directive Section 7's explicit prohibition on inventing biography merely to
make the illustration interesting.

## Consistent art direction (directive Section 8)

Target locked in as a written direction for the eventual generation step (not applied by Code):
adult narrative mobile game; warm but not childish; real-life town with a slight literary
atmosphere; explicitly NOT anime-exaggerated, NOT photorealistic-uncanny, NOT children's-game
style, NOT generic corporate illustration. The unexplained anomaly is not visually referenced
anywhere in this phase's UI (no eerie lighting, no anomaly-coded color grading on the opening or
map) — the normal town presentation stays ordinary, matching directive's explicit instruction.

## Location presentation: WHERE / WHO / WHAT before conversation (directive Section 9)

Implemented: entering a location renders (in order) the location name + description (WHERE), one
card per present NPC showing their portrait slot + name (WHO), and their real runtime activity
line (WHAT) — all visible BEFORE the "話しかける" (talk) button is pressed. No NPC appears as a
bare floating name; every presence is a full card (portrait + name + activity + explicit action to
begin talking). See `screenshots/02_yohei_location.png`.

## NPC activity visibility (directive Section 10) — real runtime state, not invented flavor

| Displayed text | Source |
|---|---|
| 洋平の活動 (e.g. "洋平は、倉庫の在庫を一人で運ぼうとしている。" / "…相馬に頼んでいるところだ…") | `yoheiCurrentActivity(state)` — unchanged PHASE 12.1 function |
| 美代子の活動 (e.g. "美代子は、いつも通り店を開けている。" / "…椅子の修理を相馬に頼んでいるところだ。") | `miyokoCurrentActivity(state)` — unchanged |
| 相馬の活動 (e.g. "洋平商店で修理の仕事をしている。") | Derived directly from `state.jinJobLocation` (unchanged PHASE 12.1 field), rendered as a new but purely textual sentence in `activityFor()` — no new state, no invented content beyond phrasing the same existing fact |

No activity text is invented independent of state — verified directly:
`tests/newlifeBgw121VisualProduct.test.tsx`'s "character asset slot" test confirms the rendered
activity text always comes from the live `bgw121-activity-{npc}` element tied to real state.
