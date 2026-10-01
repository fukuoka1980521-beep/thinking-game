from __future__ import annotations
import json
from collections import Counter
from pathlib import Path
import FROZEN_STUDY_A_MEASUREMENT_V1_0 as m

BASE=Path(__file__).resolve().parent
RAW=BASE/"study_a"/"raw"
OUT=BASE/"study_a"/"analysis"
N_PERM=10000
SEED=20261002

def load_rows():
    rows=[]
    for p in sorted(RAW.glob("*.json")):
        r=json.loads(p.read_text(encoding="utf-8"))
        rows.append({
            "id":r["run_id"],
            "task_id":r["task_id"],
            "condition":r["method_family"],
            "depth":r["instruction_depth"],
            "text":r["raw_text"],
        })
    if len(rows)!=336:
        raise SystemExit(f"expected 336 rows, got {len(rows)}")
    return rows

def per_family_recall(eval_result):
    preds=eval_result["train_T1_test_T2"]["predictions"]+eval_result["train_T2_test_T1"]["predictions"]
    out={}
    for c in m.CONDITIONS:
        xs=[x for x in preds if x["true"]==c]
        out[c]={
            "correct":sum(x["pred"]==c for x in xs),
            "n":len(xs),
            "recall":sum(x["pred"]==c for x in xs)/len(xs) if xs else None,
        }
    return out

def confusion(eval_result):
    mat={c:{d:0 for d in m.CONDITIONS} for c in m.CONDITIONS}
    for block in ("train_T1_test_T2","train_T2_test_T1"):
        for x in eval_result[block]["predictions"]:
            mat[x["true"]][x["pred"]]+=1
    return mat

def main():
    rows=load_rows()
    label=[r for r in rows if r["depth"]=="LABEL_ONLY"]
    operational=[r for r in rows if r["depth"]=="OPERATIONAL"]
    if len(label)!=252 or len(operational)!=84:
        raise SystemExit("depth denominator mismatch")

    label_eval=m.evaluate_cross_task(label,n_perm=N_PERM,seed=SEED)
    label_dist=m.cross_task_distance(label)
    op_eval=m.evaluate_cross_task(operational,n_perm=N_PERM,seed=SEED)
    op_dist=m.cross_task_distance(operational)

    chance=1/7
    primary_success=(
        label_eval["permutation_p_one_sided"]<=0.01
        and label_eval["train_T1_test_T2"]["accuracy"]>chance
        and label_eval["train_T2_test_T1"]["accuracy"]>chance
    )

    result={
        "study":"A",
        "counted":True,
        "denominator":336,
        "primary_subset":"LABEL_ONLY",
        "primary_n":252,
        "chance_accuracy":chance,
        "primary":{
            "cross_task_classification":label_eval,
            "cross_task_distance":label_dist,
            "per_family_recall":per_family_recall(label_eval),
            "confusion":confusion(label_eval),
            "confirmatory_success":primary_success,
            "success_rule":"permutation_p<=0.01 and both directional accuracies > 1/7"
        },
        "secondary":{
            "operational_n":84,
            "operational_cross_task_classification":op_eval,
            "operational_cross_task_distance":op_dist,
            "operational_per_family_recall":per_family_recall(op_eval),
            "accuracy_difference_operational_minus_label_only":
                op_eval["combined_accuracy"]-label_eval["combined_accuracy"],
            "distance_excess_difference_operational_minus_label_only":
                op_dist["between_minus_within"]-label_dist["between_minus_within"]
        },
        "boundary":"observable black-box research-plan signatures only; no hidden reasoning-state claim and no methodology ranking"
    }

    OUT.mkdir(parents=True,exist_ok=True)
    (OUT/"STUDY_A_RESULTS.json").write_text(json.dumps(result,indent=2),encoding="utf-8")

    le=label_eval; oe=op_eval
    lines=[
        "# Study A — Counted Results","",
        "## Primary: LABEL_ONLY cross-task method signature","",
        f"- Confirmatory success: **{primary_success}**",
        f"- T1 -> T2: {le['train_T1_test_T2']['correct']}/{le['train_T1_test_T2']['n']} = {le['train_T1_test_T2']['accuracy']:.4f}",
        f"- T2 -> T1: {le['train_T2_test_T1']['correct']}/{le['train_T2_test_T1']['n']} = {le['train_T2_test_T1']['accuracy']:.4f}",
        f"- Combined: {le['combined_correct']}/{le['combined_n']} = {le['combined_accuracy']:.4f}",
        f"- Chance: {chance:.4f}",
        f"- 10,000-permutation p: {le['permutation_p_one_sided']:.6f}",
        f"- Cross-task within-method distance: {label_dist['within_mean']:.6f}",
        f"- Cross-task between-method distance: {label_dist['between_mean']:.6f}",
        f"- Between-minus-within: {label_dist['between_minus_within']:.6f}",
        "",
        "### Per-family recall",
        "",
        "| family | correct | n | recall |",
        "|---|---:|---:|---:|",
    ]
    for c,row in result["primary"]["per_family_recall"].items():
        lines.append(f"| {c} | {row['correct']} | {row['n']} | {row['recall']:.4f} |")

    lines += [
        "",
        "## Secondary: OPERATIONAL framing","",
        f"- T1 -> T2: {oe['train_T1_test_T2']['correct']}/{oe['train_T1_test_T2']['n']} = {oe['train_T1_test_T2']['accuracy']:.4f}",
        f"- T2 -> T1: {oe['train_T2_test_T1']['correct']}/{oe['train_T2_test_T1']['n']} = {oe['train_T2_test_T1']['accuracy']:.4f}",
        f"- Combined: {oe['combined_correct']}/{oe['combined_n']} = {oe['combined_accuracy']:.4f}",
        f"- 10,000-permutation p: {oe['permutation_p_one_sided']:.6f}",
        f"- Between-minus-within distance: {op_dist['between_minus_within']:.6f}",
        f"- Accuracy difference OPERATIONAL - LABEL_ONLY: {result['secondary']['accuracy_difference_operational_minus_label_only']:.6f}",
        "",
        "## Interpretation boundary","",
        "The primary measurement masks explicit method labels and a broad frozen method-specific lexicon before feature extraction.",
        "The result concerns observable plan-text signatures across tasks. It does not reveal hidden chain-of-thought or establish that one methodology is superior."
    ]
    (OUT/"STUDY_A_RESULTS.md").write_text("\n".join(lines)+"\n",encoding="utf-8")

    print("STUDY_A_ANALYSIS_COMPLETE")
    print("PRIMARY_SUCCESS="+str(primary_success))
    print(f"LABEL_T1_TO_T2={le['train_T1_test_T2']['correct']}/{le['train_T1_test_T2']['n']}")
    print(f"LABEL_T2_TO_T1={le['train_T2_test_T1']['correct']}/{le['train_T2_test_T1']['n']}")
    print(f"LABEL_COMBINED={le['combined_correct']}/{le['combined_n']}")
    print(f"LABEL_PERM_P={le['permutation_p_one_sided']:.6f}")
    print(f"LABEL_DIST_EXCESS={label_dist['between_minus_within']:.6f}")
    print(f"OP_COMBINED={oe['combined_correct']}/{oe['combined_n']}")
    print(f"OP_PERM_P={oe['permutation_p_one_sided']:.6f}")

if __name__=="__main__":
    main()
