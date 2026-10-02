from __future__ import annotations
import json, random
from pathlib import Path
import numpy as np
import FROZEN_STUDY_A_MEASUREMENT_V1_0 as frozen

BASE=Path(__file__).resolve().parent
RAW=BASE/"study_e_calibration_v01"/"raw"
OUT=BASE/"study_e_calibration_v01"/"analysis"
MANIFEST=BASE/"STUDY_E_CALIBRATION_V01_MANIFEST.jsonl"
UNIVERSE=BASE/"STUDY_E_EVIDENCE_UNIVERSE_V01.json"
FAMILIES=frozen.CONDITIONS
N_PERM=10000
SEED=2026100205

def normalize(v):
    a=np.asarray(v,dtype=float); n=np.linalg.norm(a)
    return a/n if n else a

def action_vec(rec,world):
    role={m["id"]:m["role"] for m in world["modules"]}
    selected=rec["executor"]["selected"]
    v=[]
    sroles=[role[x] for x in selected]
    for i in range(1,9): v.append(1.0 if f"R{i}" in sroles else 0.0)
    for pos in range(4):
        for i in range(1,9): v.append(1.0 if sroles[pos]==f"R{i}" else 0.0)
    return normalize(v),sroles

def centroid_predict(train,test,label_override=None):
    labels=label_override if label_override is not None else [r["method_family"] for r in train]
    cs={}
    for fam in FAMILIES:
        xs=[r["action_vec"] for r,l in zip(train,labels) if l==fam]
        cs[fam]=normalize(np.mean(xs,axis=0))
    pred=[]
    for r in test:
        scores={f:float(np.dot(r["action_vec"],cs[f])) for f in FAMILIES}
        pred.append(max(FAMILIES,key=lambda f:(scores[f],-FAMILIES.index(f))))
    truth=[r["method_family"] for r in test]
    return sum(a==b for a,b in zip(truth,pred))/len(truth),pred,truth

def recalls(p1,t1,p2,t2):
    pairs=list(zip(t1,p1))+list(zip(t2,p2)); out={}
    for fam in FAMILIES:
        xs=[p for t,p in pairs if t==fam]
        out[fam]=sum(p==fam for p in xs)/len(xs)
    return out

def plan_signal(rows):
    p1=sorted([{"id":r["group_id"],"task_id":"E1","condition":r["method_family"],"text":r["sanitized_plan"]} for r in rows if r["world_id"]=="E1"],key=lambda x:x["id"])
    p2=sorted([{"id":r["group_id"],"task_id":"E2","condition":r["method_family"],"text":r["sanitized_plan"]} for r in rows if r["world_id"]=="E2"],key=lambda x:x["id"])
    tt1,xt12,l1=frozen.prepare_direction(p1,p2)
    tt2,xt21,l2=frozen.prepare_direction(p2,p1)
    truth2=np.array([FAMILIES.index(r["condition"]) for r in p2],dtype=np.int16)
    truth1=np.array([FAMILIES.index(r["condition"]) for r in p1],dtype=np.int16)
    pred12,_=frozen.predict(tt1,xt12,l1); pred21,_=frozen.predict(tt2,xt21,l2)
    a12=float(np.mean(pred12==truth2)); a21=float(np.mean(pred21==truth1)); obs=a12+a21
    rng=np.random.default_rng(SEED); hits=0
    for _ in range(N_PERM):
        q1=rng.permutation(l1); q2=rng.permutation(l2)
        z12,_=frozen.predict(tt1,xt12,q1); z21,_=frozen.predict(tt2,xt21,q2)
        if float(np.mean(z12==truth2))+float(np.mean(z21==truth1)) >= obs: hits+=1
    pr1=[FAMILIES[int(x)] for x in pred12]; tr1=[r["condition"] for r in p2]
    pr2=[FAMILIES[int(x)] for x in pred21]; tr2=[r["condition"] for r in p1]
    return {"E1_to_E2":a12,"E2_to_E1":a21,"combined":obs/2,"p":(hits+1)/(N_PERM+1),"recall":recalls(pr1,tr1,pr2,tr2)}

def action_signal(rows):
    e1=sorted([r for r in rows if r["world_id"]=="E1"],key=lambda x:x["group_id"])
    e2=sorted([r for r in rows if r["world_id"]=="E2"],key=lambda x:x["group_id"])
    a12,p12,t12=centroid_predict(e1,e2); a21,p21,t21=centroid_predict(e2,e1); obs=(a12+a21)/2
    l1=[r["method_family"] for r in e1]; l2=[r["method_family"] for r in e2]
    rng=random.Random(SEED); hits=0
    for _ in range(N_PERM):
        q1=l1[:]; q2=l2[:]; rng.shuffle(q1); rng.shuffle(q2)
        z12,_,_=centroid_predict(e1,e2,q1); z21,_,_=centroid_predict(e2,e1,q2)
        if (z12+z21)/2 >= obs: hits+=1
    return {"E1_to_E2":a12,"E2_to_E1":a21,"combined":obs,"p":(hits+1)/(N_PERM+1),"recall":recalls(p12,t12,p21,t21)}

def main():
    manifest=[json.loads(x) for x in MANIFEST.read_text(encoding="utf-8").splitlines() if x.strip()]
    expected={x["group_id"]:x for x in manifest}
    files=sorted(RAW.glob("*.json"))
    if len(files)!=42 or {p.stem for p in files}!=set(expected): raise SystemExit("raw mismatch")
    worlds={w["id"]:w for w in json.loads(UNIVERSE.read_text(encoding="utf-8"))["worlds"]}
    api=set(); rows=[]
    for p in files:
        r=json.loads(p.read_text(encoding="utf-8")); m=expected[r["group_id"]]
        for k in ("world_id","method_family","condition_id","replicate"):
            if r.get(k)!=m.get(k): raise SystemExit("manifest mismatch")
        ids=[r["planner"]["response_id"],r["executor"]["response_id"]]
        if any((not x) or x in api for x in ids): raise SystemExit("duplicate api id")
        api.update(ids)
        if r["planner"]["status"]!="completed" or r["executor"]["status"]!="completed": raise SystemExit("incomplete")
        if r["planner"]["returned_model"]!="gpt-5.6-sol" or r["executor"]["returned_model"]!="gpt-6-luna": raise SystemExit("model mismatch")
        valid={m["id"] for m in worlds[r["world_id"]]["modules"]}
        sel=r["executor"]["selected"]
        if len(sel)!=4 or len(set(sel))!=4 or any(x not in valid for x in sel): raise SystemExit("bad path")
        vec,sroles=action_vec(r,worlds[r["world_id"]]); r["action_vec"]=vec; r["selected_roles"]=sroles; rows.append(r)

    ps=plan_signal(rows); ac=action_signal(rows)
    plan_cov=sum(ps["recall"][f]>=1/3 for f in FAMILIES if f!="GENERIC")
    act_cov=sum(ac["recall"][f]>=1/3 for f in FAMILIES if f!="GENERIC")
    first_all={r["selected_roles"][0] for r in rows}
    first_world={w:{r["selected_roles"][0] for r in rows if r["world_id"]==w} for w in ("E1","E2")}
    checks={
      "integrity_42_groups_84_ids":len(api)==84,
      "plan_combined_ge_0_35":ps["combined"]>=0.35,
      "plan_both_directions_ge_0_25":ps["E1_to_E2"]>=0.25 and ps["E2_to_E1"]>=0.25,
      "plan_p_le_0_01":ps["p"]<=0.01,
      "plan_non_generic_coverage_ge_3":plan_cov>=3,
      "action_combined_ge_0_35":ac["combined"]>=0.35,
      "action_both_directions_ge_0_25":ac["E1_to_E2"]>=0.25 and ac["E2_to_E1"]>=0.25,
      "action_p_le_0_01":ac["p"]<=0.01,
      "action_non_generic_coverage_ge_3":act_cov>=3,
      "first_role_diversity_all_ge_4":len(first_all)>=4,
      "first_role_diversity_each_world_ge_3":all(len(first_world[w])>=3 for w in ("E1","E2"))
    }
    gate="GO" if all(checks.values()) else "NO_GO"
    result={"calibration_only":True,"groups":42,"api_outputs":84,"sanitized_plan_signal":ps,"action_signal":ac,
            "plan_non_generic_coverage":plan_cov,"action_non_generic_coverage":act_cov,
            "distinct_first_roles":sorted(first_all),"distinct_first_roles_by_world":{k:sorted(v) for k,v in first_world.items()},
            "gate_checks":checks,"counted_study_E_freeze":gate}
    OUT.mkdir(parents=True,exist_ok=True)
    (OUT/"STUDY_E_CALIBRATION_V01_RESULTS.json").write_text(json.dumps(result,indent=2),encoding="utf-8")
    lines=["# Study E Calibration v0.1 Results","","**NON-COUNTED INSTRUMENT CALIBRATION.**","",
           f"- Counted Study E freeze: **{gate}**","",
           "## Sanitized plan signal",
           f"- E1 -> E2: **{ps['E1_to_E2']:.4f}**",
           f"- E2 -> E1: **{ps['E2_to_E1']:.4f}**",
           f"- combined: **{ps['combined']:.4f}**",
           f"- p: **{ps['p']:.6f}**",
           f"- non-generic recall coverage: **{plan_cov}/6**","",
           "## Downstream action signal",
           f"- E1 -> E2: **{ac['E1_to_E2']:.4f}**",
           f"- E2 -> E1: **{ac['E2_to_E1']:.4f}**",
           f"- combined: **{ac['combined']:.4f}**",
           f"- p: **{ac['p']:.6f}**",
           f"- non-generic recall coverage: **{act_cov}/6**",
           f"- distinct first roles: **{len(first_all)}/8**","",
           "## Gate checks"]+[f"- {k}: {v}" for k,v in checks.items()]
    lines += ["","Calibration outcomes are engineering evidence only, not counted scientific evidence."]
    (OUT/"STUDY_E_CALIBRATION_V01_RESULTS.md").write_text("\n".join(lines)+"\n",encoding="utf-8")
    print("STUDY_E_CALIBRATION_ANALYSIS_COMPLETE")
    print("COUNTED_STUDY_E_FREEZE="+gate)
    print("PLAN_COMBINED="+str(ps["combined"]))
    print("ACTION_COMBINED="+str(ac["combined"]))

if __name__=="__main__":
    main()
