#!/usr/bin/env python3
"""Synthetic unit tests only. These fixtures are never research observations."""
from __future__ import annotations

import json
import subprocess
import sys
import tempfile
from pathlib import Path


def case(case_id, track, features, text):
    return {
        "case_id": case_id,
        "captured_at": "TEST_ONLY",
        "project": "SYNTHETIC_UNIT_TEST",
        "track": track,
        "natural_case": True,
        "summary": "synthetic unit test only",
        "observed_features": features,
        "claim_state": "UNKNOWN",
        "hypothesis_status": "UNKNOWN",
        "evidence_refs": ["SYNTHETIC_TEST_FIXTURE"],
        "text_for_topic_model": text,
    }


def main():
    here = Path(__file__).resolve().parent
    analyzer = here / "analyze_latent_structure.py"
    rows = [
        case("T1", "LTM", {"repeated_repair": 1, "closure_pressure": 1}, "repair patch close"),
        case("T2", "ANSWER_VARIANCE", {"context_delta": 1, "evidence_gap": 0}, "answer context evidence"),
        case("T3", "HALLUCINATION", {"evidence_gap": 1, "unsupported_inference_as_fact": 1}, "unsupported evidence claim"),
        case("T4", "MULTI_TRACK", {"source_identity_divergence": 1, "closure_pressure": 1}, "source identity close"),
    ]
    with tempfile.TemporaryDirectory() as td:
        p = Path(td) / "cases.jsonl"
        p.write_text("\n".join(json.dumps(r) for r in rows) + "\n", encoding="utf-8")
        cp = subprocess.run(
            [sys.executable, str(analyzer), str(p), "--max-components", "3"],
            check=True,
            capture_output=True,
            text=True,
        )
        out = json.loads(cp.stdout)
        assert out["status"] == "OK"
        assert out["n_cases"] == 4
        assert out["structured_feature_svd"]["status"] == "OK"
        assert out["causal_interpretation_allowed"] is False

        empty = Path(td) / "empty.jsonl"
        empty.write_text("", encoding="utf-8")
        cp2 = subprocess.run(
            [sys.executable, str(analyzer), str(empty)],
            check=True,
            capture_output=True,
            text=True,
        )
        out2 = json.loads(cp2.stdout)
        assert out2["status"] == "NO_CASES"

    print("PASS: latent-state analyzer synthetic unit tests")


if __name__ == "__main__":
    main()
