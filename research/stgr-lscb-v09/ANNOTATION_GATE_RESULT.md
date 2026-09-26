# v0.9 Annotation Gate Result

Status: **STOP — LIVE ACTING RUN NOT PERMITTED**

Exact-state blind annotation completed before any acting-model output.

Agreement:
- YES: V9B05, V9B07 = 2
- NO: V9B02, V9B03, V9B04, V9B06 = 4
- disagreement: V9B01, V9B08 = 2

The frozen preregistration requires at least 3 agreed YES and 3 agreed NO.

Therefore v0.9 correctly stops before the acting-model run.

Important: this is not a technical failure. The exact-state repair exposed that two v0.8 cases are genuinely ambiguous across annotators and that one former YES case (V9B06) becomes NO once the latest step is included.

No disagreement is post-hoc resolved and no extra same-corpus case is added to force the gate.

Next step: move to a new independent corpus using the corrected v0.9 measurement architecture from the start.
