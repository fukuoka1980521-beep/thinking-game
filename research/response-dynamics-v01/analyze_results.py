from __future__ import annotations
import json
from collections import Counter, defaultdict
from itertools import combinations
from pathlib import Path
from statistics import mean, median

from metrics import (
    amplification_ratio,
    cohen_kappa,
    component_distances,
    correction_effectiveness,
    modal_flip_rate,
    pairwise_semantic_disagreement,
    premise_hardening,
    response_state_distance,
    semantic_class_entropy,
)

BASE = Path(__file__).resolve().parent
SCORING = BASE / "data" / "scoring"
KEY_PATH = SCORING / "BLIND_KEY.jsonl"
PRIMARY_DIR = SCORING / "primary-gpt-6-sol-20261002" / "scores"
SECONDARY_DIR = SCORING / "secondary-gpt-5.6-terra-20261002" / "scores"
SECONDARY_SAMPLE = SCORING / "SECONDARY_SAMPLE.json"
BANK_PATH = BASE / "ANCHOR_BANK.json"
OUT = BASE / "data" / "analysis"
def read_jsonl(path: Path):
    return [json.loads(x) for x in path.read_text(encoding="utf-8").splitlines() if x.strip()]

def load_score_dir(path: Path):
    return {p.stem: json.loads(p.read_text(encoding="utf-8")) for p in path.glob("*.json")}

def summary(values):
    return {
        "n": len(values),
        "mean": None if not values else mean(values),
        "median": None if not values else median(values),
        "min": None if not values else min(values),
        "max": None if not values else max(values),
    }

def flip_fraction(pairs, field):
    if not pairs:
        return None
    return sum(a[field] != b[field] for a, b in pairs) / len(pairs)

def component_mean(pairs):
    bucket = defaultdict(list)
    for a, b in pairs:
        for key, value in component_distances(a, b).items():
            if value is not None:
                bucket[key].append(value)
    return {k: {"n": len(v), "mean": mean(v)} for k, v in sorted(bucket.items())}
def indep_id(anchor_id, condition, replicate):
    return f"I-{anchor_id}-{condition}-R{replicate:02d}"

def traj_id(anchor_id, replicate, turn, suffix=None):
    base = f"T-{anchor_id}-R{replicate:02d}-T{turn}"
    return base if suffix is None else base + "-" + suffix

def transition_label(left, right):
    a = "NULL" if left is None else str(left)
    b = "NULL" if right is None else str(right)
    return f"{a}->{b}"

def categorical_agreement(left, right):
    n = len(left)
    return {
        "n": n,
        "raw_agreement": sum(a == b for a, b in zip(left, right)) / n,
        "kappa": cohen_kappa(left, right),
    }

def ordinal_agreement(left, right):
    pairs = [(a, b) for a, b in zip(left, right) if a is not None and b is not None]
    if not pairs:
        return {"n": 0, "exact": None, "within_one": None}
    return {
        "n": len(pairs),
        "exact": sum(a == b for a, b in pairs) / len(pairs),
        "within_one": sum(abs(a - b) <= 1 for a, b in pairs) / len(pairs),
    }
def main():
    bank = json.loads(BANK_PATH.read_text(encoding="utf-8"))
    anchor_ids = [a["id"] for a in bank["anchors"]]
    trajectory_anchors = bank["trajectory_anchor_ids"]
    keys = read_jsonl(KEY_PATH)
    key_by_blind = {row["blind_id"]: row for row in keys}
    primary = load_score_dir(PRIMARY_DIR)
    secondary = load_score_dir(SECONDARY_DIR)
    if len(primary) != 336 or len(secondary) != 84:
        raise SystemExit(f"scores incomplete primary={len(primary)} secondary={len(secondary)}")

    state = {}
    for blind_id, record in primary.items():
        state[key_by_blind[blind_id]["run_id"]] = record["score"]

    h1_anchors = {}
    exact_rsd_by_anchor = {}
    all_exact_rsd = []
    for anchor_id in anchor_ids:
        baseline = [state[indep_id(anchor_id, "BASELINE_EXACT", r)] for r in range(1, 6)]
        classes = [row["semantic_answer_class"] for row in baseline]
        h1_anchors[anchor_id] = {
            "psd": pairwise_semantic_disagreement(classes),
            "mfr": modal_flip_rate(classes),
            "entropy": semantic_class_entropy(classes),
            "classes": classes,
        }
        distances = [response_state_distance(a, b) for a, b in combinations(baseline, 2)]
        exact_rsd_by_anchor[anchor_id] = mean(distances)
        all_exact_rsd.extend(distances)

    psds = [row["psd"] for row in h1_anchors.values()]
    h1 = {
        "anchors": h1_anchors,
        "nonzero_anchor_count": sum(value > 0 for value in psds),
        "aggregate": {
            "mean_psd": mean(psds),
            "median_psd": median(psds),
            "mean_mfr": mean(row["mfr"] for row in h1_anchors.values()),
            "mean_entropy": mean(row["entropy"] for row in h1_anchors.values()),
        },
    }

    h2_anchors = {}
    h2_all_pairs = []
    for anchor_id in anchor_ids:
        pairs = []
        for condition in ("PARAPHRASE_A", "PARAPHRASE_B"):
            for replicate in (1, 2):
                pairs.append((
                    state[indep_id(anchor_id, "BASELINE_EXACT", replicate)],
                    state[indep_id(anchor_id, condition, replicate)],
                ))
        h2_all_pairs.extend(pairs)
        distances = [response_state_distance(a, b) for a, b in pairs]
        h2_anchors[anchor_id] = {
            "exact_mean_rsd": exact_rsd_by_anchor[anchor_id],
            "paraphrase_mean_rsd": mean(distances),
            "difference": mean(distances) - exact_rsd_by_anchor[anchor_id],
            "semantic_flip_fraction": flip_fraction(pairs, "semantic_answer_class"),
            "claim_flip_fraction": flip_fraction(pairs, "claim_state"),
            "action_flip_fraction": flip_fraction(pairs, "decision_or_action"),
        }
    h2 = {
        "anchors": h2_anchors,
        "positive_difference_count": sum(row["difference"] > 0 for row in h2_anchors.values()),
        "aggregate_mean_difference": mean(row["difference"] for row in h2_anchors.values()),
        "component_means": component_mean(h2_all_pairs),
    }

    h3_pairs = []
    for anchor_id in anchor_ids:
        for replicate in (1, 2):
            h3_pairs.append((
                state[indep_id(anchor_id, "BASELINE_EXACT", replicate)],
                state[indep_id(anchor_id, "PRIOR_ANSWER", replicate)],
            ))
    h3_rsd = [response_state_distance(a, b) for a, b in h3_pairs]
    exact_mean_rsd = mean(all_exact_rsd)
    h3 = {
        "rsd": summary(h3_rsd),
        "exact_repeat_mean_rsd": exact_mean_rsd,
        "aggregate_excess_rsd": mean(h3_rsd) - exact_mean_rsd,
        "semantic_flip_fraction": flip_fraction(h3_pairs, "semantic_answer_class"),
        "claim_flip_fraction": flip_fraction(h3_pairs, "claim_state"),
        "action_flip_fraction": flip_fraction(h3_pairs, "decision_or_action"),
        "component_means": component_mean(h3_pairs),
    }

    hardening_rows = []
    first_turns = Counter()
    eligible = hardened = action_changes = 0
    for anchor_id in trajectory_anchors:
        for replicate in range(1, 5):
            rows = [state[traj_id(anchor_id, replicate, turn)] for turn in (1, 2, 3)]
            result = premise_hardening(rows)
            action_changed = rows[0]["decision_or_action"] != rows[2]["decision_or_action"]
            hardening_rows.append({
                "anchor_id": anchor_id,
                "replicate": replicate,
                **result,
                "action_changed_t1_t3": action_changed,
            })
            if result["eligible"]:
                eligible += 1
                if result["hardened"]:
                    hardened += 1
                    first_turns[str(result["turn"])] += 1
            if action_changed:
                action_changes += 1
    h4 = {
        "eligible_n": eligible,
        "hardened_n": hardened,
        "hardening_rate": None if not eligible else hardened / eligible,
        "first_hardening_turn_counts": dict(first_turns),
        "action_changed_t1_t3_n": action_changes,
        "groups": hardening_rows,
    }

    relevant_corrections = []
    irrelevant_corrections = []
    correction_differences = []
    correction_signs = Counter()
    correction_rows = []
    for anchor_id in trajectory_anchors:
        for replicate in range(1, 5):
            pre = state[traj_id(anchor_id, replicate, 3)]["error_level"]
            rel_error = state[traj_id(anchor_id, replicate, 4, "REL")]["error_level"]
            irr_error = state[traj_id(anchor_id, replicate, 4, "IRR")]["error_level"]
            if pre is None or pre <= 0 or rel_error is None or irr_error is None:
                continue
            rel = correction_effectiveness(pre, rel_error)
            irr = correction_effectiveness(pre, irr_error)
            diff = rel - irr
            relevant_corrections.append(rel)
            irrelevant_corrections.append(irr)
            correction_differences.append(diff)
            correction_signs["relevant_gt" if diff > 0 else "relevant_lt" if diff < 0 else "equal"] += 1
            correction_rows.append({
                "anchor_id": anchor_id,
                "replicate": replicate,
                "pre_error": pre,
                "relevant_error": rel_error,
                "irrelevant_error": irr_error,
                "relevant_correction": rel,
                "irrelevant_correction": irr,
                "paired_difference": diff,
            })
    h5 = {
        "eligible_n": len(correction_differences),
        "relevant": summary(relevant_corrections),
        "irrelevant": summary(irrelevant_corrections),
        "paired_difference": summary(correction_differences),
        "paired_signs": dict(correction_signs),
        "groups": correction_rows,
    }

    h6_pairs = []
    h6_error_delta = []
    h6_error_direction = Counter()
    h6_material_change = 0
    for anchor_id in ("P01", "P02", "P03", "P04"):
        for replicate in (1, 2):
            base = state[indep_id(anchor_id, "BASELINE_EXACT", replicate)]
            bound = state[indep_id(anchor_id, "REFERENT_BOUND", replicate)]
            h6_pairs.append((base, bound))
            if any(base[key] != bound[key] for key in ("semantic_answer_class", "claim_state", "decision_or_action")):
                h6_material_change += 1
            if base["error_level"] is not None and bound["error_level"] is not None:
                delta = base["error_level"] - bound["error_level"]
                h6_error_delta.append(delta)
                h6_error_direction["reduced" if delta > 0 else "increased" if delta < 0 else "equal"] += 1
    h6 = {
        "n": len(h6_pairs),
        "rsd": summary([response_state_distance(a, b) for a, b in h6_pairs]),
        "semantic_flip_fraction": flip_fraction(h6_pairs, "semantic_answer_class"),
        "claim_flip_fraction": flip_fraction(h6_pairs, "claim_state"),
        "action_flip_fraction": flip_fraction(h6_pairs, "decision_or_action"),
        "any_material_change_n": h6_material_change,
        "error_delta": summary(h6_error_delta),
        "error_direction": {
            "reduced": h6_error_direction["reduced"],
            "equal": h6_error_direction["equal"],
            "increased": h6_error_direction["increased"],
        },
        "component_means": component_mean(h6_pairs),
    }

    adjacent_rows = []
    transitions = {key: Counter() for key in (
        "semantic_answer_class", "claim_state", "assertion_strength", "error_level"
    )}
    amplification_values = []
    amplification_rows = []
    for anchor_id in trajectory_anchors:
        for replicate in range(1, 5):
            rows = [state[traj_id(anchor_id, replicate, turn)] for turn in (1, 2, 3)]
            for turn, (left, right) in enumerate(zip(rows, rows[1:]), start=1):
                adjacent_rows.append({
                    "anchor_id": anchor_id,
                    "replicate": replicate,
                    "from_turn": turn,
                    "to_turn": turn + 1,
                    "rsd": response_state_distance(left, right),
                })
                for key in transitions:
                    transitions[key][transition_label(left[key], right[key])] += 1
                ratio = amplification_ratio(left["error_level"], right["error_level"])
                if ratio is not None:
                    amplification_values.append(ratio)
                    amplification_rows.append({
                        "anchor_id": anchor_id,
                        "replicate": replicate,
                        "from_turn": turn,
                        "ratio": ratio,
                    })
    sequential = {
        "adjacent_rsd": summary([row["rsd"] for row in adjacent_rows]),
        "transitions": {key: dict(value) for key, value in transitions.items()},
        "amplification": summary(amplification_values),
        "amplification_rows": amplification_rows,
    }
    sample_ids = json.loads(SECONDARY_SAMPLE.read_text(encoding="utf-8"))
    primary_sample = [primary[blind_id]["score"] for blind_id in sample_ids]
    secondary_sample = [secondary[blind_id]["score"] for blind_id in sample_ids]
    categorical = {}
    for field in (
        "semantic_answer_class", "claim_state", "decision_or_action",
        "abstention_or_request", "new_supporting_evidence", "error_level",
    ):
        categorical[field] = categorical_agreement(
            [row[field] for row in primary_sample],
            [row[field] for row in secondary_sample],
        )
    ordinal = {
        "uncertainty_level": ordinal_agreement(
            [row["uncertainty_level"] for row in primary_sample],
            [row["uncertainty_level"] for row in secondary_sample],
        ),
        "assertion_strength": ordinal_agreement(
            [row["assertion_strength"] for row in primary_sample],
            [row["assertion_strength"] for row in secondary_sample],
        ),
        "error_level": ordinal_agreement(
            [row["error_level"] for row in primary_sample],
            [row["error_level"] for row in secondary_sample],
        ),
    }

    evidence_exact = []
    evidence_similarity = []
    referent_whole = []
    referent_components = {key: [] for key in ("entity", "environment", "version", "time")}
    for left, right in zip(primary_sample, secondary_sample):
        a = set(left["evidence_set"])
        b = set(right["evidence_set"])
        evidence_exact.append(a == b)
        evidence_similarity.append(1.0 if not a and not b else len(a & b) / len(a | b))
        left_ref = left["referent_tuple"]
        right_ref = right["referent_tuple"]
        referent_whole.append(left_ref == right_ref)
        for key in referent_components:
            referent_components[key].append(left_ref[key] == right_ref[key])
    reliability = {
        "n": 84,
        "categorical": categorical,
        "ordinal": ordinal,
        "evidence_set": {
            "exact_agreement": mean(evidence_exact),
            "mean_jaccard_similarity": mean(evidence_similarity),
        },
        "referent_tuple": {
            "whole_exact_agreement": mean(referent_whole),
            "component_exact_agreement": {
                key: mean(values) for key, values in referent_components.items()
            },
        },
    }
    if correction_differences:
        h5_status = "MET" if mean(correction_differences) > 0 else "NOT_MET"
        h5_basis = f"mean paired correction difference = {mean(correction_differences):.6f}"
    else:
        h5_status = "NOT_EVALUABLE"
        h5_basis = "no eligible pre-error groups"

    hypotheses = {
        "H1": {
            "status": "MET" if h1["nonzero_anchor_count"] > 0 else "NOT_MET",
            "basis": f"{h1['nonzero_anchor_count']}/16 anchors had PSD > 0",
        },
        "H2": {
            "status": "NO_BINARY_CRITERION_PREDEFINED",
            "basis": f"{h2['positive_difference_count']}/16 anchors had paraphrase RSD above exact-repeat RSD",
        },
        "H3": {
            "status": "MET" if h3["aggregate_excess_rsd"] > 0 else "NOT_MET",
            "basis": f"prior-answer excess RSD = {h3['aggregate_excess_rsd']:.6f}",
        },
        "H4": {
            "status": "MET" if hardened > 0 else "NOT_MET",
            "basis": f"{hardened}/{eligible} eligible trajectories hardened",
        },
        "H5": {"status": h5_status, "basis": h5_basis},
        "H6": {
            "status": "MET" if h6_material_change > 0 else "NOT_MET",
            "basis": f"{h6_material_change}/8 referent-bound pairs changed semantic, claim, or action state",
        },
    }
    results = {
        "metadata": {
            "acting_model": "gpt-5.6-sol",
            "primary_scorer": "gpt-6-sol",
            "secondary_scorer": "gpt-5.6-terra",
            "raw_n": 336,
            "primary_scored": len(primary),
            "secondary_scored": len(secondary),
        },
        "hypothesis_summary": hypotheses,
        "h1": h1,
        "h2": h2,
        "h3": h3,
        "h4": h4,
        "h5": h5,
        "h6": h6,
        "sequential": sequential,
        "reliability": reliability,
    }

    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "RESULTS.json").write_text(
        json.dumps(results, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    lines = [
        "# Response Dynamics v0.1 — Empirical Results",
        "",
        f"Acting model: {results['metadata']['acting_model']}",
        f"Primary scorer: {results['metadata']['primary_scorer']}",
        f"Secondary scorer: {results['metadata']['secondary_scorer']}",
        "",
        "## Hypothesis summary",
        "",
    ]
    for key, row in hypotheses.items():
        lines.append(f"- {key}: {row['status']} — {row['basis']}")
    lines.extend([
        "",
        "## Core endpoints",
        "",
        f"- H1 anchors with PSD > 0: {h1['nonzero_anchor_count']}/16",
        f"- H2 positive paraphrase-minus-exact anchors: {h2['positive_difference_count']}/16",
        f"- H3 prior-answer excess mean RSD: {h3['aggregate_excess_rsd']:.6f}",
        f"- H4 hardening: {h4['hardened_n']}/{h4['eligible_n']} eligible",
        f"- H5 eligible verification groups: {h5['eligible_n']}/24",
        f"- H6 material referent changes: {h6['any_material_change_n']}/8",
        "",
        "## Reliability",
        "",
    ])
    for field, row in categorical.items():
        lines.append(f"- {field}: agreement={row['raw_agreement']:.4f}, kappa={row['kappa']:.4f}, n={row['n']}")
    lines.extend([
        "",
        "## Interpretation boundary",
        "",
        "Black-box behavioral results only. L3/internal neural mechanism is not supported by this protocol.",
        "",
    ])
    (OUT / "RESULTS.md").write_text("\n".join(lines), encoding="utf-8")
    print("ANALYSIS=COMPLETE")
    print("RESULTS_JSON=" + str(OUT / "RESULTS.json"))
    print("RESULTS_MD=" + str(OUT / "RESULTS.md"))
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
