# Pilot Scoring Protocol

Status: non-counted instrument-validation pilot.

## Blinding

Scorers receive:
- an opaque blind ID;
- the research plan text;
- the scoring rubric.

Scorers do **not** receive:
- methodological condition;
- replicate number;
- method label;
- the original method instruction.

If the plan itself uses words such as 窶廝ayesian窶・or 窶彡ausal,窶・those words remain because they are part of the generated output. Scorers must not award features based on labels alone.

## Two independent scorers

Every one of the 21 pilot plans is scored twice:
- primary: gpt-6-sol;
- secondary: gpt-5.6-terra.

The purpose is instrument diagnosis, not adjudication toward a preferred result.

## Evidence rule

A feature is scored present only if the plan operationalizes it.

Examples:
- 窶廝ayesian窶・alone is not an uncertainty update rule.
- 窶彡ausal窶・alone is not a counterfactual design.
- 窶彷alsification窶・alone is not an observable refutation criterion.
- 窶徭tate-space窶・alone is not a transition model.
- 窶徼esting窶・alone is not a metamorphic relation.

## Pilot reliability questions

For binary fields:
- raw agreement;
- Cohen's kappa where estimable.

For count fields:
- exact agreement;
- within-one agreement;
- absolute difference.

Fields that cannot achieve useful agreement are candidates for:
- stricter definitions;
- discretization;
- removal from the preregistered primary state vector.

## No scientific inference

No p-values, hypothesis claims, or publication claims are permitted from this pilot.
