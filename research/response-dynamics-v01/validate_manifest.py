from __future__ import annotations
import json
from collections import Counter, defaultdict
from pathlib import Path

BASE=Path(__file__).resolve().parent

def read_jsonl(path):
    return [json.loads(x) for x in path.read_text(encoding="utf-8").splitlines() if x.strip()]

def main():
    bank=json.loads((BASE/"ANCHOR_BANK.json").read_text(encoding="utf-8"))
    manifest=read_jsonl(BASE/"FROZEN_MANIFEST_V0_1.jsonl")
    ids={a["id"] for a in bank["anchors"]}
    errors=[]

    if len(bank["anchors"]) != 16:
        errors.append(f"anchor_count={len(bank['anchors'])}, expected 16")
    if len(manifest) != 336:
        errors.append(f"manifest_count={len(manifest)}, expected 336")

    run_ids=[r["run_id"] for r in manifest]
    if len(run_ids) != len(set(run_ids)):
        errors.append("duplicate run_id")
    if any(r["anchor_id"] not in ids for r in manifest):
        errors.append("unknown anchor_id in manifest")

    indep=[r for r in manifest if r["run_type"]=="INDEPENDENT"]
    traj=[r for r in manifest if r["run_type"]=="TRAJECTORY"]
    if len(indep) != 216:
        errors.append(f"independent_count={len(indep)}, expected 216")
    if len(traj) != 120:
        errors.append(f"trajectory_count={len(traj)}, expected 120")
    if any(not r["fresh_context"] for r in indep):
        errors.append("independent run with fresh_context=false")

    traj_ids=set(bank["trajectory_anchor_ids"])
    for aid in traj_ids:
        ar=[r for r in traj if r["anchor_id"]==aid]
        if len(ar) != 20:
            errors.append(f"{aid}: trajectory rows={len(ar)}, expected 20")
        for rep in range(1,5):
            rr=[r for r in ar if r["replicate"]==rep]
            turns=Counter((x["turn"],x["condition"]) for x in rr)
            expected={(1,"TRAJECTORY_BASE"),(2,"TRAJECTORY_BASE"),(3,"TRAJECTORY_BASE"),(4,"VERIFICATION_RELEVANT"),(4,"VERIFICATION_IRRELEVANT")}
            if set(turns) != expected:
                errors.append(f"{aid} rep{rep}: bad branch structure")

    counts=Counter(r["condition"] for r in manifest)
    expected_counts={
        "BASELINE_EXACT":80,
        "PARAPHRASE_A":32,
        "PARAPHRASE_B":32,
        "IRRELEVANT_CONTEXT":32,
        "PRIOR_ANSWER":32,
        "REFERENT_BOUND":8,
        "TRAJECTORY_BASE":72,
        "VERIFICATION_RELEVANT":24,
        "VERIFICATION_IRRELEVANT":24,
    }
    if dict(counts) != expected_counts:
        errors.append(f"condition_counts={dict(counts)}")

    if errors:
        for e in errors:
            print("ERROR:",e)
        return 1
    print("PASS anchors=16 manifest=336 independent=216 trajectory=120")
    print("CONDITIONS",dict(counts))
    return 0

if __name__=="__main__":
    raise SystemExit(main())
