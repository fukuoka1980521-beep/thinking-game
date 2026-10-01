from __future__ import annotations
import json
from collections import Counter,defaultdict
from itertools import combinations
from pathlib import Path
from statistics import mean

BASE=Path(__file__).resolve().parent
CFG=json.loads((BASE/"RESEARCH_STATE_SCHEMA_V0_2_DRAFT.json").read_text(encoding="utf-8"))
KEY=BASE/"pilot"/"BLIND_KEY.jsonl"
P=BASE/"pilot"/"scoring_v02"/"primary-gpt-6-sol"/"scores"
S=BASE/"pilot"/"scoring_v02"/"secondary-gpt-5.6-terra"/"scores"
OUT=BASE/"pilot"/"analysis_v02"
COUNT_FIELDS=CFG["general_count_fields"]
BOOL_FIELDS=CFG["general_boolean_fields"]+[f for xs in CFG["signature_boolean_fields"].values() for f in xs]

def jsonl(path):
    return [json.loads(x) for x in path.read_text(encoding="utf-8").splitlines() if x.strip()]

def load_scores(path):
    return {f.stem:json.loads(f.read_text(encoding="utf-8"))["score"] for f in path.glob("*.json")}

def kappa(a,b):
    n=len(a)
    po=sum(x==y for x,y in zip(a,b))/n
    ca,cb=Counter(a),Counter(b)
    cats=set(ca)|set(cb)
    pe=sum((ca[c]/n)*(cb[c]/n) for c in cats)
    return None if pe==1 else (po-pe)/(1-pe)

def bool_gate(raw,k):
    if k is None:
        return "DEGENERATE" if raw==1 else "RED"
    if raw>=0.85 and k>=0.65:
        return "GREEN"
    if raw>=0.75 and k>=0.40:
        return "AMBER"
    return "RED"

def count_gate(exact,within):
    if exact>=0.70 and within>=0.90:
        return "GREEN"
    if exact>=0.50 and within>=0.80:
        return "AMBER"
    return "RED"

def hamming(a,b):
    return mean(float(a[f]!=b[f]) for f in BOOL_FIELDS)

def main():
    meta={x["blind_id"]:x for x in jsonl(KEY)}
    p=load_scores(P); s=load_scores(S)
    if len(p)!=21 or len(s)!=21 or set(p)!=set(s):
        raise SystemExit(f"incomplete/mismatched scores primary={len(p)} secondary={len(s)}")

    reliability={"binary":{},"counts":{}}
    for f in BOOL_FIELDS:
        ids=sorted(p)
        a=[p[i][f] for i in ids]
        b=[s[i][f] for i in ids]
        raw=sum(x==y for x,y in zip(a,b))/len(a)
        kap=kappa(a,b)
        prevalence=mean(int(x) for x in a)
        reliability["binary"][f]={
            "raw_agreement":raw,
            "kappa":kap,
            "gate":bool_gate(raw,kap),
            "primary_prevalence":prevalence,
            "floor_ceiling_risk":prevalence<0.10 or prevalence>0.90
        }

    for f in COUNT_FIELDS:
        ids=sorted(p)
        a=[p[i][f] for i in ids]
        b=[s[i][f] for i in ids]
        exact=sum(x==y for x,y in zip(a,b))/len(a)
        within=sum(abs(x-y)<=1 for x,y in zip(a,b))/len(a)
        mae=mean(abs(x-y) for x,y in zip(a,b))
        reliability["counts"][f]={
            "exact":exact,"within_one":within,"mae":mae,
            "gate":count_gate(exact,within)
        }

    bycond=defaultdict(list)
    for bid,score in p.items():
        bycond[meta[bid]["condition"]].append(score)

    condition_summary={}
    for c,rows in sorted(bycond.items()):
        condition_summary[c]={
            "n":len(rows),
            "boolean_prevalence":{f:mean(int(r[f]) for r in rows) for f in BOOL_FIELDS},
            "count_means":{f:mean(r[f] for r in rows) for f in COUNT_FIELDS}
        }

    within=[]; between=[]
    ids=sorted(p)
    for a,b in combinations(ids,2):
        d=hamming(p[a],p[b])
        if meta[a]["condition"]==meta[b]["condition"]:
            within.append(d)
        else:
            between.append(d)
    sep=mean(between)-mean(within)
    sep_gate="USEFUL_PILOT_SEPARABILITY" if sep>0.05 else ("MODEST_REFINE" if sep>=0.02 else "TOO_INSENSITIVE")

    result={
        "pilot_only":True,
        "schema_version":"0.2-draft",
        "reliability":reliability,
        "condition_summary":condition_summary,
        "binary_plan_distance":{
            "within_condition_mean":mean(within),
            "between_condition_mean":mean(between),
            "between_minus_within":sep,
            "gate":sep_gate,
            "within_pairs":len(within),
            "between_pairs":len(between)
        }
    }

    OUT.mkdir(parents=True,exist_ok=True)
    (OUT/"PILOT_V02_RESULTS.json").write_text(json.dumps(result,indent=2),encoding="utf-8")

    lines=[
        "# Pilot v0.2 Instrument Results",
        "",
        "**NON-COUNTED PILOT. Same 21 fixed plans, rescored only.**",
        "",
        "## Structural separability",
        f"- within-condition mean binary Hamming: {result['binary_plan_distance']['within_condition_mean']:.4f}",
        f"- between-condition mean binary Hamming: {result['binary_plan_distance']['between_condition_mean']:.4f}",
        f"- between minus within: {sep:.4f}",
        f"- gate: **{sep_gate}**",
        "",
        "## Binary-field reliability",
        "",
        "| field | gate | raw agreement | kappa | prevalence | floor/ceiling |",
        "|---|---|---:|---:|---:|---|"
    ]
    for f,row in reliability["binary"].items():
        kval="NA" if row["kappa"] is None else f"{row['kappa']:.3f}"
        lines.append(
            f"| {f} | {row['gate']} | {row['raw_agreement']:.3f} | {kval} | "
            f"{row['primary_prevalence']:.3f} | {str(row['floor_ceiling_risk'])} |"
        )

    lines += [
        "",
        "## Count-field reliability",
        "",
        "| field | gate | exact | within one | MAE |",
        "|---|---|---:|---:|---:|"
    ]
    for f,row in reliability["counts"].items():
        lines.append(f"| {f} | {row['gate']} | {row['exact']:.3f} | {row['within_one']:.3f} | {row['mae']:.3f} |")

    greens=sum(r["gate"]=="GREEN" for r in reliability["binary"].values())
    ambers=sum(r["gate"]=="AMBER" for r in reliability["binary"].values())
    reds=sum(r["gate"]=="RED" for r in reliability["binary"].values())
    deg=sum(r["gate"]=="DEGENERATE" for r in reliability["binary"].values())
    cgreen=sum(r["gate"]=="GREEN" for r in reliability["counts"].values())
    camber=sum(r["gate"]=="AMBER" for r in reliability["counts"].values())
    cred=sum(r["gate"]=="RED" for r in reliability["counts"].values())
    lines += [
        "",
        "## Gate summary",
        f"- binary: GREEN={greens}, AMBER={ambers}, RED={reds}, DEGENERATE={deg}",
        f"- counts: GREEN={cgreen}, AMBER={camber}, RED={cred}",
        "",
        "No confirmatory interpretation is permitted from this calibration alone."
    ]
    (OUT/"PILOT_V02_RESULTS.md").write_text("\n".join(lines)+"\n",encoding="utf-8")
    print("PILOT_V02_ANALYSIS_COMPLETE")
    print(f"SEPARABILITY={sep:.6f} GATE={sep_gate}")
    print(f"BINARY GREEN={greens} AMBER={ambers} RED={reds} DEGENERATE={deg}")
    print(f"COUNTS GREEN={cgreen} AMBER={camber} RED={cred}")

if __name__=="__main__":
    main()
