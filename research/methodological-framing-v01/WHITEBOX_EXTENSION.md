# White-Box Extension 窶・Future Internal-State Test

Status: future study only. Not part of Methodological Framing v0.1 confirmatory claims.

## Motivation

The black-box project can show:

[
MethodFrame
竊・ObservableResearchBehavior
]

but cannot identify internal neural variables responsible for the effect.

If the black-box effect replicates, an open-weight model can test a stronger mechanistic hypothesis:

[
MethodFrame
竊・HiddenRepresentation
竊・ResearchBehavior.
]

## Candidate design

Use the same fixed objectives and method conditions with an open-weight model whose activations can be recorded.

For each condition:
- identical task content;
- fresh independent runs;
- fixed decoding settings where possible;
- capture residual-stream/hidden-state representations at preregistered layers and token positions;
- retain the same external Research Plan State scoring.

## Candidate analyses

1. **Method decodability**
   - can method condition be decoded from hidden representations above chance?

2. **Representational distance**
   - do within-method activation trajectories cluster more tightly than between-method trajectories?

3. **Research-state decodability**
   - can externally scored plan features be predicted from hidden representations?

4. **Mediation candidates**
   - do representation differences statistically mediate method-to-plan associations?

5. **Causal intervention, only if technically justified**
   - activation patching or steering-vector interventions could test whether a method-associated representation causally changes downstream plan structure.

## Claim discipline

Representational separation alone does not establish a causal internal variable.

A stronger causal mechanism claim would require intervention, not merely decoding or correlation.

## Sequence rule

Do not begin this study until:
1. the black-box measurement instrument is reliable;
2. Study A shows a reproducible framing effect;
3. the method and task banks are frozen independently of white-box results.
