from __future__ import annotations
import json
from itertools import combinations
from pathlib import Path
from statistics import mean
from metrics import component_distances

BASE=Path(__file__).resolve().parent
SCORING=BASE/"data"/"scoring"
PRIMARY=SCORING/"primary-gpt-6-sol-20261002"/"scores"
KEY=SCORING/"BLIND_KEY.jsonl"
BANK=BASE/"ANCHOR_BANK.json"
OUT_JSON=BASE/"data"/"analysis"/"EXPLORATORY_ROBUSTNESS.json"
OUT_MD=BASE/"data"/"analysis"/"EXPLORATORY_ROBUSTNESS.md"

def read_jsonl(path):
    return [json.loads(x) for x in path.read_text(encoding="utf-8").splitlines() if x.strip()]

def iid(anchor,condition,rep):
    return f"I-{anchor}-{condition}-R{rep:02d}"

def dist(a,b,fields):
    ds=component_distances(a,b)
    vals=[ds[k] for k in fields if ds.get(k) is not None]
    return None if not vals else sum(vals)/len(vals)

def main():
    bank=json.loads(BANK.read_text(encoding="utf-8"))
    anchors=[x["id"] for x in bank["anchors"]]
    keys={x["blind_id"]:x for x in read_jsonl(KEY)}
    scores={}
    for f in PRIMARY.glob("*.json"):
        rec=json.loads(f.read_text(encoding="utf-8"))
        scores[keys[f.stem]["run_id"]]=rec["score"]

    sets={}
    sets["full"]=["semantic_answer_class","claim_state","decision_or_action","evidence_set","referent_tuple","uncertainty_level","assertion_strength","error_level","abstention_or_request"]
    sets["without_referent"]=[x for x in sets["full"] if x!="referent_tuple"]
    sets["without_claim"]=[x for x in sets["full"] if x!="claim_state"]
    sets["without_abstention"]=[x for x in sets["full"] if x!="abstention_or_request"]
    sets["core_no_low_agreement"]=["semantic_answer_class","decision_or_action","uncertainty_level","assertion_strength","error_level"]
    sets["semantic_action_only"]=["semantic_answer_class","decision_or_action"]

    result={}
    for label,fields in sets.items():
        exact_by_anchor={}
        exact_all=[]
        for anchor in anchors:
            baseline=[scores[iid(anchor,"BASELINE_EXACT",r)] for r in range(1,6)]
            vals=[dist(a,b,fields) for a,b in combinations(baseline,2)]
            vals=[x for x in vals if x is not None]
            exact_by_anchor[anchor]=mean(vals)
            exact_all.extend(vals)

        h2_diffs={}
        for anchor in anchors:
            pairs=[]
            for cond in ("PARAPHRASE_A","PARAPHRASE_B"):
                for rep in (1,2):
                    a=scores[iid(anchor,"BASELINE_EXACT",rep)]
                    b=scores[iid(anchor,cond,rep)]
                    pairs.append(dist(a,b,fields))
            h2_diffs[anchor]=mean(pairs)-exact_by_anchor[anchor]

        h3_pairs=[]
        for anchor in anchors:
            for rep in (1,2):
                a=scores[iid(anchor,"BASELINE_EXACT",rep)]
                b=scores[iid(anchor,"PRIOR_ANSWER",rep)]
                h3_pairs.append(dist(a,b,fields))
        result[label]={
            "fields":fields,
            "h2_positive_anchors":sum(v>0 for v in h2_diffs.values()),
            "h2_mean_difference":mean(h2_diffs.values()),
            "h3_prior_mean":mean(h3_pairs),
            "h3_exact_mean":mean(exact_all),
            "h3_excess":mean(h3_pairs)-mean(exact_all),
        }

    h6={"claim_flip":0,"semantic_flip":0,"action_flip":0}
    for anchor in ("P01","P02","P03","P04"):
        for rep in (1,2):
            a=scores[iid(anchor,"BASELINE_EXACT",rep)]
            b=scores[iid(anchor,"REFERENT_BOUND",rep)]
            h6["claim_flip"]+=int(a["claim_state"]!=b["claim_state"])
            h6["semantic_flip"]+=int(a["semantic_answer_class"]!=b["semantic_answer_class"])
            h6["action_flip"]+=int(a["decision_or_action"]!=b["decision_or_action"])
    result["h6_decomposition"]=h6
    OUT_JSON.write_text(json.dumps(result,indent=2),encoding="utf-8")
    lines=[
        "# Exploratory Robustness Audit",
        "",
        "Post-hoc sensitivity analysis; preregistered endpoints remain authoritative.",
        "",
        "| metric set | H2 positive anchors | H2 mean diff | H3 excess RSD |",
        "|---|---:|---:|---:|",
    ]
    for label,row in result.items():
        if label=="h6_decomposition":
            continue
        lines.append(f"| {label} | {row['h2_positive_anchors']}/16 | {row['h2_mean_difference']:.6f} | {row['h3_excess']:.6f} |")
    lines += ["","## H6 decomposition",
              f"- claim-state flips: {h6['claim_flip']}/8",
              f"- semantic-class flips: {h6['semantic_flip']}/8",
              f"- decision/action flips: {h6['action_flip']}/8"]
    OUT_MD.write_text("\n".join(lines)+"\n",encoding="utf-8")
    print("EXPLORATORY_ROBUSTNESS=COMPLETE")
    print(OUT_MD)

if __name__=="__main__":
    main()
