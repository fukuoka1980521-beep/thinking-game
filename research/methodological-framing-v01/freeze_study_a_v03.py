from __future__ import annotations
import hashlib, json, random
from pathlib import Path

BASE = Path(__file__).resolve().parent
CAL = BASE / "calibration_v03" / "analysis" / "CALIBRATION_V03_RESULTS.json"
METHOD_DRAFT = BASE / "METHOD_BANK_STUDY_A_DRAFT.json"
CAL_BANK = BASE / "CALIBRATION_V03_BANK.json"

OUT_METHOD = BASE / "FROZEN_STUDY_A_METHOD_BANK_V1_0.json"
OUT_TASK = BASE / "FROZEN_STUDY_A_TASK_BANK_V1_0.json"
OUT_SCHEMA = BASE / "FROZEN_STUDY_A_SCHEMA_V1_0.json"
OUT_MANIFEST = BASE / "FROZEN_STUDY_A_MANIFEST_V1_0.jsonl"
OUT_PREREG = BASE / "STUDY_A_PREREGISTRATION_V1_0.md"
OUT_FREEZE = BASE / "STUDY_A_FREEZE_V1_0.json"

SEED = 20261002

def sha256_text(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()

def write_json(path: Path, obj):
    path.write_text(json.dumps(obj, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

def main():
    if not CAL.exists():
        raise SystemExit("Calibration analysis missing; freeze forbidden.")

    cal = json.loads(CAL.read_text(encoding="utf-8"))
    if cal["gate"]["study_A_freeze"] != "GO":
        raise SystemExit("Calibration gate is NO_GO; freeze forbidden.")

    methods = json.loads(METHOD_DRAFT.read_text(encoding="utf-8"))
    cal_bank = json.loads(CAL_BANK.read_text(encoding="utf-8"))

    expected = {(c["family"], c["depth"]) for c in methods["conditions"]}
    if len(methods["conditions"]) != 14 or len(expected) != 14:
        raise SystemExit("Method bank must contain unique 7 x 2 conditions.")

    frozen_methods = {
        "version": "Study-A-v1.0-frozen",
        "status": "FROZEN_BEFORE_COUNTED_COLLECTION",
        "factors": methods["factors"],
        "conditions": methods["conditions"],
    }

    tasks = {
        "version": "Study-A-v1.0-frozen",
        "status": "FROZEN_BEFORE_COUNTED_COLLECTION",
        "tasks": cal_bank["tasks"],
    }

    sig = {}
    for family, row in cal["signature_result"].items():
        sig[family] = row["green_fields"] if row["usable"] else []

    general_bool = []
    sample_field = "sample_size_or_power_rationale_present"
    if cal["reliability"]["binary"][sample_field]["gate"] == "GREEN":
        general_bool.append(sample_field)

    secondary = []
    for field in ("explicit_null_hypothesis_present", "strict_stopping_threshold_present"):
        if cal["reliability"]["binary"][field]["gate"] == "GREEN":
            secondary.append(field)

    schema = {
        "version": "Study-A-v1.0-frozen",
        "status": "FROZEN_BEFORE_COUNTED_COLLECTION",
        "primary_general_count_fields": [
            "problem_decomposition_count",
            "explicit_primary_endpoint_count",
            "falsification_criterion_count",
        ],
        "primary_general_boolean_fields": general_bool,
        "confirmatory_signature_fields_by_family": sig,
        "secondary_general_fields": secondary,
        "global_structure_binary_fields": cal["green_binary_fields"],
        "field_selection_rule": "predeclared CALIBRATION_V03_GATE.md applied mechanically",
        "calibration_gate_snapshot": cal["gate"],
    }

    manifest = []
    for task in tasks["tasks"]:
        task_id = task["id"]
        for cond in frozen_methods["conditions"]:
            reps = 18 if cond["depth"] == "LABEL_ONLY" else 6
            for rep in range(1, reps + 1):
                manifest.append({
                    "run_id": f"A-{task_id}-{cond['id']}-R{rep:02d}",
                    "task_id": task_id,
                    "condition_id": cond["id"],
                    "method_family": cond["family"],
                    "instruction_depth": cond["depth"],
                    "replicate": rep,
                })

    if len(manifest) != 336:
        raise SystemExit(f"manifest denominator mismatch: {len(manifest)}")

    rnd = random.Random(SEED)
    rnd.shuffle(manifest)

    method_text = json.dumps(frozen_methods, ensure_ascii=False, indent=2) + "\n"
    task_text = json.dumps(tasks, ensure_ascii=False, indent=2) + "\n"
    schema_text = json.dumps(schema, ensure_ascii=False, indent=2) + "\n"
    manifest_text = "\n".join(json.dumps(x, ensure_ascii=False) for x in manifest) + "\n"

    OUT_METHOD.write_text(method_text, encoding="utf-8")
    OUT_TASK.write_text(task_text, encoding="utf-8")
    OUT_SCHEMA.write_text(schema_text, encoding="utf-8")
    OUT_MANIFEST.write_text(manifest_text, encoding="utf-8")

    usable = [k for k, v in sig.items() if v]
    prereg = f"""# Study A Preregistration v1.0

Status: **FROZEN BEFORE COUNTED COLLECTION**

## Question
With the research objective and generation environment held fixed, does randomized methodological framing change the observable operational structure of an LLM-generated research plan?

## Claim ceiling
This is a black-box study of observable research behavior. It does not measure hidden chain-of-thought or internal neural state and does not rank methodologies as better or worse.

## Design
- acting model: gpt-5.6-sol
- tasks: T1 and T2
- method families: GENERIC, DIFFERENTIAL, BAYESIAN, FALSIFICATION, CAUSAL, STATE_SPACE, SOFTWARE_TESTING
- instruction depths: LABEL_ONLY and OPERATIONAL
- primary treatment: LABEL_ONLY
- LABEL_ONLY repetitions: 18 per method x task cell
- OPERATIONAL repetitions: 6 per method x task cell
- counted denominator: **336 plans**
- fresh independent request for every plan
- no prior conversation, tools, or external evidence
- identical neutral output headings
- randomized manifest order with fixed seed {SEED}
- condition-blinded scoring

## Instrument calibration
A separate 42-plan, two-task, LABEL_ONLY calibration set was generated before counted collection.
The frozen calibration gate was applied mechanically.
Counted outcomes did not exist during instrument selection.

Usable confirmatory method-signature families after calibration:
{", ".join(usable)}

## Primary outcomes

### P1 — Global plan-structure dependence
Using the frozen GREEN binary fields, compute within-method and between-method plan distances among LABEL_ONLY plans within task.

Primary statistic:
mean between-method Hamming distance minus mean within-method Hamming distance.

Inference:
10,000-draw permutation/randomization test. Method labels are permuted within each task while preserving cell sizes. The primary P1 statistic is the mean of the T1 and T2 between-minus-within excess distances.

### P2 — Method-specific operational signatures
For each method family with a non-empty frozen signature field set, define each plan's signature score as the mean of its binary signature fields.

For each task:
difference in mean signature score between that method's LABEL_ONLY condition and GENERIC_LABEL_ONLY.

Report:
- effect size;
- 95% percentile bootstrap confidence interval from 10,000 resamples;
- one-sided 10,000-draw permutation p-value for the preregistered directional hypothesis that the target method increases its own operational signature.

Multiplicity:
Holm correction across all confirmatory method x task signature tests.

### P3 — Cross-task direction
For each confirmatory method family, report whether the sign of the LABEL_ONLY signature effect agrees across T1 and T2.

Cross-task sign agreement is a replication criterion, not a substitute for P1/P2 inference.

## Secondary outcomes
- general design counts and retained general binary fields;
- OPERATIONAL minus LABEL_ONLY amplification;
- method x task interaction;
- family x depth interaction;
- label-redacted method recoverability from plan structure.

Secondary analyses are labeled as such.

## Falsification / weakening criteria
The broad methodological-framing claim is weakened if:
1. P1 shows no excess between-method separation beyond within-method variation;
2. reliable LABEL_ONLY method signatures do not differ from GENERIC;
3. observed differences are confined to directly prescribed OPERATIONAL checklist items;
4. effects fail to replicate in direction across structurally different tasks;
5. conclusions depend on fields that failed calibration reliability.

## Stopping rule
Collect exactly the frozen 336 counted plans unless a documented endpoint failure prevents valid collection.
Do not increase the denominator after inspecting outcomes.
Technical retries that do not become counted first-writer records are logged separately.

## Raw-data rule
First valid write for a run_id is authoritative.
All request settings, response IDs, timestamps, model IDs, token usage, and raw text are preserved.
"""

    OUT_PREREG.write_text(prereg, encoding="utf-8")

    freeze = {
        "version": "Study-A-v1.0",
        "status": "FROZEN_BEFORE_COUNTED_COLLECTION",
        "manifest_n": 336,
        "manifest_seed": SEED,
        "method_bank_sha256": sha256_text(method_text),
        "task_bank_sha256": sha256_text(task_text),
        "schema_sha256": sha256_text(schema_text),
        "manifest_sha256": sha256_text(manifest_text),
        "preregistration_sha256": sha256_text(prereg),
        "calibration_result_sha256": hashlib.sha256(CAL.read_bytes()).hexdigest(),
        "counted_runs_at_freeze": 0,
    }
    write_json(OUT_FREEZE, freeze)

    print("STUDY_A_FREEZE=COMPLETE")
    print("MANIFEST=336")
    print("COUNTED_RUNS_AT_FREEZE=0")
    print("USABLE_SIGNATURE_FAMILIES=" + ",".join(usable))

if __name__ == "__main__":
    main()
