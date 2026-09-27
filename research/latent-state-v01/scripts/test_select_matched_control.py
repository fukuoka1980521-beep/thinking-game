#!/usr/bin/env python3
from __future__ import annotations

import json
import subprocess
import sys
import tempfile
from pathlib import Path

from analyze_latent_structure import CORE_FEATURES


def features():
    return {k: 0 for k in CORE_FEATURES}


def main():
    tool = Path(__file__).resolve().parent / "select_matched_control.py"
    target = {
        "case_id": "OLSR-TARGET-1",
        "captured_at": "2026-09-27T12:00:00+09:00",
        "project": "P1",
        "track": "LTM",
        "dataset_role": "PROSPECTIVE",
        "case_role": "TARGET_EVENT",
    }
    traces = [
        {
            "trace_id": "OLD",
            "captured_at": "2026-09-27T09:00:00+09:00",
            "project": "P1",
            "ordinary_eligible": True,
            "target_event_eligible": False,
            "used_as_control": False,
            "privacy_review": "PASS_NO_SECRET_OR_IDENTIFYING_RAW_CONTENT",
            "evidence_refs": ["E1"],
            "observed_features": features(),
            "summary": "older ordinary trace",
        },
        {
            "trace_id": "NEAR",
            "captured_at": "2026-09-27T11:30:00+09:00",
            "project": "P1",
            "ordinary_eligible": True,
            "target_event_eligible": False,
            "used_as_control": False,
            "privacy_review": "PASS_NO_SECRET_OR_IDENTIFYING_RAW_CONTENT",
            "evidence_refs": ["E2"],
            "observed_features": features(),
            "summary": "nearest prior ordinary trace",
        },
        {
            "trace_id": "FUTURE",
            "captured_at": "2026-09-27T12:30:00+09:00",
            "project": "P1",
            "ordinary_eligible": True,
            "target_event_eligible": False,
            "used_as_control": False,
            "privacy_review": "PASS_NO_SECRET_OR_IDENTIFYING_RAW_CONTENT",
            "evidence_refs": ["E3"],
            "observed_features": features(),
        },
        {
            "trace_id": "OTHER",
            "captured_at": "2026-09-27T11:50:00+09:00",
            "project": "P2",
            "ordinary_eligible": True,
            "target_event_eligible": False,
            "used_as_control": False,
            "privacy_review": "PASS_NO_SECRET_OR_IDENTIFYING_RAW_CONTENT",
            "evidence_refs": ["E4"],
            "observed_features": features(),
        },
    ]

    with tempfile.TemporaryDirectory() as td:
        td = Path(td)
        tp = td / "target.json"
        xp = td / "traces.jsonl"
        tp.write_text(json.dumps(target), encoding="utf-8")
        xp.write_text("\n".join(json.dumps(x) for x in traces) + "\n", encoding="utf-8")
        cp = subprocess.run(
            [sys.executable, str(tool), "--target", str(tp), "--traces", str(xp)],
            check=True, capture_output=True, text=True,
        )
        out = json.loads(cp.stdout)
        assert out["status"] == "MATCHED_CONTROL_SELECTED"
        assert out["selected_trace_id"] == "NEAR"
        assert out["control_draft"]["matched_case_id"] == "OLSR-TARGET-1"

        traces2 = [dict(x, ordinary_eligible=False) for x in traces]
        xp.write_text("\n".join(json.dumps(x) for x in traces2) + "\n", encoding="utf-8")
        cp2 = subprocess.run(
            [sys.executable, str(tool), "--target", str(tp), "--traces", str(xp)],
            check=True, capture_output=True, text=True,
        )
        out2 = json.loads(cp2.stdout)
        assert out2["status"] == "NO_MATCHED_CONTROL_AVAILABLE"

    print("PASS: matched-control selector synthetic tests")


if __name__ == "__main__":
    main()
