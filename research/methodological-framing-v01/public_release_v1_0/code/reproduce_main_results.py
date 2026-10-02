from __future__ import annotations
import argparse, json, sys
from pathlib import Path
import numpy as np

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import FROZEN_STUDY_A_MEASUREMENT_V1_0 as m

DATA = HERE.parent / "data"
SEED = 20261002
parser = argparse.ArgumentParser()
parser.add_argument("--permutations", type=int, default=10000)
args = parser.parse_args()
N_PERM = args.permutations

def read_jsonl(path):
    return [json.loads(x) for x in path.read_text(encoding="utf-8").splitlines() if x.strip()]

def rows(records, study=None, depth=None, task=None):
    out = []
    for r in records:
        if study and r["study"] != study:
            continue
        if depth and r["instruction_depth"] != depth:
            continue
        if task and r["task_id"] != task:
            continue
        out.append({
            "id": r["run_id"],
            "task_id": r["task_id"],
            "condition": r["method_family"],
            "text": r["raw_text"],
        })
    return out

def direction(train_rows, test_rows):
    tt, xt, labels = m.prepare_direction(train_rows, test_rows)
    truth = np.array([m.CONDITIONS.index(r["condition"]) for r in test_rows], dtype=np.int16)
    pred, _ = m.predict(tt, xt, labels)
    correct = int(np.sum(pred == truth))
    return {
        "tt": tt, "xt": xt, "labels": labels, "truth": truth,
        "correct": correct, "n": len(test_rows), "accuracy": correct / len(test_rows),
    }

all_records = read_jsonl(DATA / "all_counted_plans_714.jsonl")
assert len(all_records) == 714

study_label = rows(all_records, "StudyA", "LABEL_ONLY")
study_oper = rows(all_records, "StudyA", "OPERATIONAL")
study_label_result = m.evaluate_cross_task(study_label, n_perm=N_PERM, seed=SEED)
study_oper_result = m.evaluate_cross_task(study_oper, n_perm=N_PERM, seed=SEED)
print("STUDY_A_LABEL_ONLY_COMBINED", study_label_result["combined_accuracy"])
print("STUDY_A_LABEL_ONLY_P", study_label_result["permutation_p_one_sided"])
print("STUDY_A_OPERATIONAL_COMBINED", study_oper_result["combined_accuracy"])

r1b = rows(all_records, "R1B", "LABEL_ONLY")
r1b_result = m.evaluate_cross_task(r1b, n_perm=N_PERM, seed=SEED)
print("R1B_COMBINED", r1b_result["combined_accuracy"])
print("R1B_P", r1b_result["permutation_p_one_sided"])

t1 = sorted(rows(all_records, "StudyA", "LABEL_ONLY", "T1"), key=lambda x: x["id"])
t2 = sorted(rows(all_records, "StudyA", "LABEL_ONLY", "T2"), key=lambda x: x["id"])
t3 = sorted(rows(all_records, "R1A", "LABEL_ONLY", "T3"), key=lambda x: x["id"])
dirs = [direction(t1, t3), direction(t3, t1), direction(t2, t3), direction(t3, t2)]
observed = sum(d["correct"] for d in dirs)

rng = np.random.default_rng(SEED)
hits = 0
for _ in range(N_PERM):
    p1 = rng.permutation(dirs[0]["labels"])
    p2 = rng.permutation(dirs[2]["labels"])
    p3 = rng.permutation(dirs[1]["labels"])
    x13, _ = m.predict(dirs[0]["tt"], dirs[0]["xt"], p1)
    x23, _ = m.predict(dirs[2]["tt"], dirs[2]["xt"], p2)
    x31, _ = m.predict(dirs[1]["tt"], dirs[1]["xt"], p3)
    x32, _ = m.predict(dirs[3]["tt"], dirs[3]["xt"], p3)
    c = int(
        np.sum(x13 == dirs[0]["truth"]) +
        np.sum(x23 == dirs[2]["truth"]) +
        np.sum(x31 == dirs[1]["truth"]) +
        np.sum(x32 == dirs[3]["truth"])
    )
    if c >= observed:
        hits += 1

print("R1A_COMBINED", observed / 504)
print("R1A_P", (hits + 1) / (N_PERM + 1))
