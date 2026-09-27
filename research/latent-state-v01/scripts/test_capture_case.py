#!/usr/bin/env python3
"""Synthetic tests for capture_case.py. No fixture enters research data."""
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


def full_features():
    return {k: None for k in CORE_FEATURES}


def main():
    here = Path(__file__).resolve().parent
    capture = here / "capture_case.py"
    with tempfile.TemporaryDirectory() as td:
        td = Path(td)
        target = td / "prospective.jsonl"
        features = full_features()
        features["evidence_gap"] = 1
        features["closure_pressure"] = 0
        payload = {
            "case_id": "TEST-001",
            "captured_at": "TEST_ONLY",
            "project": "SYNTHETIC_UNIT_TEST",
            "track": "HALLUCINATION",
            "dataset_role": "PROSPECTIVE",
            "natural_case": True,
            "summary": "synthetic test only",
            "case_role": "TARGET_EVENT",
            "matched_case_id": None,
            "eligibility_basis": "SYNTHETIC_TEST_FIXTURE_ONLY",
            "materiality_reason": "synthetic validation",
            "selection_rule": "SYNTHETIC_TEST_FIXTURE_ONLY",
            "privacy_review": "PASS_NO_SECRET_OR_IDENTIFYING_RAW_CONTENT",
            "observed_features": features,
            "claim_state": "UNKNOWN",
            "evidence_refs": ["SYNTHETIC_TEST_FIXTURE"],
            "topic_tokens": ["証拠", "不足", "結論"],
        }
        source = td / "case.json"
        source.write_text(json.dumps(payload, ensure_ascii=False), encoding="utf-8")
        cp = subprocess.run(
            [sys.executable, str(capture), "--input", str(source), "--target", str(target)],
            check=True, capture_output=True, text=True,
        )
        assert "APPENDED TEST-001" in cp.stdout
        rows = [json.loads(x) for x in target.read_text(encoding="utf-8").splitlines()]
        assert len(rows) == 1
        assert rows[0]["case_id"] == "TEST-001"

        dup = subprocess.run(
            [sys.executable, str(capture), "--input", str(source), "--target", str(target)],
            capture_output=True, text=True,
        )
        assert dup.returncode != 0
        assert "duplicate case_id" in (dup.stderr + dup.stdout)

        # A matched ordinary control must link to an existing target-event id.
        control = dict(payload)
        control["case_id"] = "CTRL-001"
        control["case_role"] = "MATCHED_ORDINARY_CONTROL"
        control["matched_case_id"] = "TEST-001"
        control["materiality_reason"] = None
        control["selection_rule"] = "NEAREST_PRIOR_ORDINARY_SAME_PROJECT"
        control_path = td / "control.json"
        control_path.write_text(json.dumps(control, ensure_ascii=False), encoding="utf-8")
        cp_control = subprocess.run(
            [sys.executable, str(capture), "--input", str(control_path), "--target", str(target)],
            check=True, capture_output=True, text=True,
        )
        assert "APPENDED CTRL-001" in cp_control.stdout

        bad_control = dict(control)
        bad_control["case_id"] = "CTRL-002"
        bad_control["matched_case_id"] = None
        bad_control_path = td / "bad_control.json"
        bad_control_path.write_text(json.dumps(bad_control, ensure_ascii=False), encoding="utf-8")
        cp_bad_control = subprocess.run(
            [sys.executable, str(capture), "--input", str(bad_control_path), "--target", str(target)],
            capture_output=True, text=True,
        )
        assert cp_bad_control.returncode != 0
        assert "requires matched_case_id" in (cp_bad_control.stderr + cp_bad_control.stdout)

        # Sparse feature dictionaries are rejected so omission cannot masquerade as UNKNOWN.
        sparse = dict(payload)
        sparse["case_id"] = "TEST-002"
        sparse["observed_features"] = {"evidence_gap": 1}
        sparse_path = td / "sparse.json"
        sparse_path.write_text(json.dumps(sparse), encoding="utf-8")
        bad = subprocess.run(
            [sys.executable, str(capture), "--input", str(sparse_path), "--target", str(target)],
            capture_output=True, text=True,
        )
        assert bad.returncode != 0
        assert "all core features must be explicitly" in (bad.stderr + bad.stdout)

        # Historical calibration cannot be appended through the prospective capture path.
        hist = dict(payload)
        hist["case_id"] = "HIST-001"
        hist["dataset_role"] = "HISTORICAL_NOT_PROSPECTIVE"
        hist_path = td / "hist.json"
        hist_path.write_text(json.dumps(hist), encoding="utf-8")
        bad2 = subprocess.run(
            [sys.executable, str(capture), "--input", str(hist_path), "--target", str(target)],
            capture_output=True, text=True,
        )
        assert bad2.returncode != 0
        assert "only appends PROSPECTIVE" in (bad2.stderr + bad2.stdout)

    print("PASS: capture-case synthetic unit tests")


if __name__ == "__main__":
    main()
