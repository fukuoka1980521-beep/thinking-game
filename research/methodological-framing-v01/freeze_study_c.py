from __future__ import annotations
import hashlib, json, random
from datetime import datetime, timezone
from pathlib import Path

BASE=Path(__file__).resolve().parent
PREREG=BASE/"STUDY_C_PREREGISTRATION_V1_0.md"
UNIVERSE=BASE/"FROZEN_STUDY_C_EVIDENCE_UNIVERSE_V1_0.json"
METHODS=BASE/"FROZEN_STUDY_A_METHOD_BANK_V1_0.json"
RUNNER=BASE/"run_study_c.py"
VALIDATOR=BASE/"validate_study_c.py"
ANALYZER=BASE/"analyze_study_c.py"
MANIFEST=BASE/"FROZEN_STUDY_C_MANIFEST_V1_0.jsonl"
FREEZE=BASE/"STUDY_C_FREEZE_V1_0.json"
ROOT=BASE/"study_c"
FAMILIES=["GENERIC","DIFFERENTIAL","BAYESIAN","FALSIFICATION","CAUSAL","STATE_SPACE","SOFTWARE_TESTING"]
SEED=2026100211

def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()

def main():
    raw=ROOT/"raw"
    if raw.exists() and any(raw.glob("*.json")):
        raise SystemExit("refuse freeze: counted Study C raw exists")

    u=json.loads(UNIVERSE.read_text(encoding="utf-8"))
    worlds={w["id"]:w for w in u["worlds"]}
    if set(worlds)!={"C5","C6"}:
        raise SystemExit("world bank mismatch")

    rows=[]
    for wid in ("C5","C6"):
        mids=[x["module_id"] for x in worlds[wid]["catalog"]]
        for fam in FAMILIES:
            for rep in range(1,19):
                rid=f"SC-{wid}-{fam}-R{rep:02d}"
                order=list(mids)
                rr=random.Random(f"{SEED}:{rid}")
                rr.shuffle(order)
                rows.append({
                    "run_id":rid,"world_id":wid,"method_family":fam,
                    "replicate":rep,"catalog_order":order
                })
    random.Random(SEED).shuffle(rows)
    if len(rows)!=252 or len({x["run_id"] for x in rows})!=252:
        raise SystemExit("manifest construction failure")

    MANIFEST.write_text("\n".join(json.dumps(x,sort_keys=True,separators=(",",":")) for x in rows)+"\n",encoding="utf-8")

    f={
        "version":"Study-C-v1.0",
        "status":"FROZEN_BEFORE_COUNTED_COLLECTION",
        "freeze_timestamp_utc":datetime.now(timezone.utc).isoformat(),
        "counted_runs_at_freeze":0,
        "manifest_n":252,
        "manifest_seed":SEED,
        "api_selection_calls_expected":504,
        "prereg_sha256":sha(PREREG),
        "universe_sha256":sha(UNIVERSE),
        "method_bank_sha256":sha(METHODS),
        "manifest_sha256":sha(MANIFEST),
        "runner_sha256":sha(RUNNER),
        "validator_sha256":sha(VALIDATOR),
        "analyzer_sha256":sha(ANALYZER),
        "calibration_v02_results_sha256":sha(BASE/"study_c_calibration_v02"/"analysis"/"STUDY_C_CALIBRATION_V02_RESULTS.json")
    }
    FREEZE.write_text(json.dumps(f,indent=2)+"\n",encoding="utf-8")
    print("STUDY_C_FREEZE=PASS")
    print("MANIFEST=252")
    print("EXPECTED_SELECTION_CALLS=504")
    print("COUNTED_RUNS_AT_FREEZE=0")

if __name__=="__main__": main()
