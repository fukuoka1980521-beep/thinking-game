#!/usr/bin/env python3
"""Append one prospective natural case with lightweight deterministic validation."""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

TRACKS = {"LTM", "ANSWER_VARIANCE", "HALLUCINATION", "MULTI_TRACK"}
CLAIM_STATES = {"VERIFIED", "SUPPORTED_INFERENCE", "UNVERIFIED", "CONFLICTED", "UNKNOWN"}
REQUIRED = {
    "case_id", "captured_at", "project", "track", "natural_case",
    "summary", "observed_features", "claim_state", "evidence_refs",
}


def load_payload(path: str | None):
    raw = Path(path).read_text(encoding="utf-8") if path else sys.stdin.read()
    return json.loads(raw)


def validate(case):
    missing = sorted(REQUIRED - set(case))
    if missing:
        raise ValueError("missing required fields: " + ", ".join(missing))
    if case["natural_case"] is not True:
        raise ValueError("natural_case must be true; synthetic fixtures are not research cases")
    if case["track"] not in TRACKS:
        raise ValueError("invalid track")
    if case["claim_state"] not in CLAIM_STATES:
        raise ValueError("invalid claim_state")
    if not isinstance(case["observed_features"], dict):
        raise ValueError("observed_features must be an object")
    for key, value in case["observed_features"].items():
        if value not in (0, 1, None):
            raise ValueError(f"feature {key}: value must be 0, 1, or null")
    if not isinstance(case["evidence_refs"], list):
        raise ValueError("evidence_refs must be an array")
    emb = case.get("embedding")
    if emb is not None:
        if not case.get("embedding_model"):
            raise ValueError("embedding_model is required when embedding is present")
        if not isinstance(emb, list) or not emb:
            raise ValueError("embedding must be a non-empty array")
        if not all(isinstance(v, (int, float)) for v in emb):
            raise ValueError("embedding values must be numeric")
    tokens = case.get("topic_tokens")
    if tokens is not None and (
        not isinstance(tokens, list) or not all(isinstance(t, str) and t.strip() for t in tokens)
    ):
        raise ValueError("topic_tokens must be null or a list of non-empty strings")


def existing_ids(target: Path):
    if not target.exists():
        return set()
    ids = set()
    for raw in target.read_text(encoding="utf-8").splitlines():
        if raw.strip():
            ids.add(json.loads(raw)["case_id"])
    return ids


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--input", help="JSON file; omit to read stdin")
    p.add_argument("--target", required=True, type=Path)
    args = p.parse_args()

    case = load_payload(args.input)
    validate(case)
    if case["case_id"] in existing_ids(args.target):
        raise ValueError(f"duplicate case_id: {case['case_id']}")

    args.target.parent.mkdir(parents=True, exist_ok=True)
    with args.target.open("a", encoding="utf-8") as fh:
        fh.write(json.dumps(case, ensure_ascii=False, sort_keys=True) + "\n")
    print(f"APPENDED {case['case_id']} -> {args.target}")


if __name__ == "__main__":
    main()
