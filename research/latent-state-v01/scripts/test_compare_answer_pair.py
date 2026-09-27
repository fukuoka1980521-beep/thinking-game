#!/usr/bin/env python3
from __future__ import annotations

import json
import subprocess
import sys
import tempfile
from pathlib import Path


def run(tool, packet):
    with tempfile.TemporaryDirectory() as td:
        p = Path(td) / "pair.json"
        p.write_text(json.dumps(packet, ensure_ascii=False), encoding="utf-8")
        cp = subprocess.run([sys.executable, str(tool), str(p)], check=True, capture_output=True, text=True)
        return json.loads(cp.stdout)


def base():
    return {
        "pair_id": "TEST-PAIR-001",
        "question_fingerprint": "Q1",
        "answer_a": {
            "question_fingerprint": "Q1",
            "context_fingerprint": "C1",
            "evidence_refs": ["E1"],
            "model_or_route": "M1",
            "core_claims": ["CLAIM-A"],
            "decision": "OBSERVE_OR_TEST",
            "next_actions": ["READ-LOG"],
        },
        "answer_b": {
            "question_fingerprint": "Q1",
            "context_fingerprint": "C1",
            "evidence_refs": ["E1"],
            "model_or_route": "M1",
            "core_claims": ["CLAIM-A"],
            "decision": "OBSERVE_OR_TEST",
            "next_actions": ["READ-LOG"],
        },
    }


def main():
    tool = Path(__file__).resolve().parent / "compare_answer_pair.py"

    p = base()
    out = run(tool, p)
    assert out["status"] == "CORE_STABLE"
    assert out["material_variance"] is False

    p = base()
    p["answer_b"]["core_claims"] = ["CLAIM-B"]
    out = run(tool, p)
    assert out["status"] == "MATERIAL_VARIANCE_REVIEW"
    assert out["material_variance"] is True
    assert out["truth_judgment_allowed"] is False

    p = base()
    p["answer_b"]["core_claims"] = ["CLAIM-B"]
    p["answer_b"]["evidence_refs"] = ["E2"]
    out = run(tool, p)
    assert out["status"] == "EXPLAINED_BY_EVIDENCE_DELTA"
    assert out["material_variance"] is False

    p = base()
    p["answer_b"]["decision"] = "REPLAN_LOCAL"
    p["answer_b"]["model_or_route"] = "M2"
    out = run(tool, p)
    assert out["status"] == "MODEL_OR_ROUTE_DELTA_REVIEW"
    assert out["material_variance"] is True

    print("PASS: answer variance comparator")


if __name__ == "__main__":
    main()
