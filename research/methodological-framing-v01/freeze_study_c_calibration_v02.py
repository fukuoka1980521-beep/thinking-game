from __future__ import annotations
import hashlib, json, random
from datetime import datetime, timezone
from pathlib import Path

BASE=Path(__file__).resolve().parent
PREREG=BASE/"STUDY_C_CALIBRATION_V02_PREREGISTRATION.md"
UNIVERSE=BASE/"STUDY_C_EVIDENCE_UNIVERSE_V02.json"
METHODS=BASE/"FROZEN_STUDY_A_METHOD_BANK_V1_0.json"
RUNNER=BASE/"run_study_c_calibration_v02.py"
ANALYZER=BASE/"analyze_study_c_calibration_v02.py"
MANIFEST=BASE/"FROZEN_STUDY_C_CALIBRATION_V02_MANIFEST.jsonl"
FREEZE=BASE/"STUDY_C_CALIBRATION_V02_FREEZE.json"
ROOT=BASE/"study_c_calibration_v02"
FAMILIES=["GENERIC","DIFFERENTIAL","BAYESIAN","FALSIFICATION","CAUSAL","STATE_SPACE","SOFTWARE_TESTING"]
SEED=2026100207

def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()

def main():
    raw=ROOT/"raw"
    if raw.exists() and any(raw.glob("*.json")): raise SystemExit("refuse freeze: v02 raw exists")
    u=json.loads(UNIVERSE.read_text(encoding="utf-8")); worlds={w["id"]:w for w in u["worlds"]}
    rows=[]
    for wid in ("C3","C4"):
        mids=[x["module_id"] for x in worlds[wid]["catalog"]]
        for fam in FAMILIES:
            for rep in range(1,4):
                rid=f"C02-{wid}-{fam}-R{rep:02d}"
                order=list(mids)
                rr=random.Random(f"{SEED}:{rid}")
                rr.shuffle(order)
                rows.append({"run_id":rid,"world_id":wid,"method_family":fam,"replicate":rep,"catalog_order":order})
    random.Random(SEED).shuffle(rows)
    MANIFEST.write_text("\n".join(json.dumps(x,sort_keys=True,separators=(",",":")) for x in rows)+"\n",encoding="utf-8")
    f={
      "version":"Study-C-calibration-v0.2","status":"FROZEN_BEFORE_NONCOUNTED_CALIBRATION","freeze_timestamp_utc":datetime.now(timezone.utc).isoformat(),
      "calibration_only":True,"counted_runs_at_freeze":0,"manifest_n":42,"manifest_seed":SEED,
      "prereg_sha256":sha(PREREG),"universe_sha256":sha(UNIVERSE),"method_bank_sha256":sha(METHODS),
      "manifest_sha256":sha(MANIFEST),"runner_sha256":sha(RUNNER),"analyzer_sha256":sha(ANALYZER)
    }
    FREEZE.write_text(json.dumps(f,indent=2)+"\n",encoding="utf-8")
    print("STUDY_C_CALIBRATION_V02_FREEZE=PASS")
    print("MANIFEST=42")
    print("COUNTED_RUNS_AT_FREEZE=0")

if __name__=="__main__": main()