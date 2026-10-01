from __future__ import annotations
import json
from collections import Counter,defaultdict
from itertools import combinations
from pathlib import Path
from statistics import mean

BASE=Path(__file__).resolve().parent
KEY=BASE/"pilot"/"BLIND_KEY.jsonl"
P=BASE/"pilot"/"scoring"/"primary-gpt-6-sol"/"scores"
S=BASE/"pilot"/"scoring"/"secondary-gpt-5.6-terra"/"scores"
OUT=BASE/"pilot"/"analysis"
BOOL_FIELDS=[
"competing_hypotheses_present","explicit_null_hypothesis_present",
"semantic_vs_nonsemantic_state_separated","multicomponent_output_state_present",
"sequential_state_or_transition_model_present","perturbation_design_present",
"graded_perturbation_present","baseline_repeat_noise_estimation_present",
"causal_treatment_outcome_framing_present","counterfactual_or_matched_control_present",
"irrelevant_control_present","measurement_error_explicit","scorer_reliability_explicit",
"blinding_present","randomization_present","stopping_rule_present",
"sample_size_or_power_rationale_present","reproducibility_harness_present",
"metamorphic_relation_present","uncertainty_update_rule_present",
"evidence_acquisition_plan_present","history_as_explicit_factor_present",
"verification_as_explicit_factor_present","referent_or_provenance_factor_present",
"claim_ceiling_or_scope_limit_present"
]
COUNT_FIELDS=["problem_decomposition_count","named_variable_count","hypothesis_count","falsification_criterion_count","primary_endpoint_count"]

def jsonl(p):
    return [json.loads(x) for x in p.read_text(encoding="utf-8").splitlines() if x.strip()]

def scores(path):
    return {f.stem:json.loads(f.read_text(encoding="utf-8"))["score"] for f in path.glob("*.json")}

def kappa(a,b):
    n=len(a); po=sum(x==y for x,y in zip(a,b))/n
    ca,cb=Counter(a),Counter(b); cats=set(ca)|set(cb)
    pe=sum((ca[c]/n)*(cb[c]/n) for c in cats)
    return None if pe==1 else (po-pe)/(1-pe)

def hamming(a,b):
    return mean(float(a[f]!=b[f]) for f in BOOL_FIELDS)

def main():
    key=jsonl(KEY)
    p=scores(P); s=scores(S)
    if len(p)!=21 or len(s)!=21:
        raise SystemExit(f"incomplete scoring primary={len(p)} secondary={len(s)}")
    meta={x["blind_id"]:x for x in key}

    reliability={"binary":{},"counts":{}}
    for f in BOOL_FIELDS:
        a=[p[x][f] for x in sorted(p)]
        b=[s[x][f] for x in sorted(p)]
        reliability["binary"][f]={
            "raw_agreement":sum(x==y for x,y in zip(a,b))/len(a),
            "kappa":kappa(a,b),
            "primary_prevalence":mean(int(x) for x in a),
            "secondary_prevalence":mean(int(x) for x in b)
        }
    for f in COUNT_FIELDS:
        a=[p[x][f] for x in sorted(p)]
        b=[s[x][f] for x in sorted(p)]
        reliability["counts"][f]={
            "exact":sum(x==y for x,y in zip(a,b))/len(a),
            "within_one":sum(abs(x-y)<=1 for x,y in zip(a,b))/len(a),
            "mae":mean(abs(x-y) for x,y in zip(a,b))
        }

    bycond=defaultdict(list)
    for bid,score in p.items():
        bycond[meta[bid]["condition"]].append(score)

    condition_summary={}
    for c,rows in sorted(bycond.items()):
        condition_summary[c]={
            "n":len(rows),
            "binary_prevalence":{f:mean(int(r[f]) for r in rows) for f in BOOL_FIELDS},
            "count_means":{f:mean(r[f] for r in rows) for f in COUNT_FIELDS}
        }

    within=[]; between=[]
    ids=sorted(p)
    for a,b in combinations(ids,2):
        d=hamming(p[a],p[b])
        if meta[a]["condition"]==meta[b]["condition"]: within.append(d)
        else: between.append(d)

    result={
        "pilot_only":True,
        "reliability":reliability,
        "condition_summary":condition_summary,
        "binary_plan_distance":{
            "within_condition_mean":mean(within),
            "between_condition_mean":mean(between),
            "between_minus_within":mean(between)-mean(within),
            "within_pairs":len(within),"between_pairs":len(between)
        }
    }

    OUT.mkdir(parents=True,exist_ok=True)
    (OUT/"PILOT_RESULTS.json").write_text(json.dumps(result,indent=2),encoding="utf-8")

    lines=[
        "# Methodological Framing Pilot — Instrument Results",
        "",
        "**NON-COUNTED PILOT. Not a scientific result.**",
        "",
        "## Whole-plan binary feature separation",
        f"- within-condition mean Hamming distance: {result['binary_plan_distance']['within_condition_mean']:.4f}",
        f"- between-condition mean Hamming distance: {result['binary_plan_distance']['between_condition_mean']:.4f}",
        f"- between minus within: {result['binary_plan_distance']['between_minus_within']:.4f}",
        "",
        "## Binary-field scorer reliability",
        "",
        "| field | raw agreement | kappa |",
        "|---|---:|---:|"
    ]
    for f,row in reliability["binary"].items():
        k="NA" if row["kappa"] is None else f"{row['kappa']:.3f}"
        lines.append(f"| {f} | {row['raw_agreement']:.3f} | {k} |")
    lines += ["","## Count-field scorer reliability","","| field | exact | within one | MAE |","|---|---:|---:|---:|"]
    for f,row in reliability["counts"].items():
        lines.append(f"| {f} | {row['exact']:.3f} | {row['within_one']:.3f} | {row['mae']:.3f} |")
    lines += ["","## Interpretation gate",
              "Use this pilot only to decide which fields need clearer definitions, discretization, or removal before preregistration.",
              "Do not infer population effects from three repetitions per condition."]
    (OUT/"PILOT_RESULTS.md").write_text("\n".join(lines)+"\n",encoding="utf-8")
    print("PILOT_ANALYSIS_COMPLETE")

if __name__=="__main__":
    main()
