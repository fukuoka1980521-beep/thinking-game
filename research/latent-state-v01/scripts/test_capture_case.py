#!/usr/bin/env python3
"""Synthetic tests for capture_case.py. No fixture enters research data."""
from __future__ import annotations

import json
import subprocess
import sys
import tempfile
from pathlib import Path


def main():
    here = Path(__file__).resolve().parent
    capture = here / "capture_case.py"
    with tempfile.TemporaryDirectory() as td:
        td = Path(td)
        target = td / "prospective.jsonl"
        payload = {
            "case_id": "TEST-001",
            "captured_at": "TEST_ONLY",
            "project": "SYNTHETIC_UNIT_TEST",
            "track": "HALLUCINATION",
            "natural_case": True,
            "summary": "synthetic test only",
            "observed_features": {"evidence_gap": 1, "closure_pressure": None},
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

    print("PASS: capture-case synthetic unit tests")


if __name__ == "__main__":
    main()
