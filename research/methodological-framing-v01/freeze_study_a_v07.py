from __future__ import annotations
import hashlib, json, random
from datetime import datetime, timezone
from pathlib import Path

BASE=Path(__file__).resolve().parent
CAL=BASE/"calibration_v07_deterministic"/"CALIBRATION_V07_RESULTS.json"
CAL_GATE=BASE/"CALIBRATION_V07_GATE.md"
CAL_SPEC=BASE/"DETERMINISTIC_MEASUREMENT_V0_7.md"
METHOD_DRAFT=BASE/"METHOD_BANK_STUDY_A_DRAFT.json"
CAL_BANK=BASE/"CALIBRATION_V06_BANK.json"
MEASUREMENT=BASE/"FROZEN_STUDY_A_MEASUREMENT_V1_0.py"
COLLECTION=BASE/"run_study_a.py"
VALIDATOR=BASE/"validate_study_a.py"
ANALYSIS=BASE/"analyze_study_a.py"
RAW=BASE/"study_a"/"raw"

OUT_METHOD=BASE/"FROZEN_STUDY_A_METHOD_BANK_V1_0.json"
OUT_TASK=BASE/"FROZEN_STUDY_A_TASK_BANK_V1_0.json"
OUT_SCHEMA=BASE/"FROZEN_STUDY_A_SCHEMA_V1_0.json"
OUT_MANIFEST=BASE/"FROZEN_STUDY_A_MANIFEST_V1_0.jsonl"
OUT_PREREG=BASE/"STUDY_A_PREREGISTRATION_V1_0.md"
OUT_FREEZE=BASE/"STUDY_A_FREEZE_V1_0.json"

SEED=20261002
N_PERM=10000

def sha_text(text):
    return hashlib.sha256(text.encode("utf-8")).hexdigest()

def sha_file(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def main():
    if not CAL.exists():
        raise SystemExit("v0.7 calibration result missing")
    cal=json.loads(CAL.read_text(encoding="utf-8"))
    if cal.get("gate")!="GO":
        raise SystemExit("v0.7 calibration gate is not GO")

    existing=list(RAW.glob("*.json")) if RAW.exists() else []
    if existing:
        raise SystemExit(f"counted raw already exists before freeze: {len(existing)}")

    methods=json.loads(METHOD_DRAFT.read_text(encoding="utf-8"))
    cal_bank=json.loads(CAL_BANK.read_text(encoding="utf-8-sig"))
    if len(methods["conditions"])!=14:
        raise SystemExit("method condition count must be 14")
    pairs={(x["family"],x["depth"]) for x in methods["conditions"]}
    if len(pairs)!=14:
        raise SystemExit("method family/depth pairs not unique")

    frozen_methods={
        "version":"Study-A-v1.0-frozen",
        "status":"FROZEN_BEFORE_COUNTED_COLLECTION",
        "factors":methods["factors"],
        "conditions":methods["conditions"],
    }
    tasks={
        "version":"Study-A-v1.0-frozen",
        "status":"FROZEN_BEFORE_COUNTED_COLLECTION",
        "tasks":cal_bank["tasks"],
    }
    schema={
        "version":"Study-A-v1.0-frozen",
        "status":"FROZEN_BEFORE_COUNTED_COLLECTION",
        "claim_ceiling":"observable black-box research-plan behavior only",
        "acting_model":"gpt-5.6-sol",
        "generation":{
            "store":False,
            "max_output_tokens":8000,
            "temperature":1.0,
            "top_p":1.0,
            "reasoning_effort":"none",
            "max_workers":8
        },
        "primary":{
            "subset":"LABEL_ONLY",
            "n":252,
            "cell_repetitions":18,
            "algorithm":"broad-method-lexicon-masked word unigram+bigram TF-IDF; cross-task nearest centroid",
            "directions":["train T1 -> test T2","train T2 -> test T1"],
            "chance_accuracy":1/7,
            "permutations":N_PERM,
            "permutation_seed":SEED,
            "success_rule":"combined permutation p <= 0.01 and both directional accuracies > 1/7"
        },
        "secondary":{
            "subset":"OPERATIONAL",
            "n":84,
            "cell_repetitions":6,
            "analyses":[
                "same cross-task classification and permutation procedure",
                "cross-task same-method versus different-method cosine distance",
                "OPERATIONAL minus LABEL_ONLY accuracy difference"
            ]
        },
        "calibration":{
            "source":"calibration_v06 42-plan non-counted set analyzed with frozen v0.7 deterministic instrument",
            "v07_gate":"GO",
            "v07_combined_accuracy":cal["combined_accuracy"],
            "v07_permutation_p":cal["permutation_p_one_sided"],
            "v07_distance_excess":cal["cross_task_distance"]["between_minus_within"]
        }
    }

    manifest=[]
    for task in tasks["tasks"]:
        for cond in frozen_methods["conditions"]:
            reps=18 if cond["depth"]=="LABEL_ONLY" else 6
            for rep in range(1,reps+1):
                manifest.append({
                    "run_id":f"A-{task['id']}-{cond['id']}-R{rep:02d}",
                    "task_id":task["id"],
                    "condition_id":cond["id"],
                    "method_family":cond["family"],
                    "instruction_depth":cond["depth"],
                    "replicate":rep
                })
    if len(manifest)!=336 or len({x["run_id"] for x in manifest})!=336:
        raise SystemExit("manifest denominator/uniqueness mismatch")
    rnd=random.Random(SEED)
    rnd.shuffle(manifest)

    method_text=json.dumps(frozen_methods,ensure_ascii=False,indent=2)+"\n"
    task_text=json.dumps(tasks,ensure_ascii=False,indent=2)+"\n"
    schema_text=json.dumps(schema,ensure_ascii=False,indent=2)+"\n"
    manifest_text="\n".join(json.dumps(x,ensure_ascii=False) for x in manifest)+"\n"

    OUT_METHOD.write_text(method_text,encoding="utf-8")
    OUT_TASK.write_text(task_text,encoding="utf-8")
    OUT_SCHEMA.write_text(schema_text,encoding="utf-8")
    OUT_MANIFEST.write_text(manifest_text,encoding="utf-8")

    prereg=f"""# Study A Preregistration v1.0

Status: FROZEN BEFORE COUNTED COLLECTION

## Research question

Holding the research objective, acting model, generation settings, and neutral output headings fixed, does changing the methodological framing produce a task-general change in the observable structure of an LLM-generated research plan?

## Claim ceiling

This is a black-box behavioral study. It measures observable plan text and does not reveal hidden chain-of-thought, internal neural variables, or prove that any methodology is better.

## Acting model and generation

- model: gpt-5.6-sol
- fresh independent API request for every counted plan
- no prior conversation
- no tools or external evidence
- store=false
- max_output_tokens=8000
- temperature=1.0
- top_p=1.0
- reasoning effort: none
- maximum concurrent requests: 8
- only status=completed responses with incomplete_details=null may become counted first-writer records

## Experimental factors

Tasks:
- T1: LLM response-variation research problem
- T2: cross-site workplace completion-time research problem

Method families:
- GENERIC
- DIFFERENTIAL
- BAYESIAN
- FALSIFICATION
- CAUSAL
- STATE_SPACE
- SOFTWARE_TESTING

Instruction depth:
- LABEL_ONLY
- OPERATIONAL

The research objective is identical within task. Only methodological framing differs across treatment cells.

## Denominator and stopping rule

- LABEL_ONLY: 18 plans per method x task cell = 252 plans
- OPERATIONAL: 6 plans per method x task cell = 84 plans
- total counted denominator: 336 plans
- randomized manifest order, seed {SEED}
- stop at the frozen 336 valid first-writer records
- do not increase N after observing outcomes
- failed/incomplete technical attempts are not counted and are logged

## Instrument-development history

Earlier semantic LLM-judge instruments v0.4-v0.6 were rejected by frozen calibration gates because scorer reliability was inadequate.

A judge-free deterministic instrument was then frozen before analyzing the v0.6 calibration text:
- broad explicit method labels and canonical method-specific lexicon are removed;
- remaining text is represented by word unigram+bigram TF-IDF;
- the vectorizer is fitted on the training task only;
- each method is represented by its training-task centroid;
- plans from the opposite task are classified by cosine similarity to those centroids.

Calibration v0.7 passed its predeclared gate:
- T1 -> T2: {cal["train_T1_test_T2"]["correct"]}/21
- T2 -> T1: {cal["train_T2_test_T1"]["correct"]}/21
- combined: {cal["combined_correct"]}/42
- permutation p: {cal["permutation_p_one_sided"]}
- between-minus-within cross-task distance: {cal["cross_task_distance"]["between_minus_within"]}

Calibration results are engineering evidence only and are not counted Study A findings.

## Primary hypothesis and outcome

Primary subset: 252 LABEL_ONLY plans.

H1:
After removing explicit method labels and the frozen broad method-specific lexicon, research plans retain a task-general signature of methodological framing.

Primary statistic:
combined number of correct held-out cross-task predictions from:
1. train on all T1 LABEL_ONLY plans and predict T2;
2. train on all T2 LABEL_ONLY plans and predict T1.

Chance reference: 1/7.

Primary inference:
10,000-permutation one-sided randomization test, seed {SEED}.
For each direction, shuffle only the training-task method labels while preserving the 18-per-class label multiset, refit centroids, and predict the untouched opposite-task plans.

Confirmatory success rule:
- combined permutation p <= 0.01; AND
- T1 -> T2 accuracy > 1/7; AND
- T2 -> T1 accuracy > 1/7.

Report combined and directional accuracies, correct counts, confusion matrix, and per-family recall.

## Convergent secondary measure

For LABEL_ONLY plans, fit the same masked TF-IDF representation on all 252 plans without using labels in feature fitting.

Compute cross-task cosine distance for:
- same-method pairs;
- different-method pairs.

Report mean between-method distance minus mean within-method distance.
A positive value is convergent evidence of task-general method structure but is not required for primary confirmatory success.

## Secondary OPERATIONAL analysis

Apply the same frozen classification algorithm to the 84 OPERATIONAL plans:
- 6 plans per method x task cell;
- T1 -> T2 and T2 -> T1 classification;
- 10,000-permutation one-sided p-value;
- cross-task distance;
- OPERATIONAL minus LABEL_ONLY combined-accuracy difference.

These are secondary and do not alter the primary success rule.

## Falsification / weakening

The planning-effect claim is weakened if the primary permutation result is not significant at the frozen 0.01 level, or if either cross-task direction fails to exceed chance.

A result driven only by OPERATIONAL prompts, while LABEL_ONLY fails, does not satisfy the primary claim.

## Raw-data integrity

For every counted run preserve:
- exact prompt text and SHA-256;
- request body and generation settings;
- request/response timestamps;
- provider response ID;
- returned model ID;
- token usage;
- raw response JSON;
- extracted raw plan text.

First valid write for a run_id is authoritative.
"""

    OUT_PREREG.write_text(prereg,encoding="utf-8")

    freeze={
        "version":"Study-A-v1.0",
        "status":"FROZEN_BEFORE_COUNTED_COLLECTION",
        "freeze_timestamp_utc":datetime.now(timezone.utc).isoformat(),
        "manifest_n":336,
        "manifest_seed":SEED,
        "counted_runs_at_freeze":0,
        "method_bank_sha256":sha_file(OUT_METHOD),
        "task_bank_sha256":sha_file(OUT_TASK),
        "schema_sha256":sha_file(OUT_SCHEMA),
        "manifest_sha256":sha_file(OUT_MANIFEST),
        "preregistration_sha256":sha_file(OUT_PREREG),
        "measurement_code_sha256":sha_file(MEASUREMENT),
        "collection_code_sha256":sha_file(COLLECTION),
        "validator_code_sha256":sha_file(VALIDATOR),
        "analysis_code_sha256":sha_file(ANALYSIS),
        "calibration_v07_result_sha256":sha_file(CAL),
        "calibration_v07_gate_sha256":sha_file(CAL_GATE),
        "calibration_v07_spec_sha256":sha_file(CAL_SPEC)
    }
    OUT_FREEZE.write_text(json.dumps(freeze,indent=2)+"\n",encoding="utf-8")

    print("STUDY_A_FREEZE=COMPLETE")
    print("MANIFEST=336")
    print("LABEL_ONLY=252")
    print("OPERATIONAL=84")
    print("COUNTED_RUNS_AT_FREEZE=0")

if __name__=="__main__":
    main()
