# Pilot Deviations

## D-001 窶・obsolete output-template run excluded

During pilot development, the common output template was changed from a method-loaded structure to neutral headings before scientific use of the pilot.

A prompt-hash validator later detected that one file, P-CONTROL-R01, had been generated under the obsolete template while the other 20 current files matched the revised template.

Handling:
- the mismatch was identified solely from prompt SHA-256, before using response content for scientific inference;
- the obsolete file was moved to pilot/excluded/old-template/ and retained for audit;
- it is not part of the 21-run pilot set;
- P-CONTROL-R01 is regenerated under the revised template;
- the full 21-run set must pass prompt-hash validation before blinded scoring.

This is a non-counted pilot deviation and does not affect any preregistered empirical denominator because no confirmatory study has begun.
