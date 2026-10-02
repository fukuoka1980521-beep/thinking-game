from __future__ import annotations
import json
from collections import Counter
from pathlib import Path
import numpy as np

BASE=Path(__file__).resolve().parent
RAW=BASE/"study_b_calibration_v02"/"raw"
OUT=BASE/"study_b_calibration_v02"/"analysis"
FAMILIES=["GENERIC","DIFFERENTIAL","BAYESIAN","FALSIFICATION","CAUSAL","STATE_SPACE","SOFTWARE_TESTING"]
NON_GENERIC=[x for x in FAMILIES if x!="GENERIC"]
CONCLUSIONS=["SUPPORTS_MOST","DOES_NOT_SUPPORT_MOST","INCONCLUSIVE"]
ACTIONS=["ACCEPT_TARGET_FOR_NOW","REJECT_TARGET_FOR_NOW","COLLECT_MORE_EVIDENCE"]
EIDS=[f"E{i}" for i in range(1,9)]
SEED=2026100205
N_PERM=10000

def normalize(a):
    a=np.asarray(a,dtype=float)
    n=np.linalg.norm(a)
    return a/n if n else a

def full_vec(s):
    ds=set(s["decisive_evidence_ids"])
    return normalize([
      *[1.0 if s["conclusion"]==x else 0.0 for x in CONCLUSIONS],
      *[1.0 if s["next_action"]==x else 0.0 for x in ACTIONS],
      s["attribution_percent"]/100.0,
      s["attribution_interval_low"]/100.0,
      s["attribution_interval_high"]/100.0,
      s["confidence"]/100.0,
      *[s["evidence_impacts"][e]/2.0 for e in EIDS],
      *[1.0 if e in ds else 0.0 for e in EIDS],
    ])

def impact_vec(s):
    return normalize([s["evidence_impacts"][e]/2.0 for e in EIDS])

def attr_decision_vec(s):
    return normalize([
      *[1.0 if s["conclusion"]==x else 0.0 for x in CONCLUSIONS],
      *[1.0 if s["next_action"]==x else 0.0 for x in ACTIONS],
      s["attribution_percent"]/100.0,
      s["attribution_interval_low"]/100.0,
      s["attribution_interval_high"]/100.0,
      s["confidence"]/100.0,
    ])

def classify(train,test,vec_fn,override_labels=None):
    labels=override_labels if override_labels is not None else [r["method_family"] for r in train]
    X=np.stack([vec_fn(r["state"]) for r in train])
    Y=np.stack([vec_fn(r["state"]) for r in test])
    centroids=[]
    for fam in FAMILIES:
        ids=[i for i,l in enumerate(labels) if l==fam]
        if len(ids)!=3: raise RuntimeError(f"bad training cell {fam}: {len(ids)}")
        c=X[ids].mean(axis=0)
        centroids.append(normalize(c))
    pred_idx=np.argmax(Y@np.stack(centroids).T,axis=1)
    pred=[FAMILIES[int(i)] for i in pred_idx]
    truth=[r["method_family"] for r in test]
    correct=sum(a==b for a,b in zip(truth,pred))
    return {"correct":correct,"n":len(test),"accuracy":correct/len(test),"predictions":pred,"truth":truth}

def pooled_recall(a,b):
    pairs=list(zip(a["truth"],a["predictions"]))+list(zip(b["truth"],b["predictions"]))
    out={}
    for fam in FAMILIES:
        xs=[p for t,p in pairs if t==fam]
        cor=sum(p==fam for p in xs)
        out[fam]={"correct":cor,"n":len(xs),"recall":cor/len(xs)}
    return out

def validate_state(s):
    if s["conclusion"] not in CONCLUSIONS: raise SystemExit("bad conclusion")
    for k in ("attribution_percent","attribution_interval_low","attribution_interval_high","confidence"):
        if type(s[k]) is not int or not 0<=s[k]<=100: raise SystemExit("bad scalar "+k)
    if not s["attribution_interval_low"] <= s["attribution_percent"] <= s["attribution_interval_high"]:
        raise SystemExit("interval ordering violation")
    if set(s["evidence_impacts"])!=set(EIDS): raise SystemExit("impact keys mismatch")
    if any(type(v) is not int or v not in (-2,-1,0,1,2) for v in s["evidence_impacts"].values()):
        raise SystemExit("bad impact")
    xs=s["decisive_evidence_ids"]
    if not isinstance(xs,list) or not 1<=len(xs)<=3 or len(xs)!=len(set(xs)) or any(x not in EIDS for x in xs):
        raise SystemExit("bad decisive IDs")
    if s["next_action"] not in ACTIONS: raise SystemExit("bad action")

def main():
    files=sorted(RAW.glob("*.json"))
    if len(files)!=42: raise SystemExit(f"expected 42 raw, got {len(files)}")
    rows=[]; response_ids=set()
    for p in files:
        r=json.loads(p.read_text(encoding="utf-8"))
        if r.get("calibration_only") is not True or r.get("counted") is not False: raise SystemExit("bad flags")
        if r.get("response_status")!="completed" or r.get("incomplete_details") is not None: raise SystemExit("incomplete")
        if r.get("requested_model")!="gpt-5.6-sol" or r.get("returned_model")!="gpt-5.6-sol": raise SystemExit("model mismatch")
        rid=r.get("response_id")
        if not rid or rid in response_ids: raise SystemExit("duplicate response id")
        response_ids.add(rid)
        validate_state(r["state"])
        rows.append(r)

    b3=[r for r in rows if r["packet_id"]=="B3"]
    b4=[r for r in rows if r["packet_id"]=="B4"]
    if len(b3)!=21 or len(b4)!=21: raise SystemExit("packet denominator mismatch")
    for rs in (b3,b4):
        c=Counter(r["method_family"] for r in rs)
        if any(c[f]!=3 for f in FAMILIES): raise SystemExit("cell mismatch")

    a34=classify(b3,b4,full_vec)
    a43=classify(b4,b3,full_vec)
    combined_correct=a34["correct"]+a43["correct"]
    combined=combined_correct/42

    rng=np.random.default_rng(SEED)
    labels3=[r["method_family"] for r in b3]
    labels4=[r["method_family"] for r in b4]
    hits=0
    for _ in range(N_PERM):
        q34=classify(b3,b4,full_vec,list(rng.permutation(labels3)))
        q43=classify(b4,b3,full_vec,list(rng.permutation(labels4)))
        if q34["correct"]+q43["correct"] >= combined_correct: hits+=1
    pval=(hits+1)/(N_PERM+1)

    rec=pooled_recall(a34,a43)
    coverage=sum(rec[f]["recall"]>=1/3 for f in NON_GENERIC)

    i34=classify(b3,b4,impact_vec); i43=classify(b4,b3,impact_vec)
    impact_comb=(i34["correct"]+i43["correct"])/42
    d34=classify(b3,b4,attr_decision_vec); d43=classify(b4,b3,attr_decision_vec)
    decision_comb=(d34["correct"]+d43["correct"])/42

    vals3=sorted(set(r["state"]["attribution_percent"] for r in b3))
    vals4=sorted(set(r["state"]["attribution_percent"] for r in b4))

    checks={
      "raw_42_complete_unique_schema_valid":len(response_ids)==42,
      "combined_accuracy_ge_0_35":combined>=0.35,
      "B3_to_B4_accuracy_ge_0_25":a34["accuracy"]>=0.25,
      "B4_to_B3_accuracy_ge_0_25":a43["accuracy"]>=0.25,
      "permutation_p_le_0_01":pval<=0.01,
      "non_generic_recall_coverage_ge_3_of_6":coverage>=3,
      "component_signal":impact_comb>=0.25 or decision_comb>=0.25,
      "attribution_diversity_each_packet":len(vals3)>=2 and len(vals4)>=2
    }
    gate="GO" if all(checks.values()) else "NO_GO"

    result={
      "calibration_only":True,"counted":False,"n":42,
      "B3_to_B4":{k:a34[k] for k in ("correct","n","accuracy")},
      "B4_to_B3":{k:a43[k] for k in ("correct","n","accuracy")},
      "combined_correct":combined_correct,"combined_n":42,"combined_accuracy":combined,
      "chance_accuracy":1/7,"permutation_n":N_PERM,"permutation_p_one_sided":pval,
      "pooled_recall":rec,"non_generic_recall_coverage_ge_one_third":coverage,
      "impact_only":{"B3_to_B4":i34["accuracy"],"B4_to_B3":i43["accuracy"],"combined":impact_comb},
      "attribution_decision_only":{"B3_to_B4":d34["accuracy"],"B4_to_B3":d43["accuracy"],"combined":decision_comb},
      "attribution_values":{"B3":vals3,"B4":vals4},
      "conclusion_counts":{"B3":dict(Counter(r["state"]["conclusion"] for r in b3)),"B4":dict(Counter(r["state"]["conclusion"] for r in b4))},
      "action_counts":{"B3":dict(Counter(r["state"]["next_action"] for r in b3)),"B4":dict(Counter(r["state"]["next_action"] for r in b4))},
      "gate_checks":checks,"study_B_counted_freeze":gate
    }
    OUT.mkdir(parents=True,exist_ok=True)
    (OUT/"STUDY_B_CALIBRATION_V02_RESULTS.json").write_text(json.dumps(result,indent=2),encoding="utf-8")
    lines=["# Study B Calibration v0.2 Results","","**NON-COUNTED INSTRUMENT CALIBRATION.**","",
           f"- Counted Study B freeze: **{gate}**",
           f"- B3 -> B4: {a34['correct']}/{a34['n']} = **{a34['accuracy']:.4f}**",
           f"- B4 -> B3: {a43['correct']}/{a43['n']} = **{a43['accuracy']:.4f}**",
           f"- combined: {combined_correct}/42 = **{combined:.4f}**",
           f"- chance: **{1/7:.4f}**",
           f"- 10,000-permutation p: **{pval:.6f}**",
           f"- non-generic recall coverage >=1/3: **{coverage}/6**",
           f"- impact-only combined: **{impact_comb:.4f}**",
           f"- attribution/decision-only combined: **{decision_comb:.4f}**","",
           "## Pooled recall"]
    for fam in FAMILIES: lines.append(f"- {fam}: {rec[fam]['recall']:.4f}")
    lines += ["","## Attribution diversity",f"- B3 values ({len(vals3)}): {vals3}",f"- B4 values ({len(vals4)}): {vals4}",
              "","## Conclusion counts",f"- B3: {result['conclusion_counts']['B3']}",f"- B4: {result['conclusion_counts']['B4']}",
              "","Calibration outcomes are engineering evidence only, not scientific evidence for Study B."]
    (OUT/"STUDY_B_CALIBRATION_V02_RESULTS.md").write_text("\n".join(lines)+"\n",encoding="utf-8")
    print("STUDY_B_CALIBRATION_V02_ANALYSIS_COMPLETE")
    print("STUDY_B_COUNTED_FREEZE="+gate)
    print(f"B3_TO_B4={a34['accuracy']:.6f}")
    print(f"B4_TO_B3={a43['accuracy']:.6f}")
    print(f"COMBINED={combined:.6f}")
    print(f"PERM_P={pval:.6f}")
    print(f"COVERAGE={coverage}/6")
    print(f"IMPACT_ONLY={impact_comb:.6f}")
    print(f"ATTR_DECISION={decision_comb:.6f}")

if __name__=="__main__":
    main()
