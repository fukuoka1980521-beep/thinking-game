# AI Runtime Profile — Thinking Game / NEW LIFE

Adopts: development-os/docs/AI_RUNTIME_COST_PERFORMANCE_STANDARD.md v1.0
Profile: GENERATIVE_WORLD

## Deterministic responsibilities
- World state, day progression, resources, professions, relationship scores, unlocks, constraints, save/load.
- NPC memory writes after validation.
- Economy and game-rule calculations.

## Generative responsibilities
- NPC dialogue, scene realization, emotional tone, open-ended player interaction.
- Reflection text and narrative transitions.

## Model routing
- DEFAULT: gpt-6-luna for normal NPC turns and scene responses.
- ESCALATE: gpt-6.1-sol for key-day reflection, multi-NPC consistency conflicts, major narrative planning, or repeated low-quality/non-progress dialogue.
- EXPERT: gpt-6-astra only for offline benchmark/story-system review.

## Context/state
Send NPC persona + structured memories + current world state + relevant recent dialogue. Do not replay all historical dialogue.

## Verification
Generated dialogue cannot directly mutate canonical world state. Parse/validate state proposals before commit. Memory summaries must preserve provenance.

## Cost target
Keep the high-frequency dialogue path on Luna; spend Sol only on moments where model quality materially changes player experience.
