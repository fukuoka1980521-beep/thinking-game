#!/usr/bin/env python3
"""Append one prospective natural case with deterministic tri-state validation."""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from analyze_latent_structure import CORE_FEATURES

TRACKS = {"LTM", "ANSWER_VARIANCE", "HALLUCINATION", "MULTI_TRACK"}
CLAIM_STATES = {"VERIFIED", "SUPPORTED_INFERENCE", "UNVERIFIED", "CONFLICTED", "UNKNOWN"}
REQUIRED = {
    "case_id", "captured_at", "project", "track", "dataset_role", "natural_case",
    "summary", "observed_features", "claim_state", "evidence_refs",
    "case_role", "matched_case_id", "eligibility_basis", "materiality_reason",
    "selection_rule", "privacy_review",
}


def load_payload(path: str | None):
    raw = Path(path).read_text(encoding="utf-8") if path else sys.stdin.read()
    return json.loads(raw)


def validate(case):
    missing = sorted(REQUIRED - set(case))
    if missing:
        raise ValueError("missing required fields: " + ", ".join(missing))
    if case["dataset_role"] != "PROSPECTIVE":
        raise ValueError("capture_case.py only appends PROSPECTIVE cases")
    if case["natural_case"] is not True:
        raise ValueError("natural_case must be true; synthetic fixtures are not research cases")
    if case["track"] not in TRACKS:
        raise ValueError("invalid track")
    if case["case_role"] not in {"TARGET_EVENT", "MATCHED_ORDINARY_CONTROL"}:
        raise ValueError("invalid case_role")
    if case["privacy_review"] != "PASS_NO_SECRET_OR_IDENTIFYING_RAW_CONTENT":
        raise ValueError("privacy_review must pass before capture")
    if not str(case["eligibility_basis"]).strip():
        raise ValueError("eligibility_basis is required")
    if not str(case["selection_rule"]).strip():
        raise ValueError("selection_rule is required")
    if case["case_role"] == "TARGET_EVENT":
        if not str(case.get("materiality_reason") or "").strip():
            raise ValueError("TARGET_EVENT requires materiality_reason")
    else:
        if not str(case.get("matched_case_id") or "").strip():
            raise ValueError("MATCHED_ORDINARY_CONTROL requires matched_case_id")
        if case.get("materiality_reason") not in (None, ""):
            raise ValueError("MATCHED_ORDINARY_CONTROL must not invent materiality_reason")
    if case["claim_state"] not in CLAIM_STATES:
        raise ValueError("invalid claim_state")
    features = case["observed_features"]
    if not isinstance(features, dict):
        raise ValueError("observed_features must be an object")
    missing_features = sorted(set(CORE_FEATURES) - set(features))
    extra_features = sorted(set(features) - set(CORE_FEATURES))
    if missing_features:
        raise ValueError("all core features must be explicitly 0/1/null; missing: " + ", ".join(missing_features))
    if extra_features:
        raise ValueError("unknown observed features: " + ", ".join(extra_features))
    for key in CORE_FEATURES:
        value = features[key]
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
