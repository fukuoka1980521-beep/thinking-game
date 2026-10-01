# Method Validation

Synthetic fixtures validate the implementation only. They never count as research observations.

Before data collection:
- semantic disagreement metrics must return known values;
- identical states must have zero distance;
- component changes must increase state distance;
- premise hardening must require threshold crossing without new evidence;
- amplification/correction math must treat zero-pre-error ratios as undefined;
- evaluator-agreement metrics must behave on known perfect/imperfect cases;
- sensitivity aggregation must respect condition labels;
- record validation must reject invalid ranges, duplicates, and non-fresh independent runs.

Passing these tests validates measurement code, not hypotheses.
