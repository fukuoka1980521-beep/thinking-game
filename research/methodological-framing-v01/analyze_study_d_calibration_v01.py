from __future__ import annotations
import json, math, random
from collections import Counter
from pathlib import Path
import numpy as np

BASE=Path(__file__).resolve().parent
ROOT=BASE/"study_d_calibration_v01"
RAW=ROOT/"raw"
OUT=ROOT/"analysis"
MANIFEST=BASE/"STUDY_D_CALIBRATION_V01_MANIFEST.jsonl"
UNIVERSE=BASE/"STUDY_D_EVIDENCE_UNIVERSE_V01.json"
FAMILIES=["GENERIC","DIFFERENTIAL","BAYESIAN","FALSIFICATION","CAUSAL","STATE_SPACE","SOFTWARE_TESTING"]
STAGES=["E0","E4","E8"]
N_PERM=10000
SEED=2026100204

def normalize(v):
    a=np.asarray(v,dtype=float)
    n=np.linalg.norm(a)
    return a/n if n else a

def vector(rec, world):
    role_by_id={m["id"]:m["role"] for m in world["modules"]}
    weights={role_by_id[x["module_id"]]:x["weight"]/100 for x in rec["state"]["weights"]}
    v=[weights[f"R{i}"] for i in range(1,9)]
    for pos in range(3):
        rid=role_by_id[rec["state"]["top3"][pos]]
        for i in range(1,9):
            v.append(1.0 if rid==f"R{i}" else 0.0)
    v.append(rec["state"]["target_support_percent"]/100)
    v.append(rec["state"]["confidence_percent"]/100)
    return normalize(v)

def classify(train_rows,test_rows):
    centroids={}
    for fam in FAMILIES:
        xs=[r["vec"] for r in train_rows if r["method_family"]==fam]
        c=normalize(np.mean(xs,axis=0))
        centroids[fam]=c
    pred=[]
    for r in test_rows:
        scores={fam:float(np.dot(r["vec"],centroids[fam])) for fam in FAMILIES}
        p=max(FAMILIES,key=lambda f:(scores[f],-FAMILIES.index(f)))
        pred.append(p)
    truth=[r["method_family"] for r in test_rows]
    correct=sum(a==b for a,b in zip(truth,pred))
    return correct/len(truth),pred,truth

def classify_with_labels(train_rows,test_rows,labels):
    centroids={}
    for fam in FAMILIES:
        xs=[r["vec"] for r,l in zip(train_rows,labels) if l==fam]
        c=normalize(np.mean(xs,axis=0))
        centroids[fam]=c
    pred=[]
    for r in test_rows:
        scores={fam:float(np.dot(r["vec"],centroids[fam])) for fam in FAMILIES}
        pred.append(max(FAMILIES,key=lambda f:(scores[f],-FAMILIES.index(f))))
    truth=[r["method_family"] for r in test_rows]
    return sum(a==b for a,b in zip(truth,pred))/len(truth)

def pooled_recall(pred1,truth1,pred2,truth2):
    out={}
    pairs=list(zip(truth1,pred1))+list(zip(truth2,pred2))
    for fam in FAMILIES:
        xs=[p for t,p in pairs if t==fam]
        out[fam]=sum(p==fam for p in xs)/len(xs)
    return out

def mean_pairwise_distance(rows):
    vals=[]
    for i in range(len(rows)):
        for j in range(i+1,len(rows)):
            vals.append(1-float(np.dot(rows[i]["vec"],rows[j]["vec"])))
    return float(np.mean(vals)) if vals else 0.0

def main():
    manifest=[json.loads(x) for x in MANIFEST.read_text(encoding="utf-8").splitlines() if x.strip()]
    expected={x["run_id"]:x for x in manifest}
    files=sorted(RAW.glob("*.json"))
    if len(files)!=126 or {p.stem for p in files}!=set(expected):
        raise SystemExit(f"raw mismatch {len(files)}/126")
    universe=json.loads(UNIVERSE.read_text(encoding="utf-8"))
    worlds={x["id"]:x for x in universe["worlds"]}
    api_ids=set()
    rows=[]
    for p in files:
        r=json.loads(p.read_text(encoding="utf-8"))
        m=expected[r["run_id"]]
        for k in ("group_id","world_id","method_family","condition_id","replicate","stage","acting_model"):
            if r.get(k)!=m.get(k): raise SystemExit(f"manifest mismatch {r['run_id']} {k}")
        if r.get("calibration_only") is not True: raise SystemExit("not calibration")
        if r.get("response_status")!="completed" or r.get("incomplete_details") is not None: raise SystemExit("incomplete")
        rid=r.get("response_id")
        if not rid or rid in api_ids: raise SystemExit("duplicate response id")
        api_ids.add(rid)
        world=worlds[r["world_id"]]
        valid={x["id"] for x in world["modules"]}
        ws=r["state"]["weights"]
        ids=[x["module_id"] for x in ws]
        if len(ids)!=8 or len(set(ids))!=8 or set(ids)!=valid: raise SystemExit("weight IDs invalid")
        if sum(int(x["weight"]) for x in ws)!=100: raise SystemExit("weights sum invalid")
        top=r["state"]["top3"]
        if len(top)!=3 or len(set(top))!=3 or any(x not in valid for x in top): raise SystemExit("top3 invalid")
        rows.append({**r,"vec":vector(r,world)})

    results={}
    rng=random.Random(SEED)
    for stage in STAGES:
        d1=sorted([r for r in rows if r["stage"]==stage and r["world_id"]=="D1"],key=lambda x:x["run_id"])
        d2=sorted([r for r in rows if r["stage"]==stage and r["world_id"]=="D2"],key=lambda x:x["run_id"])
        a12,p12,t12=classify(d1,d2)
        a21,p21,t21=classify(d2,d1)
        obs=(a12+a21)/2
        l1=[r["method_family"] for r in d1]; l2=[r["method_family"] for r in d2]
        hits=0
        for _ in range(N_PERM):
            q1=l1[:]; q2=l2[:]
            rng.shuffle(q1); rng.shuffle(q2)
            x12=classify_with_labels(d1,d2,q1)
            x21=classify_with_labels(d2,d1,q2)
            if (x12+x21)/2 >= obs: hits+=1
        pval=(hits+1)/(N_PERM+1)
        recall=pooled_recall(p12,t12,p21,t21)
        top_roles=[]
        support_by_world={}
        pairdist={}
        for wid in ("D1","D2"):
            wr=[r for r in rows if r["stage"]==stage and r["world_id"]==wid]
            role_by_id={m["id"]:m["role"] for m in worlds[wid]["modules"]}
            top_roles += [role_by_id[r["state"]["top3"][0]] for r in wr]
            support_by_world[wid]=sorted(set(r["state"]["target_support_percent"] for r in wr))
            pairdist[wid]=mean_pairwise_distance(wr)
        results[stage]={
          "D1_to_D2_accuracy":a12,
          "D2_to_D1_accuracy":a21,
          "combined_accuracy":obs,
          "permutation_p":pval,
          "pooled_recall":recall,
          "non_generic_recall_ge_one_third":sum(recall[f]>=1/3 for f in FAMILIES if f!="GENERIC"),
          "distinct_top1_roles":sorted(set(top_roles)),
          "support_values_by_world":support_by_world,
          "mean_pairwise_distance_by_world":pairdist
        }

    e0=results["E0"]
    checks={
      "integrity_126":True,
      "E0_combined_accuracy_ge_0_35":e0["combined_accuracy"]>=0.35,
      "E0_D1_to_D2_ge_0_25":e0["D1_to_D2_accuracy"]>=0.25,
      "E0_D2_to_D1_ge_0_25":e0["D2_to_D1_accuracy"]>=0.25,
      "E0_p_le_0_01":e0["permutation_p"]<=0.01,
      "E0_non_generic_recall_coverage_ge_3":e0["non_generic_recall_ge_one_third"]>=3,
      "top1_role_diversity_all_stages":all(len(results[s]["distinct_top1_roles"])>=4 for s in STAGES),
      "support_diversity_all_world_stages":all(len(results[s]["support_values_by_world"][w])>=3 for s in STAGES for w in ("D1","D2")),
      "E4_E8_pairwise_distance_gt_0_02":all(results[s]["mean_pairwise_distance_by_world"][w]>0.02 for s in ("E4","E8") for w in ("D1","D2"))
    }
    gate="GO" if all(checks.values()) else "NO_GO"
    out={"calibration_only":True,"n_outputs":126,"n_groups":42,"stages":results,"gate_checks":checks,"counted_study_D_freeze":gate}
    OUT.mkdir(parents=True,exist_ok=True)
    (OUT/"STUDY_D_CALIBRATION_V01_RESULTS.json").write_text(json.dumps(out,indent=2),encoding="utf-8")
    lines=["# Study D Calibration v0.1 Results","","**NON-COUNTED INSTRUMENT CALIBRATION.**","",
           f"- Counted Study D freeze: **{gate}**",""]
    for s in STAGES:
        z=results[s]
        lines += [f"## {s}",
                  f"- D1 -> D2 accuracy: **{z['D1_to_D2_accuracy']:.4f}**",
                  f"- D2 -> D1 accuracy: **{z['D2_to_D1_accuracy']:.4f}**",
                  f"- combined accuracy: **{z['combined_accuracy']:.4f}**",
                  f"- permutation p: **{z['permutation_p']:.6f}**",
                  f"- non-generic recall coverage >=1/3: **{z['non_generic_recall_ge_one_third']}/6**",
                  f"- distinct top1 roles: **{len(z['distinct_top1_roles'])}/8**",""]
    lines += ["## Gate checks"]+[f"- {k}: {v}" for k,v in checks.items()]
    lines += ["","Calibration outcomes are engineering evidence only, not counted scientific evidence."]
    (OUT/"STUDY_D_CALIBRATION_V01_RESULTS.md").write_text("\n".join(lines)+"\n",encoding="utf-8")
    print("STUDY_D_CALIBRATION_ANALYSIS_COMPLETE")
    print("COUNTED_STUDY_D_FREEZE="+gate)
    print("E0_COMBINED="+str(e0["combined_accuracy"]))
    print("E4_COMBINED="+str(results["E4"]["combined_accuracy"]))
    print("E8_COMBINED="+str(results["E8"]["combined_accuracy"]))

if __name__=="__main__":
    main()
