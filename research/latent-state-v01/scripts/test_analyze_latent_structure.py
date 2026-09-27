#!/usr/bin/env python3
"""Synthetic unit tests only. These fixtures are never research observations."""
from __future__ import annotations

import json
import subprocess
import sys
import tempfile
from pathlib import Path

CORE_FEATURES = [
    "local_success_signal",
    "local_failure_signal",
    "completion_signal",
    "repeated_repair",
    "evidence_gap",
    "measurement_conflict",
    "source_identity_divergence",
    "temporal_freshness_mismatch",
    "context_delta",
    "memory_context_contamination",
    "unsupported_inference_as_fact",
    "tool_result_partiality_or_misread",
    "source_hierarchy_conflict",
    "entity_disambiguation_failure",
    "confidence_calibration_failure",
    "destructive_operation_candidate",
    "scope_switch_pressure",
    "closure_pressure",
    "user_value_pressure",
    "goal_relation_ambiguity",
    "external_reality_gap",
    "human_observation_signal"
]


def feature_row(**overrides):
    out = {k: None for k in CORE_FEATURES}
    out.update(overrides)
    return out


def case(case_id, track, features, text=None, role="PROSPECTIVE", project="SYNTHETIC_UNIT_TEST"):
    return {
        "case_id": case_id,
        "captured_at": "TEST_ONLY",
        "project": project,
        "track": track,
        "dataset_role": role,
        "natural_case": True,
        "summary": "synthetic unit test only",
        "case_role": "TARGET_EVENT",
        "matched_case_id": None,
        "eligibility_basis": "SYNTHETIC_TEST_FIXTURE_ONLY",
        "materiality_reason": "synthetic validation",
        "selection_rule": "SYNTHETIC_TEST_FIXTURE_ONLY",
        "privacy_review": "PASS_NO_SECRET_OR_IDENTIFYING_RAW_CONTENT",
        "observed_features": features,
        "claim_state": "UNKNOWN",
        "hypothesis_status": "UNKNOWN",
        "evidence_refs": ["SYNTHETIC_TEST_FIXTURE"],
        "text_for_topic_model": text,
    }


def run(analyzer, path, *extra):
    cp = subprocess.run(
        [sys.executable, str(analyzer), str(path), *extra],
        check=True, capture_output=True, text=True,
    )
    return json.loads(cp.stdout)


def main():
    here = Path(__file__).resolve().parent
    analyzer = here / "analyze_latent_structure.py"
    rows = [
        case("T1", "LTM", feature_row(repeated_repair=1, closure_pressure=1, evidence_gap=0), "repair patch close"),
        case("T2", "ANSWER_VARIANCE", feature_row(repeated_repair=0, closure_pressure=0, evidence_gap=0, context_delta=1), "answer context evidence"),
        case("T3", "HALLUCINATION", feature_row(repeated_repair=0, closure_pressure=1, evidence_gap=1, unsupported_inference_as_fact=1), "unsupported evidence claim"),
        case("T4", "MULTI_TRACK", feature_row(repeated_repair=1, closure_pressure=0, evidence_gap=1, source_identity_divergence=1), "source identity close"),
    ]
    with tempfile.TemporaryDirectory() as td:
        td = Path(td)
        p = td / "cases.jsonl"
        p.write_text("\n".join(json.dumps(r) for r in rows) + "\n", encoding="utf-8")
        out = run(analyzer, p, "--max-components", "3", "--min-coverage", "0.50")
        assert out["status"] == "OK"
        assert out["n_cases_total"] == 4
        assert out["n_event_cases"] == 4
        assert out["n_matched_controls"] == 0
        assert out["dataset_role"] == "PROSPECTIVE"
        assert out["structured_feature_svd"]["status"] == "OK"
        assert out["missingness_svd"]["status"] in {"OK", "NO_VARIANCE"}
        assert out["causal_interpretation_allowed"] is False
        assert out["analysis_readiness"]["level"] == "ACCUMULATE_ONLY"
        assert out["analysis_readiness"]["factor_naming_allowed"] is False
        assert out["structured_feature_svd"]["leave_one_out_stability"]["status"] == "INSUFFICIENT_CASES"

        # A deliberately stable synthetic binary pattern across enough projects/tracks
        # may reach CANDIDATE_STRUCTURE_ONLY only after leave-one-out stability,
        # permutation-null separation, MCA availability, and cross-method convergence.
        stable = []
        tracks = ["LTM", "ANSWER_VARIANCE", "HALLUCINATION"]
        projects = ["P1", "P2", "P3"]
        for i in range(30):
            a = i % 2
            stable.append(
                case(
                    f"S{i+1:02d}",
                    tracks[i % len(tracks)],
                    feature_row(
                        repeated_repair=a,
                        closure_pressure=a,
                        evidence_gap=1-a,
                    ),
                    project=projects[i % len(projects)],
                )
            )
        stable_path = td / "stable.jsonl"
        stable_path.write_text(
            "\n".join(json.dumps(r) for r in stable) + "\n",
            encoding="utf-8",
        )
        stable_out = run(analyzer, stable_path)
        assert stable_out["structured_feature_svd"]["leave_one_out_stability"]["status"] == "OK"
        assert stable_out["structured_feature_svd"]["leave_one_out_stability"]["first_component_candidate_stable"] is True
        perm = stable_out["structured_feature_svd"]["permutation_null"]
        assert perm["status"] == "OK"
        assert perm["components"][0]["exceeds_null_95"] is True
        assert stable_out["binary_mca_lens"]["status"] == "OK"
        assert stable_out["cross_method_convergence"]["status"] == "OK"
        assert stable_out["cross_method_convergence"]["candidate_convergent"] is True
        assert stable_out["analysis_readiness"]["dynamic_min_cases_for_candidate"] >= 24
        assert stable_out["analysis_readiness"]["level"] == "CANDIDATE_STRUCTURE_ONLY"
        assert stable_out["analysis_readiness"]["factor_naming_allowed"] is True
        assert stable_out["analysis_readiness"]["development_os_promotion_allowed"] is False
        assert stable_out["causal_interpretation_allowed"] is False

        # Historical rows must not silently enter the default prospective analysis.
        hist = case(
            "H1", "LTM",
            feature_row(repeated_repair=1),
            role="HISTORICAL_NOT_PROSPECTIVE",
        )
        mixed = td / "mixed.jsonl"
        mixed.write_text(
            "\n".join(json.dumps(r) for r in rows + [hist]) + "\n",
            encoding="utf-8",
        )
        default_out = run(analyzer, mixed)
        assert default_out["n_cases_total"] == 4
        hist_out = run(analyzer, mixed, "--dataset-role", "HISTORICAL_NOT_PROSPECTIVE")
        assert hist_out["n_cases_total"] == 1

        empty = td / "empty.jsonl"
        empty.write_text("", encoding="utf-8")
        out2 = run(analyzer, empty)
        assert out2["status"] == "NO_EVENT_CASES"

        # Matched ordinary controls must not inflate event N/readiness.
        event = case(
            "E1", "HALLUCINATION",
            feature_row(evidence_gap=1, closure_pressure=1),
            project="P-CONTROL",
        )
        control = case(
            "C1", "HALLUCINATION",
            feature_row(evidence_gap=0, closure_pressure=0),
            project="P-CONTROL",
        )
        control["case_role"] = "MATCHED_ORDINARY_CONTROL"
        control["matched_case_id"] = "E1"
        control["materiality_reason"] = None
        control["selection_rule"] = "NEAREST_PRIOR_ORDINARY_SAME_PROJECT"
        pair_path = td / "pair.jsonl"
        pair_path.write_text(
            "\n".join(json.dumps(r) for r in [event, control]) + "\n",
            encoding="utf-8",
        )
        pair_out = run(analyzer, pair_path)
        assert pair_out["n_cases_total"] == 2
        assert pair_out["n_event_cases"] == 1
        assert pair_out["n_matched_controls"] == 1
        assert pair_out["matched_control_contrast"]["n_pairs"] == 1
        assert pair_out["analysis_readiness"]["n_cases"] == 1

        # Japanese/CJK raw text without explicit tokens must not be silently
        # pushed through the default English-oriented tokenizer.
        jp = td / "jp.jsonl"
        jp_rows = [
            case("J1", "HALLUCINATION", feature_row(evidence_gap=1), "証拠不足のまま結論"),
            case("J2", "ANSWER_VARIANCE", feature_row(context_delta=1), "同じ質問で回答が変わる"),
            case("J3", "LTM", feature_row(closure_pressure=1), "完了圧力で次へ進む"),
        ]
        jp.write_text("\n".join(json.dumps(r, ensure_ascii=False) for r in jp_rows) + "\n", encoding="utf-8")
        out3 = run(analyzer, jp, "--topics", "3")
        assert out3["lda_topic_mixture"]["status"] == "INSUFFICIENT_TOPIC_CASES"
        assert len(out3["lda_topic_mixture"]["skipped_tokenization_required"]) == 3

        # Missingness must be reported separately; it must not appear as a
        # semantic feature name.
        names = []
        if out["structured_feature_svd"]["status"] == "OK":
            for comp in out["structured_feature_svd"]["components"]:
                names.extend(x["feature"] for x in comp["top_loadings"])
        assert not any(name.endswith("__MISSING") for name in names)

    print("PASS: latent-state analyzer synthetic unit tests")


if __name__ == "__main__":
    main()
