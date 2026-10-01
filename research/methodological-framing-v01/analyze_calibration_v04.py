from __future__ import annotations
import json
from collections import Counter, defaultdict
from itertools import combinations
from pathlib import Path
from statistics import mean

BASE = Path(__file__).resolve().parent
ROOT = BASE / "calibration_v04"
CFG = json.loads((BASE / "CALIBRATION_V04_SCHEMA.json").read_text(encoding="utf-8-sig"))
KEY = ROOT / "BLIND_KEY.jsonl"
P = ROOT / "scoring" / "primary-gpt-6-sol" / "scores"
S = ROOT / "scoring" / "secondary-gpt-5.6-terra" / "scores"
OUT = ROOT / "analysis"
COUNT_FIELDS = CFG["count_fields"]
BOOL_FIELDS = CFG["boolean_fields"]

SIGNATURES = {
    "DIFFERENTIAL": ["baseline_noise_floor_explicit", "ordered_perturbation_axis_explicit"],
    "BAYESIAN": ["prior_uncertainty_explicit", "evidence_to_belief_update_explicit"],
    "FALSIFICATION": ["refutable_central_claim_explicit", "refuting_observation_predeclared"],
    "CAUSAL": [
        "causal_estimand_explicit",
        "identification_threat_or_assumption_explicit",
        "intervention_or_quasi_experimental_contrast_explicit",
    ],
    "STATE_SPACE": ["observable_state_vector_explicit", "transition_relation_explicit"],
    "SOFTWARE_TESTING": [
        "replay_regression_or_boundary_harness_explicit",
        "concrete_metamorphic_relation_explicit",
        "operational_test_or_failure_oracle_explicit",
    ],
}

def jsonl(path):
    return [json.loads(x) for x in path.read_text(encoding="utf-8").splitlines() if x.strip()]

def load_scores(path):
    return {f.stem: json.loads(f.read_text(encoding="utf-8"))["score"] for f in path.glob("*.json")}

def kappa(a, b):
    n = len(a)
    po = sum(x == y for x, y in zip(a, b)) / n
    ca, cb = Counter(a), Counter(b)
    cats = set(ca) | set(cb)
    pe = sum((ca[c] / n) * (cb[c] / n) for c in cats)
    return None if pe == 1 else (po - pe) / (1 - pe)

def bool_gate(raw, kap, prevalence):
    if kap is None or prevalence in (0, 1):
        return "DEGENERATE"
    if raw >= 0.85 and kap >= 0.65:
        return "GREEN"
    if raw >= 0.75 and kap >= 0.40:
        return "AMBER"
    return "RED"

def count_gate(exact, within):
    if exact >= 0.70 and within >= 0.90:
        return "GREEN"
    if exact >= 0.50 and within >= 0.80:
        return "AMBER"
    return "RED"

def hamming(a, b, fields):
    if not fields:
        return None
    return mean(float(a[f] != b[f]) for f in fields)

def main():
    meta = {x["blind_id"]: x for x in jsonl(KEY)}
    p, s = load_scores(P), load_scores(S)
    if len(p) != 42 or len(s) != 42 or set(p) != set(s):
        raise SystemExit(f"incomplete scores primary={len(p)} secondary={len(s)}")

    reliability = {"binary": {}, "counts": {}}
    ids = sorted(p)

    for f in BOOL_FIELDS:
        a = [p[i][f] for i in ids]
        b = [s[i][f] for i in ids]
        raw = sum(x == y for x, y in zip(a, b)) / len(a)
        kap = kappa(a, b)
        prevalence = mean(int(x) for x in a)
        reliability["binary"][f] = {
            "raw_agreement": raw,
            "kappa": kap,
            "primary_prevalence": prevalence,
            "gate": bool_gate(raw, kap, prevalence),
        }

    for f in COUNT_FIELDS:
        a = [p[i][f] for i in ids]
        b = [s[i][f] for i in ids]
        exact = sum(x == y for x, y in zip(a, b)) / len(a)
        within = sum(abs(x - y) <= 1 for x, y in zip(a, b)) / len(a)
        mae = mean(abs(x - y) for x, y in zip(a, b))
        reliability["counts"][f] = {
            "exact": exact,
            "within_one": within,
            "mae": mae,
            "gate": count_gate(exact, within),
        }

    green_fields = [
        f for f, row in reliability["binary"].items()
        if row["gate"] == "GREEN"
    ]

    separation = {}
    for task in ("T1", "T2"):
        task_ids = [i for i in ids if meta[i]["task_id"] == task]
        within, between = [], []
        for a, b in combinations(task_ids, 2):
            d = hamming(p[a], p[b], green_fields)
            if meta[a]["condition"] == meta[b]["condition"]:
                within.append(d)
            else:
                between.append(d)
        separation[task] = {
            "within_mean": mean(within),
            "between_mean": mean(between),
            "between_minus_within": mean(between) - mean(within),
            "within_pairs": len(within),
            "between_pairs": len(between),
        }

    all_within, all_between = [], []
    for task in ("T1", "T2"):
        task_ids = [i for i in ids if meta[i]["task_id"] == task]
        for a, b in combinations(task_ids, 2):
            d = hamming(p[a], p[b], green_fields)
            if meta[a]["condition"] == meta[b]["condition"]:
                all_within.append(d)
            else:
                all_between.append(d)
    separation["combined"] = {
        "within_mean": mean(all_within),
        "between_mean": mean(all_between),
        "between_minus_within": mean(all_between) - mean(all_within),
    }

    prevalence = defaultdict(lambda: defaultdict(dict))
    for task in ("T1", "T2"):
        for condition in ["GENERIC"] + list(SIGNATURES):
            rows = [p[i] for i in ids if meta[i]["task_id"] == task and meta[i]["condition"] == condition]
            prevalence[task][condition] = {
                f: mean(int(r[f]) for r in rows) for f in BOOL_FIELDS
            }

    signature_result = {}
    usable_families = []
    for family, fields in SIGNATURES.items():
        green = [f for f in fields if reliability["binary"][f]["gate"] == "GREEN"]
        diffs = {}
        activated = []
        for f in green:
            diffs[f] = {}
            for task in ("T1", "T2"):
                diff = prevalence[task][family][f] - prevalence[task]["GENERIC"][f]
                diffs[f][task] = diff
                if diff >= (1 / 3):
                    activated.append((f, task, diff))
        if family == "CAUSAL":
            reliable_enough = len(green) >= 2
        else:
            reliable_enough = len(green) >= 1
        usable = reliable_enough and bool(activated)
        if usable:
            usable_families.append(family)
        signature_result[family] = {
            "candidate_fields": fields,
            "green_fields": green,
            "target_minus_generic": diffs,
            "activated": [
                {"field": f, "task": task, "difference": diff}
                for f, task, diff in activated
            ],
            "usable": usable,
        }

    count_all_green = all(x["gate"] == "GREEN" for x in reliability["counts"].values())
    structural_go = (
        separation["combined"]["between_minus_within"] > 0.05
        and separation["T1"]["between_minus_within"] >= 0
        and separation["T2"]["between_minus_within"] >= 0
    )
    freeze_go = (
        count_all_green
        and len(green_fields) >= 6
        and structural_go
        and len(usable_families) >= 4
    )

    result = {
        "calibration_only": True,
        "reliability": reliability,
        "green_binary_fields": green_fields,
        "separation": separation,
        "signature_result": signature_result,
        "usable_families": usable_families,
        "gate": {
            "all_primary_counts_green": count_all_green,
            "green_binary_n": len(green_fields),
            "structural_separability_pass": structural_go,
            "usable_method_families_n": len(usable_families),
            "study_A_freeze": "GO" if freeze_go else "NO_GO",
        },
    }

    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "CALIBRATION_V04_RESULTS.json").write_text(
        json.dumps(result, indent=2), encoding="utf-8"
    )

    lines = [
        "# Calibration v0.4 Results",
        "",
        "**NON-COUNTED INSTRUMENT CALIBRATION.**",
        "",
        "## Gate",
        f"- Study A freeze: **{result['gate']['study_A_freeze']}**",
        f"- GREEN binary fields: {len(green_fields)}",
        f"- all count fields GREEN: {count_all_green}",
        f"- structural separability pass: {structural_go}",
        f"- usable method families: {len(usable_families)} ({', '.join(usable_families)})",
        "",
        "## Structural separability",
        "",
        "| task | within | between | excess |",
        "|---|---:|---:|---:|",
    ]
    for task in ("T1", "T2", "combined"):
        row = separation[task]
        lines.append(
            f"| {task} | {row['within_mean']:.4f} | {row['between_mean']:.4f} | {row['between_minus_within']:.4f} |"
        )

    lines += [
        "",
        "## Binary reliability",
        "",
        "| field | gate | raw | kappa | prevalence |",
        "|---|---|---:|---:|---:|",
    ]
    for f, row in reliability["binary"].items():
        kval = "NA" if row["kappa"] is None else f"{row['kappa']:.3f}"
        lines.append(
            f"| {f} | {row['gate']} | {row['raw_agreement']:.3f} | {kval} | {row['primary_prevalence']:.3f} |"
        )

    lines += [
        "",
        "## Count reliability",
        "",
        "| field | gate | exact | within one | MAE |",
        "|---|---|---:|---:|---:|",
    ]
    for f, row in reliability["counts"].items():
        lines.append(
            f"| {f} | {row['gate']} | {row['exact']:.3f} | {row['within_one']:.3f} | {row['mae']:.3f} |"
        )

    lines += ["", "## Method signatures", ""]
    for family, row in signature_result.items():
        lines.append(
            f"- **{family}**: usable={row['usable']}; GREEN={', '.join(row['green_fields']) or 'none'}"
        )
        for act in row["activated"]:
            lines.append(
                f"  - activated {act['field']} on {act['task']}: target-GENERIC={act['difference']:.3f}"
            )

    lines += [
        "",
        "Calibration differences are engineering evidence only and are not counted scientific results.",
    ]
    (OUT / "CALIBRATION_V04_RESULTS.md").write_text("\n".join(lines) + "\n", encoding="utf-8")

    print("CALIBRATION_V04_ANALYSIS_COMPLETE")
    print("STUDY_A_FREEZE=" + result["gate"]["study_A_freeze"])
    print(f"GREEN_BINARY={len(green_fields)}")
    print(f"USABLE_FAMILIES={len(usable_families)}")
    print(f"SEPARATION_COMBINED={separation['combined']['between_minus_within']:.6f}")

if __name__ == "__main__":
    main()
