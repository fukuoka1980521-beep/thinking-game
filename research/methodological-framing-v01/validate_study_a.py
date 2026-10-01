from __future__ import annotations
import hashlib, json
from collections import Counter
from pathlib import Path

BASE=Path(__file__).resolve().parent
METHODS=BASE/"FROZEN_STUDY_A_METHOD_BANK_V1_0.json"
TASKS=BASE/"FROZEN_STUDY_A_TASK_BANK_V1_0.json"
SCHEMA=BASE/"FROZEN_STUDY_A_SCHEMA_V1_0.json"
MANIFEST=BASE/"FROZEN_STUDY_A_MANIFEST_V1_0.jsonl"
PREREG=BASE/"STUDY_A_PREREGISTRATION_V1_0.md"
MEASUREMENT=BASE/"FROZEN_STUDY_A_MEASUREMENT_V1_0.py"
FREEZE=BASE/"STUDY_A_FREEZE_V1_0.json"
RAW=BASE/"study_a"/"raw"
MODEL="gpt-5.6-sol"

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def verify_freeze():
    f=json.loads(FREEZE.read_text(encoding="utf-8"))
    checks={
        "method_bank_sha256":METHODS,
        "task_bank_sha256":TASKS,
        "schema_sha256":SCHEMA,
        "manifest_sha256":MANIFEST,
        "preregistration_sha256":PREREG,
        "measurement_code_sha256":MEASUREMENT,
        "collection_code_sha256":BASE/"run_study_a.py",
        "validator_code_sha256":Path(__file__),
        "analysis_code_sha256":BASE/"analyze_study_a.py",
    }
    for key,path in checks.items():
        if sha(path)!=f[key]:
            raise SystemExit(f"freeze hash mismatch: {path.name}")
    return f

def prompt_for(objective,instruction):
    return f"""RESEARCH OBJECTIVE (identical within task):
{objective}

METHODOLOGICAL FRAMING:
{instruction}

OUTPUT REQUIREMENTS (identical across conditions):
Produce a research plan only, with these neutral headings:
1. Objective and scope
2. Assumptions
3. Research design
4. Data or evidence needed
5. Measurement
6. Analysis
7. Decision / stopping rule
8. Limitations

Within those headings, include whatever elements you judge scientifically necessary.
Do not mention that you are in an experiment comparing methodologies.
Do not use external tools."""

def main():
    f=verify_freeze()
    manifest=[json.loads(x) for x in MANIFEST.read_text(encoding="utf-8").splitlines() if x.strip()]
    if len(manifest)!=336 or len({x["run_id"] for x in manifest})!=336:
        raise SystemExit("manifest invalid")
    expected={x["run_id"]:x for x in manifest}

    files=sorted(RAW.glob("*.json"))
    if len(files)!=336:
        raise SystemExit(f"raw incomplete {len(files)}/336")
    if {p.stem for p in files}!=set(expected):
        raise SystemExit("raw run-id set mismatch")

    methods={x["id"]:x for x in json.loads(METHODS.read_text(encoding="utf-8"))["conditions"]}
    tasks={x["id"]:x for x in json.loads(TASKS.read_text(encoding="utf-8"))["tasks"]}

    response_ids=set()
    counts=Counter()
    for p in files:
        r=json.loads(p.read_text(encoding="utf-8"))
        rid=r.get("run_id")
        m=expected[rid]
        for k in ("task_id","condition_id","method_family","instruction_depth","replicate"):
            if r.get(k)!=m.get(k):
                raise SystemExit(f"manifest metadata mismatch {rid} {k}")
        if r.get("counted") is not True:
            raise SystemExit(f"not counted {rid}")
        if r.get("requested_model")!=MODEL or r.get("returned_model")!=MODEL:
            raise SystemExit(f"model mismatch {rid}")
        if r.get("response_status")!="completed" or r.get("incomplete_details") is not None:
            raise SystemExit(f"incomplete {rid}")
        if r.get("max_output_tokens")!=8000:
            raise SystemExit(f"output budget mismatch {rid}")
        if r.get("temperature")!=1.0 or r.get("top_p")!=1.0 or r.get("reasoning_effort")!="none":
            raise SystemExit(f"generation settings mismatch {rid}")
        api=r.get("response_id")
        if not api or api in response_ids:
            raise SystemExit(f"duplicate/missing response id {rid}")
        response_ids.add(api)
        prompt=prompt_for(tasks[r["task_id"]]["objective"],methods[r["condition_id"]]["instruction"])
        if r.get("prompt_text")!=prompt:
            raise SystemExit(f"prompt mismatch {rid}")
        if r.get("prompt_sha256")!=hashlib.sha256(prompt.encode("utf-8")).hexdigest():
            raise SystemExit(f"prompt hash mismatch {rid}")
        if not str(r.get("raw_text","")).strip():
            raise SystemExit(f"empty output {rid}")
        counts[(r["task_id"],r["method_family"],r["instruction_depth"])]+=1

    for task in ("T1","T2"):
        for family in ("GENERIC","DIFFERENTIAL","BAYESIAN","FALSIFICATION","CAUSAL","STATE_SPACE","SOFTWARE_TESTING"):
            if counts[(task,family,"LABEL_ONLY")]!=18:
                raise SystemExit(f"label-only cell mismatch {task} {family}")
            if counts[(task,family,"OPERATIONAL")]!=6:
                raise SystemExit(f"operational cell mismatch {task} {family}")

    print("STUDY_A_VALIDATION=PASS")
    print("raw=336 response_ids=336")
    print("LABEL_ONLY=252 OPERATIONAL=84")
    print("COUNTED_RUNS_AT_FREEZE="+str(f["counted_runs_at_freeze"]))

if __name__=="__main__":
    main()
