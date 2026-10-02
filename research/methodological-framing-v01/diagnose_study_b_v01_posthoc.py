from __future__ import annotations
import json, math
from collections import Counter, defaultdict
from pathlib import Path
from statistics import mean, pstdev
import numpy as np
import FROZEN_STUDY_A_MEASUREMENT_V1_0 as tm

BASE=Path(__file__).resolve().parent
RAW=BASE/"study_b_calibration_v01"/"raw"
OUT=BASE/"study_b_calibration_v01"/"analysis"
FAMS=["GENERIC","DIFFERENTIAL","BAYESIAN","FALSIFICATION","CAUSAL","STATE_SPACE","SOFTWARE_TESTING"]
CONC=["SUPPORTS_MOST","DOES_NOT_SUPPORT_MOST","INCONCLUSIVE"]
ACT=["ACCEPT_TARGET_FOR_NOW","REJECT_TARGET_FOR_NOW","COLLECT_MORE_EVIDENCE"]
EIDS=[f"E{i}" for i in range(1,9)]

def norm(v):
    a=np.array(v,dtype=float)
    n=np.linalg.norm(a)
    return a/n if n else a

def subv(s,mode):
    if mode=="decision":
        return norm([*(1.0 if s["conclusion"]==x else 0.0 for x in CONC),
                     *(1.0 if s["next_action"]==x else 0.0 for x in ACT),
                     s["confidence"]/100.0])
    if mode=="evidence":
        ds=set(s["decisive_evidence_ids"])
        return norm([*(1.0 if e in ds else 0.0 for e in EIDS),
                     *(1.0 if s["strongest_counterevidence_id"]==e else 0.0 for e in EIDS)])
    raise ValueError(mode)

def classify(train,test,mode):
    X=np.stack([subv(r["state"],mode) for r in train])
    Y=np.stack([subv(r["state"],mode) for r in test])
    C=[]
    for fam in FAMS:
        ids=[i for i,r in enumerate(train) if r["method_family"]==fam]
        c=X[ids].mean(axis=0); n=np.linalg.norm(c); C.append(c/n if n else c)
    pred=np.argmax(Y@np.stack(C).T,axis=1)
    truth=np.array([FAMS.index(r["method_family"]) for r in test])
    return float(np.mean(pred==truth))

def crossdist(a,b,mode):
    within=[]; between=[]
    for x in a:
        vx=subv(x["state"],mode)
        for y in b:
            d=1-float(vx@subv(y["state"],mode))
            (within if x["method_family"]==y["method_family"] else between).append(d)
    return {"within":mean(within),"between":mean(between),"excess":mean(between)-mean(within)}

def main():
    rows=[json.loads(p.read_text(encoding="utf-8")) for p in sorted(RAW.glob("*.json"))]
    if len(rows)!=42: raise SystemExit("need 42")
    b1=[r for r in rows if r["packet_id"]=="B1"]
    b2=[r for r in rows if r["packet_id"]=="B2"]

    family={}
    for fam in FAMS:
        rr=[r for r in rows if r["method_family"]==fam]
        family[fam]={
          "conclusion_counts":dict(Counter(r["state"]["conclusion"] for r in rr)),
          "action_counts":dict(Counter(r["state"]["next_action"] for r in rr)),
          "confidence_mean":mean(r["state"]["confidence"] for r in rr),
          "confidence_sd":pstdev(r["state"]["confidence"] for r in rr),
          "decisive_evidence_counts":dict(Counter(e for r in rr for e in r["state"]["decisive_evidence_ids"])),
          "counterevidence_counts":dict(Counter(r["state"]["strongest_counterevidence_id"] for r in rr)),
        }

    packet={}
    for pid,rr in (("B1",b1),("B2",b2)):
        packet[pid]={
          "conclusion_counts":dict(Counter(r["state"]["conclusion"] for r in rr)),
          "action_counts":dict(Counter(r["state"]["next_action"] for r in rr)),
          "confidence_mean":mean(r["state"]["confidence"] for r in rr),
          "confidence_sd":pstdev(r["state"]["confidence"] for r in rr),
          "decisive_evidence_counts":dict(Counter(e for r in rr for e in r["state"]["decisive_evidence_ids"])),
          "counterevidence_counts":dict(Counter(r["state"]["strongest_counterevidence_id"] for r in rr)),
        }

    comp={}
    for mode in ("decision","evidence"):
        a12=classify(b1,b2,mode); a21=classify(b2,b1,mode)
        comp[mode]={"B1_to_B2":a12,"B2_to_B1":a21,"combined":(a12+a21)/2,"distance":crossdist(b1,b2,mode)}

    text_rows=[]
    for r in rows:
        text_rows.append({"id":r["run_id"],"task_id":r["packet_id"],"condition":r["method_family"],"text":r["state"]["rationale"]})
    rationale_eval=tm.evaluate_cross_task(text_rows,n_perm=10000,seed=2026100204)
    rationale_dist=tm.cross_task_distance(text_rows)

    result={
      "posthoc_only":True,
      "scientific_evidence":False,
      "family_summary":family,
      "packet_summary":packet,
      "component_cross_packet":comp,
      "masked_rationale_cross_packet":rationale_eval,
      "masked_rationale_distance":rationale_dist,
    }
    OUT.mkdir(parents=True,exist_ok=True)
    (OUT/"STUDY_B_V01_POSTHOC_DIAG.json").write_text(json.dumps(result,indent=2),encoding="utf-8")

    lines=["# Study B v0.1 Post-hoc Failure Diagnosis","",
           "**POST-HOC ENGINEERING DIAGNOSIS ONLY. Not scientific evidence.**","",
           "## Structured components"]
    for mode,x in comp.items():
        lines += [f"- {mode}: B1->B2={x['B1_to_B2']:.4f}, B2->B1={x['B2_to_B1']:.4f}, combined={x['combined']:.4f}, distance excess={x['distance']['excess']:.6f}"]
    lines += ["","## Masked rationale text",
              f"- combined accuracy: {rationale_eval['combined_accuracy']:.4f}",
              f"- permutation p: {rationale_eval['permutation_p_one_sided']:.6f}",
              f"- distance excess: {rationale_dist['between_minus_within']:.6f}","",
              "## Packet-level outcome concentration"]
    for pid,x in packet.items():
        lines += [f"- {pid} conclusions: {x['conclusion_counts']}",
                  f"- {pid} actions: {x['action_counts']}",
                  f"- {pid} confidence mean±sd: {x['confidence_mean']:.2f} ± {x['confidence_sd']:.2f}"]
    lines += ["","## Family summaries"]
    for fam,x in family.items():
        lines += [f"- {fam}: conclusions={x['conclusion_counts']}; actions={x['action_counts']}; confidence={x['confidence_mean']:.2f}±{x['confidence_sd']:.2f}; decisive={x['decisive_evidence_counts']}; counter={x['counterevidence_counts']}"]
    (OUT/"STUDY_B_V01_POSTHOC_DIAG.md").write_text("\n".join(lines)+"\n",encoding="utf-8")
    print("STUDY_B_V01_POSTHOC_DIAG_COMPLETE")
    print("DECISION_COMBINED="+str(comp["decision"]["combined"]))
    print("EVIDENCE_COMBINED="+str(comp["evidence"]["combined"]))
    print("RATIONALE_COMBINED="+str(rationale_eval["combined_accuracy"]))
    print("RATIONALE_P="+str(rationale_eval["permutation_p_one_sided"]))

if __name__=="__main__":
    main()
