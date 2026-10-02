from __future__ import annotations
import hashlib, json
from collections import Counter
from pathlib import Path

BASE=Path(__file__).resolve().parent
UNIVERSE=BASE/"FROZEN_STUDY_C_EVIDENCE_UNIVERSE_V1_0.json"
MANIFEST=BASE/"FROZEN_STUDY_C_MANIFEST_V1_0.jsonl"
FREEZE=BASE/"STUDY_C_FREEZE_V1_0.json"
RAW=BASE/"study_c"/"raw"
METHODS=BASE/"FROZEN_STUDY_A_METHOD_BANK_V1_0.json"
FAMILIES=["GENERIC","DIFFERENTIAL","BAYESIAN","FALSIFICATION","CAUSAL","STATE_SPACE","SOFTWARE_TESTING"]

def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()

def verify_freeze():
    f=json.loads(FREEZE.read_text(encoding="utf-8"))
    checks={
        "prereg_sha256":BASE/"STUDY_C_PREREGISTRATION_V1_0.md",
        "universe_sha256":UNIVERSE,
        "method_bank_sha256":METHODS,
        "manifest_sha256":MANIFEST,
        "runner_sha256":BASE/"run_study_c.py",
        "validator_sha256":Path(__file__),
        "analyzer_sha256":BASE/"analyze_study_c.py"
    }
    for k,p in checks.items():
        if sha(p)!=f[k]: raise SystemExit(f"freeze hash mismatch {p.name}")
    if f["counted_runs_at_freeze"]!=0: raise SystemExit("counted_runs_at_freeze mismatch")
    return f

def collect_prior_response_ids():
    ids=set()
    for rel in ["study_c_calibration_v01/raw","study_c_calibration_v02/raw"]:
        root=BASE/rel
        if not root.exists(): continue
        for p in root.glob("*.json"):
            try:r=json.loads(p.read_text(encoding="utf-8"))
            except Exception: continue
            for rid in r.get("all_response_ids",[]):
                if rid: ids.add(rid)
    return ids

def main():
    f=verify_freeze()
    manifest={x["run_id"]:x for x in [json.loads(s) for s in MANIFEST.read_text(encoding="utf-8").splitlines() if s.strip()]}
    if len(manifest)!=252: raise SystemExit("manifest n mismatch")
    worlds={w["id"]:w for w in json.loads(UNIVERSE.read_text(encoding="utf-8"))["worlds"]}
    rolemap={wid:{x["module_id"]:x["role"] for x in w["catalog"]} for wid,w in worlds.items()}
    files=sorted(RAW.glob("*.json"))
    if len(files)!=252: raise SystemExit(f"raw {len(files)}/252")
    prior=collect_prior_response_ids()
    seen=set(); counts=Counter()
    for p in files:
        r=json.loads(p.read_text(encoding="utf-8"))
        if r["run_id"] not in manifest: raise SystemExit("run absent from manifest")
        m=manifest[r["run_id"]]
        for k in ("world_id","method_family","replicate","catalog_order"):
            if r.get(k)!=m.get(k): raise SystemExit(f"manifest mismatch {r['run_id']} {k}")
        if r.get("counted") is not True or r.get("study")!="C": raise SystemExit("counted flag mismatch")
        if r.get("requested_model")!="gpt-5.6-sol" or r.get("returned_models")!=["gpt-5.6-sol"]: raise SystemExit("model mismatch")
        mids=r.get("path_module_ids",[]); roles=r.get("path_roles",[])
        if len(mids)!=2 or len(set(mids))!=2: raise SystemExit("path invalid")
        if roles!=[rolemap[r["world_id"]][x] for x in mids] or len(set(roles))!=2: raise SystemExit("role map invalid")
        ids=r.get("all_response_ids",[])
        if len(ids)!=2 or len(set(ids))!=2: raise SystemExit("response ID structure invalid")
        for rid in ids:
            if not rid or rid in seen: raise SystemExit("duplicate counted response ID")
            if rid in prior: raise SystemExit("response ID overlaps calibration")
            seen.add(rid)
        counts[(r["world_id"],r["method_family"])]+=1
    for wid in ("C5","C6"):
        for fam in FAMILIES:
            if counts[(wid,fam)]!=18: raise SystemExit(f"cell mismatch {wid} {fam}")
    print("STUDY_C_VALIDATION=PASS")
    print("RAW=252")
    print("UNIQUE_RESPONSE_IDS=504")
    print("CALIBRATION_RESPONSE_ID_OVERLAP=0")
    print("COUNTED_RUNS_AT_FREEZE="+str(f["counted_runs_at_freeze"]))

if __name__=="__main__": main()
