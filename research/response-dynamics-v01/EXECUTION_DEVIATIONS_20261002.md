# Execution Deviations — 2026-10-02

Recorded during collection without inspecting response content.

## D-001 — duplicate uncounted API call during runner resume
- Counted collection had started.
- The original runner continued executing after its Remote Desktop Commander terminal session became unavailable.
- A second resume runner was started after an intermediate filesystem count check.
- The second runner reached `I-F03-PARAPHRASE_A-R02` after the original runner had already created that run's immutable raw file.
- The second runner made an API request but `save_result` refused to overwrite the existing raw file and exited with `Refusing to overwrite raw response`.
- Therefore one additional model generation occurred but was **not saved and is not counted** in the frozen 336 denominator.
- No response content was inspected to choose which output to retain; the pre-existing first-writer raw file remained authoritative.
- Because each independent request carries no conversation or previous-response linkage, this duplicate generation does not alter the input/state of later counted runs.
- No condition, anchor, repetition count, scoring rule, or denominator is changed.


## D-002 — operator exposure to sample raw text during token aggregation
- After collection completed, a PowerShell UTF-8/code-page mismatch caused `ConvertFrom-Json` errors while attempting aggregate token counts.
- The error output expanded portions of several raw response files into the operator console before blinded scoring.
- Python validation had already established that all 336 files are valid UTF-8 JSON; no raw file was modified.
- The scoring protocol remains automated and condition-label-blinded; no manual scores or scoring-rule changes were made after this exposure.
- Subsequent aggregate processing uses Python with explicit UTF-8 decoding.
