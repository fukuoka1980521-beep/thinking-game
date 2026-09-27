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


def run(tool, packet):
    with tempfile.TemporaryDirectory() as td:
        p = Path(td) / "packet.json"
        p.write_text(json.dumps(packet), encoding="utf-8")
        cp = subprocess.run([sys.executable, str(tool), str(p)], check=True, capture_output=True, text=True)
        return json.loads(cp.stdout)


def base_packet():
    f = features()
    f["evidence_gap"] = 1
    return {
        "event_id": "TEST-001",
        "captured_at": "2026-09-27T10:00:00+09:00",
        "project": "P1",
        "natural_occurrence": True,
        "summary": "synthetic unit test event",
        "materiality_reason": "material test-only condition",
        "evidence_refs": ["SYNTHETIC_TEST_FIXTURE"],
        "privacy_review": "PASS_NO_SECRET_OR_IDENTIFYING_RAW_CONTENT",
        "observed_conditions": ["UNSUPPORTED_FACTUAL_CLAIM_OR_NEAR_MISS"],
        "observed_features": f,
        "claim_state": "UNVERIFIED",
    }


def main():
    tool = Path(__file__).resolve().parent / "triage_natural_event.py"

    out = run(tool, base_packet())
    assert out["status"] == "CAPTURE_ELIGIBLE_TARGET"
    assert out["track"] == "HALLUCINATION"
    assert out["case_draft"]["case_role"] == "TARGET_EVENT"

    p = base_packet()
    p["natural_occurrence"] = False
    out = run(tool, p)
    assert out["eligible"] is False
    assert "event did not arise naturally in ordinary work" in out["reasons"]

    p = base_packet()
    p["observed_conditions"] = []
    out = run(tool, p)
    assert out["eligible"] is False
    assert "no protocol-eligible material condition" in out["reasons"]

    p = base_packet()
    p["observed_conditions"] = [
        "GLOBAL_REASSESSMENT_TRIGGER",
        "UNSUPPORTED_FACTUAL_CLAIM_OR_NEAR_MISS",
    ]
    out = run(tool, p)
    assert out["track"] == "MULTI_TRACK"

    print("PASS: natural-event triage synthetic tests")


if __name__ == "__main__":
    main()
