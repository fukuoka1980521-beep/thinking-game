from __future__ import annotations
import json
from collections import Counter, defaultdict
from itertools import combinations
from pathlib import Path
from statistics import mean

BASE = Path(__file__).resolve().parent
ROOT = BASE / "calibration_v06"
KEY = ROOT / "BLIND_KEY.jsonl"
P = ROOT / "scoring" / "primary-gpt-6-sol" / "scores"
S = ROOT / "scoring" / "secondary-gpt-5.6-terra" / "scores"
CFG = json.loads((BASE / "CALIBRATION_V06_SCHEMA.json").read_text(encoding="utf-8-sig"))
ARTIFACT_BY_FAMILY = CFG["artifacts"]
ARTIFACTS = list(ARTIFACT_BY_FAMILY.values())
OUT = ROOT / "analysis"

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

def gate(raw, kap, prevalence):
    if kap is None or prevalence in (0, 1):
        return "DEGENERATE"
    if raw >= 0.85 and kap >= 0.65:
        return "GREEN"
    if raw >= 0.75 and kap >= 0.40:
        return "AMBER"
    return "RED"

def present(score, field):
    return bool(score[field]["present"])

def hamming(a, b, fields):
    if not fields:
        return None
    return mean(float(present(a, f) != present(b, f)) for f in fields)

def main():
    meta = {x["blind_id"]: x for x in jsonl(KEY)}
    p, s = load_scores(P), load_scores(S)
    if len(p) != 42 or len(s) != 42 or set(p) != set(s):
        raise SystemExit("incomplete scoring")

    ids = sorted(p)
    reliability = {}
    for f in ARTIFACTS:
        a = [present(p[i], f) for i in ids]
        b = [present(s[i], f) for i in ids]
        raw = sum(x == y for x, y in zip(a, b)) / len(a)
        kap = kappa(a, b)
        prevalence = mean(int(x) for x in a)
        reliability[f] = {
            "raw_agreement": raw,
            "kappa": kap,
            "primary_prevalence": prevalence,
            "gate": gate(raw, kap, prevalence),
        }

    green = [f for f, row in reliability.items() if row["gate"] == "GREEN"]

    separation = {}
    for task in ("T1", "T2"):
        task_ids = [i for i in ids if meta[i]["task_id"] == task]
        within, between = [], []
        for a, b in combinations(task_ids, 2):
            d = hamming(p[a], p[b], green)
            if d is None:
                continue
            if meta[a]["condition"] == meta[b]["condition"]:
                within.append(d)
            else:
                between.append(d)
        separation[task] = {
            "within_mean": mean(within) if within else None,
            "between_mean": mean(between) if between else None,
            "between_minus_within": (mean(between) - mean(within)) if within and between else None,
        }

    all_within, all_between = [], []
    for task in ("T1", "T2"):
        task_ids = [i for i in ids if meta[i]["task_id"] == task]
        for a, b in combinations(task_ids, 2):
            d = hamming(p[a], p[b], green)
            if d is None:
                continue
            if meta[a]["condition"] == meta[b]["condition"]:
                all_within.append(d)
            else:
                all_between.append(d)
    separation["combined"] = {
        "within_mean": mean(all_within) if all_within else None,
        "between_mean": mean(all_between) if all_between else None,
        "between_minus_within": (mean(all_between)-mean(all_within)) if all_within and all_between else None,
    }

    prevalence = defaultdict(lambda: defaultdict(dict))
    for task in ("T1", "T2"):
        for condition in ["GENERIC"] + list(ARTIFACT_BY_FAMILY):
            rows = [p[i] for i in ids if meta[i]["task_id"] == task and meta[i]["condition"] == condition]
            prevalence[task][condition] = {
                f: mean(int(present(r, f)) for r in rows) for f in ARTIFACTS
            }

    signature_result = {}
    usable = []
    for family, field in ARTIFACT_BY_FAMILY.items():
        is_green = reliability[field]["gate"] == "GREEN"
        diffs = {}
        activated = []
        if is_green:
            for task in ("T1", "T2"):
                diff = prevalence[task][family][field] - prevalence[task]["GENERIC"][field]
                diffs[task] = diff
                if diff >= 1/3:
                    activated.append({"task": task, "difference": diff})
        fam_usable = is_green and bool(activated)
        if fam_usable:
            usable.append(family)
        signature_result[family] = {
            "field": field,
            "gate": reliability[field]["gate"],
            "target_minus_generic": diffs,
            "activated": activated,
            "usable": fam_usable,
        }

    structural = (
        separation["combined"]["between_minus_within"] is not None
        and separation["combined"]["between_minus_within"] > 0.05
        and separation["T1"]["between_minus_within"] is not None
        and separation["T1"]["between_minus_within"] >= 0
        and separation["T2"]["between_minus_within"] is not None
        and separation["T2"]["between_minus_within"] >= 0
    )
    freeze_go = len(green) >= 4 and structural and len(usable) >= 4

    result = {
        "calibration_only": True,
        "reliability": reliability,
        "green_artifacts": green,
        "separation": separation,
        "signature_result": signature_result,
        "usable_families": usable,
        "gate": {
            "green_artifact_n": len(green),
            "structural_separability_pass": structural,
            "usable_method_families_n": len(usable),
            "study_A_freeze": "GO" if freeze_go else "NO_GO",
        },
    }

    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "CALIBRATION_V06_RESULTS.json").write_text(json.dumps(result, indent=2), encoding="utf-8")

    lines = [
        "# Calibration v0.6 Results",
        "",
        "**NON-COUNTED INSTRUMENT CALIBRATION.**",
        "",
        "## Gate",
        f"- Study A freeze: **{result['gate']['study_A_freeze']}**",
        f"- GREEN artifacts: {len(green)}/6",
        f"- structural separability pass: {structural}",
        f"- usable method families: {len(usable)} ({', '.join(usable)})",
        "",
        "## Structural separability",
        "",
        "| task | within | between | excess |",
        "|---|---:|---:|---:|",
    ]
    for task in ("T1","T2","combined"):
        row = separation[task]
        w = "NA" if row["within_mean"] is None else f"{row['within_mean']:.4f}"
        b = "NA" if row["between_mean"] is None else f"{row['between_mean']:.4f}"
        e = "NA" if row["between_minus_within"] is None else f"{row['between_minus_within']:.4f}"
        lines.append(f"| {task} | {w} | {b} | {e} |")

    lines += [
        "",
        "## Artifact reliability",
        "",
        "| artifact | gate | raw | kappa | prevalence |",
        "|---|---|---:|---:|---:|",
    ]
    for f,row in reliability.items():
        kval = "NA" if row["kappa"] is None else f"{row['kappa']:.3f}"
        lines.append(f"| {f} | {row['gate']} | {row['raw_agreement']:.3f} | {kval} | {row['primary_prevalence']:.3f} |")

    lines += ["", "## Method signatures", ""]
    for family,row in signature_result.items():
        lines.append(f"- **{family}**: usable={row['usable']}; gate={row['gate']}; field={row['field']}")
        for x in row["activated"]:
            lines.append(f"  - activated on {x['task']}: target-GENERIC={x['difference']:.3f}")

    lines += [
        "",
        "Calibration differences are engineering evidence only and are not counted scientific results.",
    ]
    (OUT / "CALIBRATION_V06_RESULTS.md").write_text("\n".join(lines)+"\n", encoding="utf-8")

    print("CALIBRATION_V06_ANALYSIS_COMPLETE")
    print("STUDY_A_FREEZE=" + result["gate"]["study_A_freeze"])
    print(f"GREEN_ARTIFACTS={len(green)}")
    print(f"USABLE_FAMILIES={len(usable)}")
    print("SEPARATION_COMBINED=" + str(separation["combined"]["between_minus_within"]))

if __name__ == "__main__":
    main()
