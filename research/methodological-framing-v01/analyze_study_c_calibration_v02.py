from __future__ import annotations
import json
from collections import Counter
from pathlib import Path
from statistics import mean
import numpy as np

BASE=Path(__file__).resolve().parent
UNIVERSE=BASE/"STUDY_C_EVIDENCE_UNIVERSE_V02.json"
MANIFEST=BASE/"FROZEN_STUDY_C_CALIBRATION_V02_MANIFEST.jsonl"
RAW=BASE/"study_c_calibration_v02"/"raw"
OUT=BASE/"study_c_calibration_v02"/"analysis"
FAMILIES=["GENERIC","DIFFERENTIAL","BAYESIAN","FALSIFICATION","CAUSAL","STATE_SPACE","SOFTWARE_TESTING"]
NON_GENERIC=[x for x in FAMILIES if x!="GENERIC"]
ROLES=[f"R{i}" for i in range(1,9)]
N_PERM=10000
SEED=2026100208

def norm(x):
    a=np.asarray(x,dtype=float); n=np.linalg.norm(a)
    return a/n if n else a

def full_vec(path):
    first=[1.0 if path[0]==r else 0.0 for r in ROLES]
    second=[1.0 if path[1]==r else 0.0 for r in ROLES]
    s=set(path); setv=[1.0 if r in s else 0.0 for r in ROLES]
    return norm(first+second+setv)

def first_vec(path): return norm([1.0 if path[0]==r else 0.0 for r in ROLES])
def set_vec(path):
    s=set(path); return norm([1.0 if r in s else 0.0 for r in ROLES])

def classify(train,test,vec_fn,override_labels=None):
    labels=override_labels if override_labels is not None else [r["method_family"] for r in train]
    X=np.stack([vec_fn(r["path_roles"]) for r in train]); Y=np.stack([vec_fn(r["path_roles"]) for r in test])
    cents=[]
    for fam in FAMILIES:
        ids=[i for i,l in enumerate(labels) if l==fam]
        if len(ids)!=3: raise RuntimeError(f"bad cell {fam}={len(ids)}")
        cents.append(norm(X[ids].mean(axis=0)))
    pred_idx=np.argmax(Y@np.stack(cents).T,axis=1)
    pred=[FAMILIES[int(i)] for i in pred_idx]; truth=[r["method_family"] for r in test]
    c=sum(a==b for a,b in zip(truth,pred))
    return {"correct":c,"n":len(test),"accuracy":c/len(test),"predictions":pred,"truth":truth}

def pooled_recall(a,b):
    pairs=list(zip(a["truth"],a["predictions"]))+list(zip(b["truth"],b["predictions"]))
    out={}
    for fam in FAMILIES:
        xs=[p for t,p in pairs if t==fam]; c=sum(p==fam for p in xs)
        out[fam]={"correct":c,"n":len(xs),"recall":c/len(xs)}
    return out

def jaccard(a,b):
    A=set(a);B=set(b); return len(A&B)/len(A|B)

def main():
    u=json.loads(UNIVERSE.read_text(encoding="utf-8")); worlds={w["id"]:w for w in u["worlds"]}
    rolemap={wid:{x["module_id"]:x["role"] for x in w["catalog"]} for wid,w in worlds.items()}
    manifest={x["run_id"]:x for x in [json.loads(s) for s in MANIFEST.read_text(encoding="utf-8").splitlines() if s.strip()]}
    files=sorted(RAW.glob("*.json"))
    if len(files)!=42: raise SystemExit(f"expected 42 got {len(files)}")
    rows=[]; api_ids=set()
    for p in files:
        r=json.loads(p.read_text(encoding="utf-8"))
        if r["run_id"] not in manifest: raise SystemExit("run not manifest")
        mr=manifest[r["run_id"]]
        for k in ("world_id","method_family","replicate","catalog_order"):
            if r.get(k)!=mr.get(k): raise SystemExit(f"manifest mismatch {r['run_id']} {k}")
        if r.get("calibration_only") is not True or r.get("counted") is not False: raise SystemExit("bad flags")
        if r.get("requested_model")!="gpt-5.6-sol" or r.get("returned_models")!=["gpt-5.6-sol"]: raise SystemExit("model mismatch")
        mids=r["path_module_ids"]; roles=r["path_roles"]
        if len(mids)!=2 or len(set(mids))!=2: raise SystemExit("bad path")
        if roles!=[rolemap[r["world_id"]][x] for x in mids] or len(set(roles))!=2: raise SystemExit("role mismatch")
        ids=r.get("all_response_ids",[])
        if len(ids)!=2 or len(set(ids))!=2: raise SystemExit("response ids")
        for rid in ids:
            if not rid or rid in api_ids: raise SystemExit("duplicate api id")
            api_ids.add(rid)
        rows.append(r)

    for wid in ("C3","C4"):
        c=Counter(r["method_family"] for r in rows if r["world_id"]==wid)
        if any(c[f]!=3 for f in FAMILIES): raise SystemExit(f"cell mismatch {wid}")
    c3=[r for r in rows if r["world_id"]=="C3"]; c4=[r for r in rows if r["world_id"]=="C4"]

    a34=classify(c3,c4,full_vec); a43=classify(c4,c3,full_vec)
    obs=a34["correct"]+a43["correct"]; combined=obs/42
    rng=np.random.default_rng(SEED); l3=[r["method_family"] for r in c3]; l4=[r["method_family"] for r in c4]; hits=0
    for _ in range(N_PERM):
        q34=classify(c3,c4,full_vec,list(rng.permutation(l3)))
        q43=classify(c4,c3,full_vec,list(rng.permutation(l4)))
        if q34["correct"]+q43["correct"]>=obs: hits+=1
    p=(hits+1)/(N_PERM+1)

    rec=pooled_recall(a34,a43); coverage=sum(rec[f]["recall"]>=1/3 for f in NON_GENERIC)
    f34=classify(c3,c4,first_vec); f43=classify(c4,c3,first_vec); first_comb=(f34["correct"]+f43["correct"])/42
    s34=classify(c3,c4,set_vec); s43=classify(c4,c3,set_vec); set_comb=(s34["correct"]+s43["correct"])/42
    first_roles=sorted(set(r["path_roles"][0] for r in rows))

    same=[];diff=[]
    for a in c3:
        for b in c4:
            (same if a["method_family"]==b["method_family"] else diff).append(jaccard(a["path_roles"],b["path_roles"]))
    openrates={}
    for fam in FAMILIES:
        rr=[r for r in rows if r["method_family"]==fam]
        openrates[fam]={role:mean(role in r["path_roles"] for r in rr) for role in ("R4","R5","R7","R8")}

    checks={
      "trajectories_42_valid":len(rows)==42 and len(api_ids)==84,
      "exactly_two_distinct":all(len(r["path_roles"])==2 and len(set(r["path_roles"]))==2 for r in rows),
      "combined_accuracy_ge_0_30":combined>=0.30,
      "C3_to_C4_ge_0_24":a34["accuracy"]>=0.24,
      "C4_to_C3_ge_0_24":a43["accuracy"]>=0.24,
      "permutation_p_le_0_01":p<=0.01,
      "coverage_ge_3_of_6":coverage>=3,
      "first_role_diversity_ge_4":len(first_roles)>=4,
      "first_or_set_signal":first_comb>=0.24 or set_comb>=0.24
    }
    gate="GO" if all(checks.values()) else "NO_GO"
    result={
      "calibration_only":True,"n":42,
      "C3_to_C4":{k:a34[k] for k in ("correct","n","accuracy")},
      "C4_to_C3":{k:a43[k] for k in ("correct","n","accuracy")},
      "combined_correct":obs,"combined_n":42,"combined_accuracy":combined,"chance_accuracy":1/7,
      "permutation_n":N_PERM,"permutation_p_one_sided":p,
      "pooled_recall":rec,"coverage":coverage,
      "first_role_only_combined":first_comb,"selected_set_only_combined":set_comb,
      "first_roles_observed":first_roles,
      "cross_world_jaccard":{"same_method_mean":mean(same),"different_method_mean":mean(diff),"same_minus_different":mean(same)-mean(diff)},
      "role_open_rates_R4_R5_R7_R8":openrates,
      "gate_checks":checks,"study_C_counted_freeze":gate
    }
    OUT.mkdir(parents=True,exist_ok=True)
    (OUT/"STUDY_C_CALIBRATION_V02_RESULTS.json").write_text(json.dumps(result,indent=2),encoding="utf-8")
    lines=["# Study C Calibration v0.2 Results","",f"- Counted Study C freeze: **{gate}**",f"- C3 -> C4: {a34['correct']}/21 = **{a34['accuracy']:.4f}**",f"- C4 -> C3: {a43['correct']}/21 = **{a43['accuracy']:.4f}**",f"- combined: {obs}/42 = **{combined:.4f}**",f"- chance: **{1/7:.4f}**",f"- permutation p: **{p:.6f}**",f"- recall coverage: **{coverage}/6**",f"- first-role-only combined: **{first_comb:.4f}**",f"- selected-set-only combined: **{set_comb:.4f}**",f"- distinct first roles: **{len(first_roles)}/8** ({', '.join(first_roles)})","", "Calibration only; not a scientific Study C result."]
    (OUT/"STUDY_C_CALIBRATION_V02_RESULTS.md").write_text("\n".join(lines)+"\n",encoding="utf-8")
    print("STUDY_C_CALIBRATION_V02_ANALYSIS_COMPLETE")
    print("STUDY_C_COUNTED_FREEZE="+gate)
    print(f"C3_TO_C4={a34['accuracy']:.6f}")
    print(f"C4_TO_C3={a43['accuracy']:.6f}")
    print(f"COMBINED={combined:.6f}")
    print(f"PERM_P={p:.6f}")
    print(f"COVERAGE={coverage}/6")
    print(f"FIRST_ONLY={first_comb:.6f}")
    print(f"SET_ONLY={set_comb:.6f}")
    print(f"FIRST_ROLE_DIVERSITY={len(first_roles)}")

if __name__=="__main__": main()