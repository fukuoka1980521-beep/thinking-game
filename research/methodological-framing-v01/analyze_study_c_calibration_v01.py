from __future__ import annotations
import json
from collections import Counter, defaultdict
from itertools import product
from pathlib import Path
from statistics import mean
import numpy as np

BASE=Path(__file__).resolve().parent
UNIVERSE=BASE/"STUDY_C_EVIDENCE_UNIVERSE_V01.json"
RAW=BASE/"study_c_calibration_v01"/"raw"
OUT=BASE/"study_c_calibration_v01"/"analysis"
FAMILIES=["GENERIC","DIFFERENTIAL","BAYESIAN","FALSIFICATION","CAUSAL","STATE_SPACE","SOFTWARE_TESTING"]
NON_GENERIC=[x for x in FAMILIES if x!="GENERIC"]
ROLES=[f"R{i}" for i in range(1,9)]
N_PERM=10000
SEED=2026100206
MAX_OPEN=4
MIN_STOP=2

def norm(x):
    a=np.asarray(x,dtype=float)
    n=np.linalg.norm(a)
    return a/n if n else a

def full_vec(path):
    first=[1.0 if path and path[0]==r else 0.0 for r in ROLES]
    selected=set(path)
    setv=[1.0 if r in selected else 0.0 for r in ROLES]
    order=[]
    for pos in range(MAX_OPEN):
        role=path[pos] if pos<len(path) else None
        order += [1.0 if role==r else 0.0 for r in ROLES]
    return norm(first+setv+order+[len(path)/MAX_OPEN])

def set_vec(path):
    s=set(path)
    return norm([1.0 if r in s else 0.0 for r in ROLES])

def order_vec(path):
    order=[]
    for pos in range(MAX_OPEN):
        role=path[pos] if pos<len(path) else None
        order += [1.0 if role==r else 0.0 for r in ROLES]
    return norm(order+[len(path)/MAX_OPEN])

def classify(train,test,vec_fn,override_labels=None):
    labels=override_labels if override_labels is not None else [r["method_family"] for r in train]
    X=np.stack([vec_fn(r["path_roles"]) for r in train])
    Y=np.stack([vec_fn(r["path_roles"]) for r in test])
    C=[]
    for fam in FAMILIES:
        ids=[i for i,l in enumerate(labels) if l==fam]
        if len(ids)!=3: raise RuntimeError(f"bad training cell {fam}={len(ids)}")
        C.append(norm(X[ids].mean(axis=0)))
    pred_idx=np.argmax(Y@np.stack(C).T,axis=1)
    pred=[FAMILIES[int(i)] for i in pred_idx]
    truth=[r["method_family"] for r in test]
    correct=sum(a==b for a,b in zip(truth,pred))
    return {"correct":correct,"n":len(test),"accuracy":correct/len(test),"predictions":pred,"truth":truth}

def pooled_recall(a,b):
    pairs=list(zip(a["truth"],a["predictions"]))+list(zip(b["truth"],b["predictions"]))
    out={}
    for fam in FAMILIES:
        xs=[p for t,p in pairs if t==fam]
        c=sum(p==fam for p in xs)
        out[fam]={"correct":c,"n":len(xs),"recall":c/len(xs)}
    return out

def jaccard(a,b):
    A=set(a); B=set(b)
    return len(A&B)/len(A|B) if A|B else 1.0

def main():
    u=json.loads(UNIVERSE.read_text(encoding="utf-8"))
    worlds={w["id"]:w for w in u["worlds"]}
    role_by_world={wid:{x["module_id"]:x["role"] for x in w["catalog"]} for wid,w in worlds.items()}

    files=sorted(RAW.glob("*.json"))
    if len(files)!=42: raise SystemExit(f"expected 42 raw, got {len(files)}")

    rows=[]
    all_response_ids=set()
    for p in files:
        r=json.loads(p.read_text(encoding="utf-8"))
        if r.get("calibration_only") is not True or r.get("counted") is not False: raise SystemExit("bad flags")
        if r.get("requested_model")!="gpt-5.6-sol": raise SystemExit("model mismatch")
        if r["world_id"] not in worlds or r["method_family"] not in FAMILIES: raise SystemExit("bad cell metadata")
        mids=r["path_module_ids"]; roles=r["path_roles"]
        if not MIN_STOP<=len(mids)<=MAX_OPEN: raise SystemExit(f"bad depth {r['run_id']}")
        if len(mids)!=len(set(mids)): raise SystemExit("reopened module")
        expected_roles=[role_by_world[r["world_id"]][x] for x in mids]
        if roles!=expected_roles: raise SystemExit("role mapping mismatch")
        if len(roles)!=len(set(roles)): raise SystemExit("duplicate abstract role")
        ids=r.get("all_response_ids",[])
        if len(ids)!=len(set(ids)) or len(ids)!=len(r.get("turns",[]))+1: raise SystemExit("trajectory response ID mismatch")
        for api_id in ids:
            if not api_id or api_id in all_response_ids: raise SystemExit("duplicate API response ID")
            all_response_ids.add(api_id)
        if r["stopped_early"]!=(len(mids)<MAX_OPEN): raise SystemExit("stop flag mismatch")
        rows.append(r)

    for wid in ("C1","C2"):
        c=Counter(r["method_family"] for r in rows if r["world_id"]==wid)
        if any(c[f]!=3 for f in FAMILIES): raise SystemExit(f"cell mismatch {wid}")

    c1=[r for r in rows if r["world_id"]=="C1"]
    c2=[r for r in rows if r["world_id"]=="C2"]

    a12=classify(c1,c2,full_vec)
    a21=classify(c2,c1,full_vec)
    combined_correct=a12["correct"]+a21["correct"]
    combined=combined_correct/42

    rng=np.random.default_rng(SEED)
    labels1=[r["method_family"] for r in c1]
    labels2=[r["method_family"] for r in c2]
    hits=0
    for _ in range(N_PERM):
        q12=classify(c1,c2,full_vec,list(rng.permutation(labels1)))
        q21=classify(c2,c1,full_vec,list(rng.permutation(labels2)))
        if q12["correct"]+q21["correct"]>=combined_correct: hits+=1
    pval=(hits+1)/(N_PERM+1)

    rec=pooled_recall(a12,a21)
    coverage=sum(rec[f]["recall"]>=1/3 for f in NON_GENERIC)

    s12=classify(c1,c2,set_vec); s21=classify(c2,c1,set_vec)
    set_comb=(s12["correct"]+s21["correct"])/42
    o12=classify(c1,c2,order_vec); o21=classify(c2,c1,order_vec)
    order_comb=(o12["correct"]+o21["correct"])/42

    first_roles=sorted(set(r["path_roles"][0] for r in rows))
    first_distribution={}
    role_open_rates={}
    depth_by_family={}
    for fam in FAMILIES:
        rr=[r for r in rows if r["method_family"]==fam]
        first_distribution[fam]=dict(Counter(r["path_roles"][0] for r in rr))
        role_open_rates[fam]={role:mean(role in r["path_roles"] for r in rr) for role in ("R4","R7","R8")}
        depth_by_family[fam]=mean(len(r["path_roles"]) for r in rr)

    same=[]; different=[]
    for a in c1:
        for b in c2:
            val=jaccard(a["path_roles"],b["path_roles"])
            (same if a["method_family"]==b["method_family"] else different).append(val)
    jaccard_diag={
      "same_method_cross_world_mean":mean(same),
      "different_method_cross_world_mean":mean(different),
      "same_minus_different":mean(same)-mean(different)
    }

    checks={
      "trajectories_42_complete_unique":len(rows)==42 and len(all_response_ids)>=126,
      "budget_rules_valid":True,
      "combined_accuracy_ge_0_35":combined>=0.35,
      "C1_to_C2_accuracy_ge_0_25":a12["accuracy"]>=0.25,
      "C2_to_C1_accuracy_ge_0_25":a21["accuracy"]>=0.25,
      "permutation_p_le_0_01":pval<=0.01,
      "non_generic_recall_coverage_ge_3_of_6":coverage>=3,
      "first_role_diversity_ge_4":len(first_roles)>=4,
      "set_or_order_component_signal":set_comb>=0.25 or order_comb>=0.25
    }
    gate="GO" if all(checks.values()) else "NO_GO"

    result={
      "calibration_only":True,"counted":False,"n":42,
      "C1_to_C2":{k:a12[k] for k in ("correct","n","accuracy")},
      "C2_to_C1":{k:a21[k] for k in ("correct","n","accuracy")},
      "combined_correct":combined_correct,"combined_n":42,"combined_accuracy":combined,
      "chance_accuracy":1/7,"permutation_n":N_PERM,"permutation_p_one_sided":pval,
      "pooled_recall":rec,"non_generic_recall_coverage_ge_one_third":coverage,
      "selected_set_only":{"C1_to_C2":s12["accuracy"],"C2_to_C1":s21["accuracy"],"combined":set_comb},
      "order_only":{"C1_to_C2":o12["accuracy"],"C2_to_C1":o21["accuracy"],"combined":order_comb},
      "first_roles_observed":first_roles,
      "first_role_distribution":first_distribution,
      "role_open_rates_R4_R7_R8":role_open_rates,
      "mean_depth_by_family":depth_by_family,
      "cross_world_selected_set_jaccard":jaccard_diag,
      "final_sufficiency_counts":dict(Counter(r["final"]["evidence_sufficiency"] for r in rows)),
      "gate_checks":checks,
      "study_C_counted_freeze":gate
    }
    OUT.mkdir(parents=True,exist_ok=True)
    (OUT/"STUDY_C_CALIBRATION_V01_RESULTS.json").write_text(json.dumps(result,indent=2),encoding="utf-8")

    lines=["# Study C Calibration v0.1 Results","","**NON-COUNTED INSTRUMENT CALIBRATION.**","",
           f"- Counted Study C freeze: **{gate}**",
           f"- C1 -> C2: {a12['correct']}/{a12['n']} = **{a12['accuracy']:.4f}**",
           f"- C2 -> C1: {a21['correct']}/{a21['n']} = **{a21['accuracy']:.4f}**",
           f"- combined: {combined_correct}/42 = **{combined:.4f}**",
           f"- chance: **{1/7:.4f}**",
           f"- 10,000-permutation p: **{pval:.6f}**",
           f"- non-generic recall coverage >=1/3: **{coverage}/6**",
           f"- selected-set-only combined: **{set_comb:.4f}**",
           f"- order-only combined: **{order_comb:.4f}**",
           f"- distinct first roles: **{len(first_roles)}/8** ({', '.join(first_roles)})","",
           "## Pooled recall"]
    for fam in FAMILIES: lines.append(f"- {fam}: {rec[fam]['recall']:.4f}")
    lines += ["","## Cross-world set overlap",
              f"- same-method mean Jaccard: {jaccard_diag['same_method_cross_world_mean']:.4f}",
              f"- different-method mean Jaccard: {jaccard_diag['different_method_cross_world_mean']:.4f}",
              f"- difference: {jaccard_diag['same_minus_different']:.4f}","",
              "## Reliability/null/robustness opening rates by method (R7/R4/R8)"]
    for fam in FAMILIES:
        rr=role_open_rates[fam]
        lines.append(f"- {fam}: R7={rr['R7']:.3f}, R4={rr['R4']:.3f}, R8={rr['R8']:.3f}, mean depth={depth_by_family[fam]:.2f}")
    lines += ["","Calibration outcomes are engineering evidence only, not scientific evidence for Study C."]
    (OUT/"STUDY_C_CALIBRATION_V01_RESULTS.md").write_text("\n".join(lines)+"\n",encoding="utf-8")
    print("STUDY_C_CALIBRATION_V01_ANALYSIS_COMPLETE")
    print("STUDY_C_COUNTED_FREEZE="+gate)
    print(f"C1_TO_C2={a12['accuracy']:.6f}")
    print(f"C2_TO_C1={a21['accuracy']:.6f}")
    print(f"COMBINED={combined:.6f}")
    print(f"PERM_P={pval:.6f}")
    print(f"COVERAGE={coverage}/6")
    print(f"SET_ONLY={set_comb:.6f}")
    print(f"ORDER_ONLY={order_comb:.6f}")
    print(f"FIRST_ROLE_DIVERSITY={len(first_roles)}")

if __name__=="__main__":
    main()
