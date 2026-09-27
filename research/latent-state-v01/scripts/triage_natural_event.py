#!/usr/bin/env python3
"""OLSR natural-event triage.

This tool does not create research events. It converts a source-backed event packet
into a deterministic eligibility decision and, when eligible, a case draft that
can be passed to capture_case.py after review.

It must never be fed synthetic research observations.
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any

from analyze_latent_structure import CORE_FEATURES

ELIGIBLE_CONDITIONS = {
    "GLOBAL_REASSESSMENT_TRIGGER": "LTM",
    "MATERIAL_ANSWER_VARIANCE": "ANSWER_VARIANCE",
    "UNSUPPORTED_FACTUAL_CLAIM_OR_NEAR_MISS": "HALLUCINATION",
    "SOURCE_IDENTITY_OR_VERSION_MISMATCH": "HALLUCINATION",
    "TEMPORAL_FRESHNESS_MISMATCH": "HALLUCINATION",
    "TOOL_RESULT_MISREAD_OR_OVERGENERALIZATION": "HALLUCINATION",
    "CONTEXT_OR_MEMORY_CONTAMINATION": "HALLUCINATION",
    "PREMATURE_CLOSURE_SCOPE_OR_DESTRUCTIVE_PRESSURE": "LTM",
}

PRIVACY_PASS = "PASS_NO_SECRET_OR_IDENTIFYING_RAW_CONTENT"


def _nonempty(value: Any) -> bool:
    return bool(str(value or "").strip())


def _track_for(conditions: list[str]) -> str:
    tracks = {ELIGIBLE_CONDITIONS[c] for c in conditions if c in ELIGIBLE_CONDITIONS}
    if len(tracks) > 1:
        return "MULTI_TRACK"
    if tracks:
        return next(iter(tracks))
    return "MULTI_TRACK"


def validate_features(features: Any) -> list[str]:
    errors: list[str] = []
    if not isinstance(features, dict):
        return ["observed_features must be an object"]
    missing = sorted(set(CORE_FEATURES) - set(features))
    extra = sorted(set(features) - set(CORE_FEATURES))
    if missing:
        errors.append("missing core features: " + ", ".join(missing))
    if extra:
        errors.append("unknown core features: " + ", ".join(extra))
    for key in CORE_FEATURES:
        if key in features and features[key] not in (0, 1, None):
            errors.append(f"{key} must be 0, 1, or null")
    return errors


def triage(packet: dict[str, Any]) -> dict[str, Any]:
    required = {
        "event_id",
        "captured_at",
        "project",
        "natural_occurrence",
        "summary",
        "materiality_reason",
        "evidence_refs",
        "privacy_review",
        "observed_conditions",
        "observed_features",
        "claim_state",
    }
    missing = sorted(required - set(packet))
    if missing:
        return {
            "status": "INELIGIBLE_MALFORMED",
            "eligible": False,
            "reasons": ["missing fields: " + ", ".join(missing)],
        }

    reasons: list[str] = []
    if packet.get("natural_occurrence") is not True:
        reasons.append("event did not arise naturally in ordinary work")
    if packet.get("privacy_review") != PRIVACY_PASS:
        reasons.append("privacy review not passed")
    if not _nonempty(packet.get("materiality_reason")):
        reasons.append("materiality reason missing")
    if not isinstance(packet.get("evidence_refs"), list) or not packet["evidence_refs"]:
        reasons.append("source-backed evidence references missing")
    if not _nonempty(packet.get("project")):
        reasons.append("project missing")
    if not _nonempty(packet.get("summary")):
        reasons.append("summary missing")

    conditions = packet.get("observed_conditions")
    if not isinstance(conditions, list):
        reasons.append("observed_conditions must be an array")
        conditions = []
    unknown_conditions = sorted(set(conditions) - set(ELIGIBLE_CONDITIONS))
    if unknown_conditions:
        reasons.append("unknown observed conditions: " + ", ".join(unknown_conditions))
    qualifying = [c for c in conditions if c in ELIGIBLE_CONDITIONS]
    if not qualifying:
        reasons.append("no protocol-eligible material condition")

    reasons.extend(validate_features(packet.get("observed_features")))

    claim_state = packet.get("claim_state")
    if claim_state not in {
        "VERIFIED",
        "SUPPORTED_INFERENCE",
        "UNVERIFIED",
        "CONFLICTED",
        "UNKNOWN",
    }:
        reasons.append("invalid claim_state")

    if reasons:
        return {
            "status": "NOT_CAPTURE_ELIGIBLE",
            "eligible": False,
            "reasons": reasons,
            "qualifying_conditions": qualifying,
        }

    track = _track_for(qualifying)
    case_id = str(packet.get("case_id") or f"OLSR-{packet['event_id']}")
    draft = {
        "case_id": case_id,
        "captured_at": packet["captured_at"],
        "project": packet["project"],
        "track": track,
        "dataset_role": "PROSPECTIVE",
        "natural_case": True,
        "parent_case_id": packet.get("parent_case_id"),
        "question_or_task_fingerprint": packet.get("question_or_task_fingerprint"),
        "summary": packet["summary"],
        "context_delta": packet.get("context_delta"),
        "evidence_set_summary": packet.get("evidence_set_summary"),
        "core_claim_or_action_diff": packet.get("core_claim_or_action_diff"),
        "classification": packet.get("classification"),
        "epistemic_failure_views": packet.get("epistemic_failure_views") or [],
        "claim_state": claim_state,
        "impact": packet.get("impact"),
        "intervention": packet.get("intervention"),
        "outcome": packet.get("outcome"),
        "hypothesis_status": packet.get("hypothesis_status", "ACTIVE"),
        "observed_features": packet["observed_features"],
        "embedding": packet.get("embedding"),
        "embedding_model": packet.get("embedding_model"),
        "embedding_generated_at": packet.get("embedding_generated_at"),
        "text_for_topic_model": packet.get("text_for_topic_model"),
        "topic_tokens": packet.get("topic_tokens"),
        "evidence_refs": packet["evidence_refs"],
        "notes": packet.get("notes"),
        "case_role": "TARGET_EVENT",
        "matched_case_id": None,
        "eligibility_basis": ";".join(sorted(qualifying)),
        "materiality_reason": packet["materiality_reason"],
        "selection_rule": "NATURAL_TARGET_EVENT_PROTOCOL_V0_4",
        "privacy_review": PRIVACY_PASS,
    }

    return {
        "status": "CAPTURE_ELIGIBLE_TARGET",
        "eligible": True,
        "track": track,
        "qualifying_conditions": qualifying,
        "case_draft": draft,
        "note": (
            "Eligibility is protocol compliance, not a truth judgment and not evidence "
            "for a latent factor by itself."
        ),
    }


def main():
    p = argparse.ArgumentParser()
    p.add_argument("packet", type=Path)
    p.add_argument("--output", type=Path)
    args = p.parse_args()
    packet = json.loads(args.packet.read_text(encoding="utf-8"))
    result = triage(packet)
    rendered = json.dumps(result, ensure_ascii=False, indent=2)
    if args.output:
        args.output.write_text(rendered + "\n", encoding="utf-8")
    else:
        print(rendered)


if __name__ == "__main__":
    main()
