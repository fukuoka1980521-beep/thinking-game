from __future__ import annotations
import json, math, random
from collections import Counter, defaultdict
from itertools import combinations
from pathlib import Path
from statistics import mean

BASE = Path(__file__).resolve().parent
ROOT = BASE / "study_a"
KEY = ROOT / "BLIND_KEY.jsonl"
P = ROOT / "scoring" / "primary-gpt-6-sol" / "scores"
S = ROOT / "scoring" / "secondary-gpt-5.6-terra" / "scores"
SECONDARY_SAMPLE = ROOT / "SECONDARY_SAMPLE.json"
FROZEN = json.loads((BASE / "FROZEN_STUDY_A_SCHEMA_V1_0.json").read_text(encoding="utf-8"))
OUT = ROOT / "analysis"
PERM_N = 10000
BOOT_N = 10000
SEED = 20261002

COUNT_FIELDS = FROZEN["primary_general_count_fields"]
GLOBAL_FIELDS = FROZEN["global_structure_binary_fields"]
SIGNATURES = FROZEN["confirmatory_signature_fields_by_family"]

def jsonl(path):
    return [json.loads(x) for x in path.read_text(encoding="utf-8").splitlines() if x.strip()]

def load_scores(path):
    return {f.stem: json.loads(f.read_text(encoding="utf-8"))["score"] for f in path.glob("*.json")}

def kappa(a, b):
    n = len(a)
    po = sum(x == y for x, y in zip(a, b)) / n
    ca, cb = Counter(a), Counter(b)
    cats = set(ca) | set(cb)
    pe = sum((ca[c]/n)*(cb[c]/n) for c in cats)
    return None if pe == 1 else (po - pe) / (1 - pe)

def hamming(a, b, fields):
    return mean(float(a[f] != b[f]) for f in fields)

def structure_stat(rows, labels):
    within, between = [], []
    n = len(rows)
    for i in range(n):
        for j in range(i+1, n):
            d = hamming(rows[i], rows[j], GLOBAL_FIELDS)
            (within if labels[i] == labels[j] else between).append(d)
    return mean(between) - mean(within), mean(within), mean(between)

def signature_score(score, fields):
    return mean(int(score[f]) for f in fields)

def diff_mean(a, b):
    return mean(a) - mean(b)

def perm_p_two_group(a, b, observed, rnd, n=PERM_N, one_sided=True):
    vals = list(a) + list(b)
    na = len(a)
    hits = 0
    for _ in range(n):
        rnd.shuffle(vals)
        d = mean(vals[:na]) - mean(vals[na:])
        if one_sided:
            hits += d >= observed
        else:
            hits += abs(d) >= abs(observed)
    return (hits + 1) / (n + 1)

def bootstrap_ci(a, b, rnd, n=BOOT_N):
    vals = []
    for _ in range(n):
        sa = [a[rnd.randrange(len(a))] for _ in range(len(a))]
        sb = [b[rnd.randrange(len(b))] for _ in range(len(b))]
        vals.append(mean(sa) - mean(sb))
    vals.sort()
    lo = vals[int(0.025 * (n - 1))]
    hi = vals[int(0.975 * (n - 1))]
    return [lo, hi]

def holm(rows):
    ordered = sorted(enumerate(rows), key=lambda x: x[1]["p_raw"])
    m = len(rows)
    running = 0.0
    adjusted = [None] * m
    for rank, (idx, row) in enumerate(ordered):
        val = min(1.0, (m - rank) * row["p_raw"])
        running = max(running, val)
        adjusted[idx] = running
    out = []
    for row, adj in zip(rows, adjusted):
        x = dict(row)
        x["p_holm"] = adj
        out.append(x)
    return out

def main():
    meta = {x["blind_id"]: x for x in jsonl(KEY)}
    p = load_scores(P)
    s = load_scores(S)
    if len(p) != 336 or len(s) != 84:
        raise SystemExit("scores incomplete")

    # Reliability on frozen 84-plan subset.
    rel = {"binary": {}, "counts": {}}
    sids = sorted(s)
    for f in GLOBAL_FIELDS:
        a = [p[i][f] for i in sids]
        b = [s[i][f] for i in sids]
        raw = sum(x == y for x, y in zip(a, b)) / len(a)
        rel["binary"][f] = {"raw": raw, "kappa": kappa(a, b)}
    for f in COUNT_FIELDS:
        a = [p[i][f] for i in sids]
        b = [s[i][f] for i in sids]
        rel["counts"][f] = {
            "exact": sum(x == y for x, y in zip(a, b)) / len(a),
            "within_one": sum(abs(x-y) <= 1 for x, y in zip(a, b)) / len(a),
            "mae": mean(abs(x-y) for x, y in zip(a, b)),
        }

    # P1: global structure statistic on LABEL_ONLY, task-specific and combined.
    p1_task = {}
    observed_parts = []
    for task in ("T1", "T2"):
        bids = [
            bid for bid in p
            if meta[bid]["task_id"] == task and meta[bid]["instruction_depth"] == "LABEL_ONLY"
        ]
        rows = [p[bid] for bid in bids]
        labels = [meta[bid]["method_family"] for bid in bids]
        stat, within, between = structure_stat(rows, labels)
        p1_task[task] = {"excess": stat, "within": within, "between": between, "n": len(rows)}
        observed_parts.append(stat)
    p1_observed = mean(observed_parts)

    rnd = random.Random(SEED)
    perm_hits = 0
    # Preserve each task's observed method cell sizes by shuffling labels within task.
    task_payload = {}
    for task in ("T1", "T2"):
        bids = [
            bid for bid in p
            if meta[bid]["task_id"] == task and meta[bid]["instruction_depth"] == "LABEL_ONLY"
        ]
        task_payload[task] = (
            [p[bid] for bid in bids],
            [meta[bid]["method_family"] for bid in bids],
        )
    for _ in range(PERM_N):
        parts = []
        for task in ("T1", "T2"):
            rows, labels0 = task_payload[task]
            labels = list(labels0)
            rnd.shuffle(labels)
            parts.append(structure_stat(rows, labels)[0])
        perm_hits += mean(parts) >= p1_observed
    p1_p = (perm_hits + 1) / (PERM_N + 1)

    # P2: method-specific signature contrasts, LABEL_ONLY vs GENERIC within task.
    tests = []
    for family, fields in SIGNATURES.items():
        if family == "GENERIC" or not fields:
            continue
        for task in ("T1", "T2"):
            target = [
                signature_score(p[bid], fields)
                for bid in p
                if meta[bid]["task_id"] == task
                and meta[bid]["instruction_depth"] == "LABEL_ONLY"
                and meta[bid]["method_family"] == family
            ]
            generic = [
                signature_score(p[bid], fields)
                for bid in p
                if meta[bid]["task_id"] == task
                and meta[bid]["instruction_depth"] == "LABEL_ONLY"
                and meta[bid]["method_family"] == "GENERIC"
            ]
            obs = diff_mean(target, generic)
            rr = random.Random(f"{SEED}-{family}-{task}")
            p_raw = perm_p_two_group(target, generic, obs, rr, one_sided=True)
            ci = bootstrap_ci(target, generic, rr)
            tests.append({
                "family": family,
                "task": task,
                "fields": fields,
                "n_target": len(target),
                "n_generic": len(generic),
                "mean_target": mean(target),
                "mean_generic": mean(generic),
                "effect": obs,
                "ci95_bootstrap": ci,
                "p_raw": p_raw,
            })
    tests = holm(tests)

    # P3: sign agreement across tasks.
    by_family = defaultdict(dict)
    for row in tests:
        by_family[row["family"]][row["task"]] = row["effect"]
    p3 = {}
    for family, vals in by_family.items():
        if "T1" in vals and "T2" in vals:
            p3[family] = {
                "T1_effect": vals["T1"],
                "T2_effect": vals["T2"],
                "same_positive_direction": vals["T1"] > 0 and vals["T2"] > 0,
            }

    # Secondary: operational amplification of signature score.
    operational = []
    for family, fields in SIGNATURES.items():
        if family == "GENERIC" or not fields:
            continue
        for task in ("T1", "T2"):
            op = [
                signature_score(p[bid], fields)
                for bid in p
                if meta[bid]["task_id"] == task
                and meta[bid]["instruction_depth"] == "OPERATIONAL"
                and meta[bid]["method_family"] == family
            ]
            lab = [
                signature_score(p[bid], fields)
                for bid in p
                if meta[bid]["task_id"] == task
                and meta[bid]["instruction_depth"] == "LABEL_ONLY"
                and meta[bid]["method_family"] == family
            ]
            operational.append({
                "family": family,
                "task": task,
                "operational_mean": mean(op),
                "label_only_mean": mean(lab),
                "amplification": mean(op) - mean(lab),
            })

    result = {
        "preregistered_primary": {
            "P1_global_structure": {
                "task": p1_task,
                "combined_excess": p1_observed,
                "permutation_n": PERM_N,
                "p_value": p1_p,
            },
            "P2_method_signatures": tests,
            "P3_cross_task_direction": p3,
        },
        "secondary": {"operational_amplification": operational},
        "scorer_reliability": rel,
    }

    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "STUDY_A_RESULTS.json").write_text(json.dumps(result, indent=2), encoding="utf-8")

    lines = [
        "# Study A Results",
        "",
        "## P1 — Global LABEL_ONLY plan-structure dependence",
        f"- combined between-minus-within Hamming: **{p1_observed:.6f}**",
        f"- permutation p: **{p1_p:.6f}** ({PERM_N} permutations)",
    ]
    for task in ("T1", "T2"):
        row = p1_task[task]
        lines.append(
            f"- {task}: within={row['within']:.6f}, between={row['between']:.6f}, excess={row['excess']:.6f}"
        )

    lines += [
        "",
        "## P2 — Method-specific signature effects",
        "",
        "| family | task | effect | 95% bootstrap CI | raw p | Holm p |",
        "|---|---|---:|---:|---:|---:|",
    ]
    for row in tests:
        ci = row["ci95_bootstrap"]
        lines.append(
            f"| {row['family']} | {row['task']} | {row['effect']:.4f} | "
            f"[{ci[0]:.4f}, {ci[1]:.4f}] | {row['p_raw']:.5f} | {row['p_holm']:.5f} |"
        )

    lines += ["", "## P3 — Cross-task direction", ""]
    for family, row in p3.items():
        lines.append(
            f"- {family}: T1={row['T1_effect']:.4f}, T2={row['T2_effect']:.4f}, "
            f"same-positive={row['same_positive_direction']}"
        )

    lines += [
        "",
        "## Interpretation boundary",
        "These analyses test observable research-plan structure under randomized methodological framing.",
        "They do not establish hidden chain-of-thought states or rank methodologies as superior.",
    ]
    (OUT / "STUDY_A_RESULTS.md").write_text("\n".join(lines) + "\n", encoding="utf-8")

    print("STUDY_A_ANALYSIS_COMPLETE")
    print(f"P1_EXCESS={p1_observed:.6f}")
    print(f"P1_PERM_P={p1_p:.6f}")
    print(f"P2_TESTS={len(tests)}")

if __name__ == "__main__":
    main()
