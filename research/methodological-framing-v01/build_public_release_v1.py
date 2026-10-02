from __future__ import annotations
import hashlib, json, shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "public_release_v1_0"

if OUT.exists():
    for child in list(OUT.iterdir()):
        if child.is_dir():
            shutil.rmtree(child)
        else:
            child.unlink()
else:
    OUT.mkdir(parents=True, exist_ok=True)
for d in ["data","code","preregistration","results","manuscript"]:
    (OUT/d).mkdir(parents=True, exist_ok=True)

def load_dir(path):
    return [json.loads(p.read_text(encoding="utf-8")) for p in sorted(path.glob("*.json"))]

def public_record(r, study):
    return {
        "study": study,
        "run_id": r["run_id"],
        "task_id": r["task_id"],
        "method_family": r["method_family"],
        "instruction_depth": r["instruction_depth"],
        "replicate": r["replicate"],
        "model": r.get("returned_model") or r.get("requested_model") or r.get("acting_model"),
        "prompt_text": r["prompt_text"],
        "raw_text": r["raw_text"],
        "generation_settings": {
            "max_output_tokens": r.get("max_output_tokens"),
            "temperature": r.get("temperature"),
            "top_p": r.get("top_p"),
            "reasoning_effort": r.get("reasoning_effort"),
            "store": r.get("store"),
        },
    }

study_a = [public_record(r, "StudyA") for r in load_dir(ROOT/"study_a"/"raw")]
r1a = [public_record(r, "R1A") for r in load_dir(ROOT/"replication_r1a"/"raw")]
r1b = [public_record(r, "R1B") for r in load_dir(ROOT/"replication_r1b"/"raw")]
assert (len(study_a),len(r1a),len(r1b)) == (336,126,252)
all_rows = study_a + r1a + r1b
assert len(all_rows) == 714
assert len({r["run_id"] for r in all_rows}) == 714

def write_jsonl(path, rows):
    path.write_text("\n".join(json.dumps(x, ensure_ascii=False, sort_keys=True) for x in rows)+"\n", encoding="utf-8")

write_jsonl(OUT/"data"/"all_counted_plans_714.jsonl", all_rows)

copy_map = {
    "FROZEN_STUDY_A_MEASUREMENT_V1_0.py": "code/FROZEN_STUDY_A_MEASUREMENT_V1_0.py",
    "reproduce_main_results_public_v1.py": "code/reproduce_main_results.py",
    "zero_cost_robustness_public_v1.py": "code/zero_cost_robustness_v1.py",
    "STUDY_A_PREREGISTRATION_V1_0.md": "preregistration/STUDY_A_PREREGISTRATION_V1_0.md",
    "STUDY_A_FREEZE_V1_0.json": "preregistration/STUDY_A_FREEZE_V1_0.json",
    "FROZEN_STUDY_A_METHOD_BANK_V1_0.json": "preregistration/FROZEN_STUDY_A_METHOD_BANK_V1_0.json",
    "FROZEN_STUDY_A_TASK_BANK_V1_0.json": "preregistration/FROZEN_STUDY_A_TASK_BANK_V1_0.json",
    "FROZEN_STUDY_A_MANIFEST_V1_0.jsonl": "preregistration/FROZEN_STUDY_A_MANIFEST_V1_0.jsonl",
    "REPLICATION_R1_PREREGISTRATION_V1_0.md": "preregistration/REPLICATION_R1_PREREGISTRATION_V1_0.md",
    "REPLICATION_R1_FREEZE_V1_0.json": "preregistration/REPLICATION_R1_FREEZE_V1_0.json",
    "FROZEN_REPLICATION_R1_TASK_BANK_V1_0.json": "preregistration/FROZEN_REPLICATION_R1_TASK_BANK_V1_0.json",
    "FROZEN_REPLICATION_R1A_MANIFEST_V1_0.jsonl": "preregistration/FROZEN_REPLICATION_R1A_MANIFEST_V1_0.jsonl",
    "FROZEN_REPLICATION_R1B_MANIFEST_V1_0.jsonl": "preregistration/FROZEN_REPLICATION_R1B_MANIFEST_V1_0.jsonl",
    "study_a/analysis/STUDY_A_RESULTS.json": "results/STUDY_A_RESULTS.json",
    "study_a/analysis/STUDY_A_RESULTS.md": "results/STUDY_A_RESULTS.md",
    "replication_r1/analysis/REPLICATION_R1_RESULTS.json": "results/REPLICATION_R1_RESULTS.json",
    "replication_r1/analysis/REPLICATION_R1_RESULTS.md": "results/REPLICATION_R1_RESULTS.md",
    "zero_cost_analysis/ZERO_COST_ROBUSTNESS_V1.json": "results/ZERO_COST_ROBUSTNESS_V1.json",
    "zero_cost_analysis/ZERO_COST_ROBUSTNESS_V1.md": "results/ZERO_COST_ROBUSTNESS_V1.md",
    "STUDY_A_FINAL_REPORT_V1_0.md": "results/STUDY_A_FINAL_REPORT_V1_0.md",
    "EXTERNAL_REPLICATION_R1_FINAL_REPORT_V1_0.md": "results/EXTERNAL_REPLICATION_R1_FINAL_REPORT_V1_0.md",
    "PREPRINT_METHOD_FRAMING_V1_0.md": "manuscript/PREPRINT_METHOD_FRAMING_V1_0.md",
    "BIBLIOGRAPHY_VERIFICATION_20261003.md": "manuscript/BIBLIOGRAPHY_VERIFICATION_20261003.md",
}
for src, dst in copy_map.items():
    s = ROOT/src
    if not s.exists():
        raise SystemExit(f"missing source: {src}")
    shutil.copy2(s, OUT/dst)

readme = """# Methodological Framing Public Release v1.0

Creator: Shinobu Fukuoka
Release date: 2026-10-03

## Counted data
- Study A: 336 plans
- External Replication R1: 378 plans
- Total: 714 complete counted plans

The partial Study C dataset is intentionally excluded because its frozen denominator was not completed.

## Privacy / release hygiene
Public JSONL records exclude response identifiers, raw API envelopes, timestamps, usage/billing metadata, local filesystem paths, private infrastructure details, and credentials.

## Reproduction
Requirements: Python 3 and NumPy.

Core confirmatory and replication results:
python code/reproduce_main_results.py

The default uses the frozen 10,000-permutation setting. For a local smoke test only:
python code/reproduce_main_results.py --permutations 100

Post-hoc zero-cost robustness:
python code/zero_cost_robustness_v1.py

The robustness script also defaults to 10,000 permutations. A smoke-test override can be supplied with MF_PERMUTATIONS.

No model API call is required for any reproduction command in this release.

## Scientific boundary
Classification recoverability is not methodology quality. This release supports claims about observable black-box research-plan signatures only. It does not expose hidden chain-of-thought or neural states.
"""
(OUT/"README.md").write_text(readme,encoding="utf-8")

citation = """cff-version: 1.2.0
message: "If you use this dataset or code, please cite this work."
title: "Methodological Framing Induces Replicable Research-Plan Signatures in Large Language Models"
version: "1.0"
date-released: "2026-10-03"
authors:
  - family-names: "Fukuoka"
    given-names: "Shinobu"
type: dataset
"""
(OUT/"CITATION.cff").write_text(citation,encoding="utf-8")

lines=[]
for p in sorted(x for x in OUT.rglob("*") if x.is_file()):
    if p.name=="SHA256SUMS.txt": continue
    h=hashlib.sha256(p.read_bytes()).hexdigest()
    lines.append(f"{h}  {p.relative_to(OUT).as_posix()}")
(OUT/"SHA256SUMS.txt").write_text("\n".join(lines)+"\n",encoding="utf-8")

print("PUBLIC_RELEASE_BUILD=PASS")
print("STUDY_A=336 R1A=126 R1B=252 TOTAL=714")
print("FILES="+str(sum(1 for x in OUT.rglob("*") if x.is_file())))
