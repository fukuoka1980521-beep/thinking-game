from __future__ import annotations
import json, math
from collections import Counter
from pathlib import Path
import numpy as np

BASE=Path(__file__).resolve().parent
RAW=BASE/"study_b_calibration_v01"/"raw"
OUT=BASE/"study_b_calibration_v01"/"analysis"
FAMILIES=["GENERIC","DIFFERENTIAL","BAYESIAN","FALSIFICATION","CAUSAL","STATE_SPACE","SOFTWARE_TESTING"]
NON_GENERIC=[x for x in FAMILIES if x!="GENERIC"]
CONCLUSIONS=["SUPPORTS_MOST","DOES_NOT_SUPPORT_MOST","INCONCLUSIVE"]
ACTIONS=["ACCEPT_TARGET_FOR_NOW","REJECT_TARGET_FOR_NOW","COLLECT_MORE_EVIDENCE"]
EIDS=[f"E{i}" for i in range(1,9)]
SEED=2026100203
N_PERM=10000

def vec(state):
    x=[]
    x += [1.0 if state["conclusion"]==c else 0.0 for c in CONCLUSIONS]
    x += [1.0 if state["next_action"]==a else 0.0 for a in ACTIONS]
    x += [state["confidence"]/100.0]
    ds=set(state["decisive_evidence_ids"])
    x += [1.0 if e in ds else 0.0 for e in EIDS]
    x += [1.0 if state["strongest_counterevidence_id"]==e else 0.0 for e in EIDS]
    a=np.array(x,dtype=float)
    n=np.linalg.norm(a)
    return a/n if n else a

def predict(train_rows,test_rows,override_labels=None):
    labels=override_labels if override_labels is not None else [r["method_family"] for r in train_rows]
    X=np.stack([vec(r["state"]) for r in train_rows])
    Y=np.stack([vec(r["state"]) for r in test_rows])
    centroids=[]
    for fam in FAMILIES:
        ids=[i for i,l in enumerate(labels) if l==fam]
        c=X[ids].mean(axis=0)
        n=np.linalg.norm(c)
        centroids.append(c/n if n else c)
    C=np.stack(centroids)
    sims=Y@C.T
    idx=np.argmax(sims,axis=1)
    pred=[FAMILIES[int(i)] for i in idx]
    truth=[r["method_family"] for r in test_rows]
    correct=sum(a==b for a,b in zip(truth,pred))
    return correct/len(truth),pred

def main():
    files=sorted(RAW.glob("*.json"))
    if len(files)!=42: raise SystemExit(f"expected 42 raw, got {len(files)}")
    rows=[]
    response_ids=set()
    for p in files:
        r=json.loads(p.read_text(encoding="utf-8"))
        if r.get("counted") is not False or r.get("calibration_only") is not True: raise SystemExit("bad calibration flags")
        if r.get("response_status")!="completed" or r.get("incomplete_details") is not None: raise SystemExit("incomplete response")
        rid=r.get("response_id")
        if not rid or rid in response_ids: raise SystemExit("duplicate response id")
        response_ids.add(rid)
        rows.append(r)

    b1=[r for r in rows if r["packet_id"]=="B1"]
    b2=[r for r in rows if r["packet_id"]=="B2"]
    if len(b1)!=21 or len(b2)!=21: raise SystemExit("packet denominator mismatch")
    for packet,rs in (("B1",b1),("B2",b2)):
        counts=Counter(r["method_family"] for r in rs)
        if any(counts[f]!=3 for f in FAMILIES): raise SystemExit(f"{packet} cell mismatch")

    a12,p12=predict(b1,b2)
    a21,p21=predict(b2,b1)
    combined=(sum(r["method_family"]==p for r,p in zip(b2,p12))+sum(r["method_family"]==p for r,p in zip(b1,p21)))/42

    rng=np.random.default_rng(SEED)
    lab1=[r["method_family"] for r in b1]
    lab2=[r["method_family"] for r in b2]
    obs_correct=round(combined*42)
    hits=0
    for _ in range(N_PERM):
        l1=list(rng.permutation(lab1)); l2=list(rng.permutation(lab2))
        _,q12=predict(b1,b2,l1); _,q21=predict(b2,b1,l2)
        c=sum(r["method_family"]==p for r,p in zip(b2,q12))+sum(r["method_family"]==p for r,p in zip(b1,q21))
        if c>=obs_correct: hits+=1
    pval=(hits+1)/(N_PERM+1)

    pooled=[]
    for r,p in zip(b2,p12): pooled.append((r["method_family"],p))
    for r,p in zip(b1,p21): pooled.append((r["method_family"],p))
    recall={}
    for fam in FAMILIES:
        xs=[p for t,p in pooled if t==fam]
        recall[fam]=sum(p==fam for p in xs)/len(xs)
    coverage=sum(recall[f]>=1/3 for f in NON_GENERIC)

    conclusions=sorted(set(r["state"]["conclusion"] for r in rows))
    actions=sorted(set(r["state"]["next_action"] for r in rows))
    diversity=(len(conclusions)>=2 or len(actions)>=2)

    checks={
      "raw_42_complete_unique":len(response_ids)==42,
      "combined_accuracy_ge_0_35":combined>=0.35,
      "B1_to_B2_accuracy_ge_0_25":a12>=0.25,
      "B2_to_B1_accuracy_ge_0_25":a21>=0.25,
      "permutation_p_le_0_01":pval<=0.01,
      "non_generic_recall_coverage_ge_3_of_6":coverage>=3,
      "state_diversity":diversity
    }
    gate="GO" if all(checks.values()) else "NO_GO"

    result={
      "calibration_only":True,
      "counted":False,
      "n":42,
      "B1_to_B2_accuracy":a12,
      "B2_to_B1_accuracy":a21,
      "combined_accuracy":combined,
      "chance_accuracy":1/7,
      "permutation_n":N_PERM,
      "permutation_p_one_sided":pval,
      "pooled_recall":recall,
      "non_generic_recall_coverage_ge_one_third":coverage,
      "observed_conclusions":conclusions,
      "observed_next_actions":actions,
      "gate_checks":checks,
      "study_B_counted_freeze":gate
    }
    OUT.mkdir(parents=True,exist_ok=True)
    (OUT/"STUDY_B_CALIBRATION_V01_RESULTS.json").write_text(json.dumps(result,indent=2),encoding="utf-8")
    lines=[
      "# Study B Calibration v0.1 Results","",
      "**NON-COUNTED INSTRUMENT CALIBRATION.**","",
      f"- Counted Study B freeze: **{gate}**",
      f"- B1 -> B2 accuracy: **{a12:.4f}**",
      f"- B2 -> B1 accuracy: **{a21:.4f}**",
      f"- combined accuracy: **{combined:.4f}**",
      f"- chance: **{1/7:.4f}**",
      f"- 10,000-permutation p: **{pval:.6f}**",
      f"- non-generic recall coverage >=1/3: **{coverage}/6**","",
      "## Pooled recall"
    ]
    for fam in FAMILIES: lines.append(f"- {fam}: {recall[fam]:.4f}")
    lines += ["","## State diversity",f"- conclusions: {', '.join(conclusions)}",f"- next actions: {', '.join(actions)}","","Calibration outcomes are engineering evidence only, not scientific evidence for Study B."]
    (OUT/"STUDY_B_CALIBRATION_V01_RESULTS.md").write_text("\n".join(lines)+"\n",encoding="utf-8")
    print("STUDY_B_CALIBRATION_V01_ANALYSIS_COMPLETE")
    print("STUDY_B_COUNTED_FREEZE="+gate)
    print(f"B1_TO_B2={a12:.6f}")
    print(f"B2_TO_B1={a21:.6f}")
    print(f"COMBINED={combined:.6f}")
    print(f"PERM_P={pval:.6f}")
    print(f"COVERAGE={coverage}/6")

if __name__=="__main__":
    main()
