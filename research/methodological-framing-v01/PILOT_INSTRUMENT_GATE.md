# Pilot Instrument Gate

Status: fixed before inspecting completed pilot scorer results.

These are engineering gates for instrument redesign, not inferential scientific thresholds.

## Binary-field reliability

When both categories occur sufficiently for kappa to be meaningful:

### GREEN 窶・candidate to retain
- raw inter-scorer agreement >= 0.85; and
- Cohen's kappa >= 0.65.

### AMBER 窶・definition must be tightened
- raw agreement >= 0.75; and
- kappa >= 0.40;
- but GREEN criteria not met.

### RED 窶・redesign or remove
- raw agreement < 0.75; or
- kappa < 0.40.

### Degenerate prevalence
If both scorers give the same constant label and raw agreement is 1.0, reliability is not considered proven. The field is flagged as a floor/ceiling-risk field rather than GREEN.

## Count-field reliability

### GREEN
- exact agreement >= 0.70; and
- within-one agreement >= 0.90.

### AMBER
- exact agreement >= 0.50; and
- within-one agreement >= 0.80.

### RED
Anything below AMBER.

Count fields may be discretized into ordinal bins if exact counts are unreliable but the underlying construct remains important.

## Informativeness

A field with overall prevalence below 0.10 or above 0.90 in the primary coder is flagged for floor/ceiling risk on this task, even if scorer agreement is high.

It may be retained only if:
- it is theoretically central; or
- a second task is expected to activate the opposite category.

## Whole-plan structural separability

Using binary Research Plan State fields:

- between-minus-within mean Hamming distance > 0.05: instrument shows useful pilot separability;
- 0.02 to 0.05: modest; refine before confirmatory study;
- < 0.02: current state vector/method bank is likely too insensitive for Study A.

This is **not** interpreted as a method-specific causal effect because the pilot operational prompts differ in length/detail from CONTROL.

## Vocabulary-trap gate

Even if structural separability is large, proceed only if qualitative inspection confirms that scored differences correspond to operational design choices rather than merely repeating methodology names.

## Confirmatory-study GO condition

Study A may be preregistered only if:
1. pilot raw set validates 21/21;
2. blind double-scoring validates 21/21 for both scorers;
3. enough core fields are GREEN or repairable AMBER to define a stable plan-state vector;
4. no critical conclusion depends on RED fields;
5. a length/detail-matched generic control is added;
6. label-only versus operational framing is separated;
7. common output headings remain method-neutral.
