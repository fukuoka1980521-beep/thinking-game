from __future__ import annotations

import hashlib
import json
import re
import secrets
from datetime import datetime
from pathlib import Path

TRACK_FILES = {
    "RQ-A": ("RQ_A_EVENTS_V0_1.jsonl", "RQ_A_RESULTS_V0_1.jsonl"),
    "RQ-B": ("RQ_B_EVENTS_V0_1.jsonl", "RQ_B_RESULTS_V0_1.jsonl"),
}

ADJUDICATION = {
    "RQ-A": {
        "PARENT_GOAL_MISSED",
        "FALSE_REANCHOR",
        "LOCAL_CORRECT_GLOBAL_WRONG",
        "GLOBAL_CORRECT_LOCAL_DELAY",
        "NO_MATERIAL_DIFFERENCE",
        "UNKNOWN",
    },
    "RQ-B": {
        "WRONG_ENTITY_BINDING",
        "WRONG_ENVIRONMENT_BINDING",
        "WRONG_VERSION_BINDING",
        "TEMPORAL_MISMATCH",
        "SOURCE_PROVENANCE_MISMATCH",
        "UNSUPPORTED_INFERENCE",
        "NO_MATERIAL_DIFFERENCE",
        "UNKNOWN",
    },
}


def load_schema(base: Path) -> dict:
    return json.loads((base / "EVENT_SCHEMA_V0_1.json").read_text(encoding="utf-8"))


def read_jsonl(path: Path) -> list[dict]:
    if not path.exists():
        return []
    rows = []
    for lineno, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
        if not line.strip():
            continue
        try:
            rows.append(json.loads(line))
        except json.JSONDecodeError as exc:
            raise ValueError(f"{path.name}:{lineno}: invalid JSON: {exc}") from exc
    return rows


def append_jsonl(path: Path, row: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("a", encoding="utf-8", newline="\n") as fh:
        fh.write(json.dumps(row, ensure_ascii=False, sort_keys=True) + "\n")


def _parse_time(value: str) -> datetime:
    v = str(value).strip().replace("Z", "+00:00")
    try:
        return datetime.fromisoformat(v)
    except ValueError as exc:
        raise ValueError(f"invalid ISO timestamp: {value}") from exc


def _expected_event_id(track: str, index: int) -> str:
    prefix = "RQA" if track == "RQ-A" else "RQB"
    return f"{prefix}-{index:03d}"


def validate_base_event(base: Path, track: str, row: dict) -> dict:
    schema = load_schema(base)
    if track not in TRACK_FILES:
        raise ValueError(f"unknown track: {track}")

    spec = schema["tracks"][track]
    missing = [k for k in spec["base_required_fields"] if k not in row]
    if missing:
        raise ValueError("missing fields: " + ", ".join(missing))

    events_path = base / TRACK_FILES[track][0]
    events = read_jsonl(events_path)
    target = int(spec["target_natural_events"])
    if len(events) >= target:
        raise ValueError(f"{track} pilot boundary reached: {target} events")

    expected = _expected_event_id(track, len(events) + 1)
    if row["event_id"] != expected:
        raise ValueError(f"event_id must be next sequential id: {expected}")

    if row["event_id"] in set(schema["seed_observations_excluded"]):
        raise ValueError("seed observation cannot enter prospective sample")

    observed = _parse_time(row["observed_at"])
    freeze = datetime.fromisoformat(schema["freeze_date"])
    if observed.replace(tzinfo=None) < freeze:
        raise ValueError("event predates protocol freeze")

    for key in spec["base_required_fields"]:
        value = row[key]
        if isinstance(value, str) and not value.strip():
            raise ValueError(f"empty required field: {key}")

    if track == "RQ-A":
        refs = row["observable_state_refs"]
        if not isinstance(refs, list) or not refs or not all(str(x).strip() for x in refs):
            raise ValueError("observable_state_refs must be a non-empty list")
        if row["scope_authority"] not in set(schema["scope_authority_vocabulary"]):
            raise ValueError("invalid scope_authority")
        if row["parent_goal_source"] not in set(schema["parent_goal_source_vocabulary"]):
            raise ValueError("invalid parent_goal_source")
        if row["scope_authority"] == "OWNER_EXPLICIT":
            raise ValueError(
                "explicit Owner-directed scope switch is excluded from RQ-A prospective sample"
            )
    else:
        _parse_time(row["evidence_timestamp"])

    out = dict(row)
    out["track"] = track
    out["schema_version"] = schema["schema_version"]
    out["lifecycle"] = "STATE_FROZEN"
    out["state_frozen_before_consequential_action"] = True
    return out


def capture_event(base: Path, track: str, row: dict) -> dict:
    out = validate_base_event(base, track, row)
    append_jsonl(base / TRACK_FILES[track][0], out)
    return out


def get_event(base: Path, track: str, event_id: str) -> dict:
    for row in read_jsonl(base / TRACK_FILES[track][0]):
        if row.get("event_id") == event_id:
            return row
    raise ValueError(f"unknown event_id: {event_id}")


def packet_paths(base: Path, event_id: str) -> tuple[Path, Path]:
    return (
        base / "blind_packets" / f"{event_id}.json",
        base / "private_blind_keys" / f"{event_id}.json",
    )


def create_blind_packet(base: Path, track: str, event_id: str) -> dict:
    event = get_event(base, track, event_id)
    packet_path, key_path = packet_paths(base, event_id)
    if packet_path.exists() or key_path.exists():
        raise ValueError(f"blind packet already exists: {event_id}")

    if track == "RQ-A":
        common = {
            "event_id": event_id,
            "project_family": event["project_family"],
            "scope_authority": event["scope_authority"],
            "current_task_goal": event["current_task_goal"],
            "proposed_next_operation": event["proposed_next_operation"],
            "scope_transition_type": event["scope_transition_type"],
            "observable_state_refs": event["observable_state_refs"],
        }
        local = dict(common)
        local["instruction"] = (
            "Choose the next operation using the current task goal and observable state. "
            "Do not assume a parent objective not shown here."
        )
        parent = dict(common)
        parent["project_objective"] = event["project_objective"]
        parent["parent_goal_source"] = event["parent_goal_source"]
        parent["instruction"] = (
            "Choose the next operation after explicitly checking whether the current task "
            "and proposed operation still serve the parent project objective."
        )
        named = {"LOCAL": local, "PARENT_ANCHORED": parent}
    else:
        common = {
            "event_id": event_id,
            "claim": event["claim"],
            "source_type": event["source_type"],
            "surface_entity_name": event["surface_entity_name"],
            "evidence_pointer": event["evidence_pointer"],
        }
        unbound = dict(common)
        unbound["instruction"] = (
            "Assign the claim state using the available claim and source context."
        )
        bound = dict(common)
        bound["referent_binding"] = {
            "candidate_entity_identity": event["candidate_entity_identity"],
            "environment": event["environment"],
            "version_or_branch": event["version_or_branch"],
            "evidence_timestamp": event["evidence_timestamp"],
        }
        bound["instruction"] = (
            "Assign the claim state only after checking whether source provenance binds "
            "to this exact entity, environment, version, and time."
        )
        named = {"UNBOUND": unbound, "REFERENT_BOUND": bound}

    labels = ["X", "Y"]
    names = list(named)
    if secrets.randbelow(2):
        names.reverse()
    mapping = dict(zip(labels, names))
    packet = {
        "schema_version": load_schema(base)["schema_version"],
        "event_id": event_id,
        "track": track,
        "blinded": True,
        "condition_X": named[mapping["X"]],
        "condition_Y": named[mapping["Y"]],
    }
    key = {
        "event_id": event_id,
        "track": track,
        "mapping": mapping,
        "packet_sha256": hashlib.sha256(
            json.dumps(packet, ensure_ascii=False, sort_keys=True).encode("utf-8")
        ).hexdigest(),
    }
    packet_path.parent.mkdir(parents=True, exist_ok=True)
    key_path.parent.mkdir(parents=True, exist_ok=True)
    packet_path.write_text(json.dumps(packet, ensure_ascii=False, indent=2), encoding="utf-8")
    key_path.write_text(json.dumps(key, ensure_ascii=False, indent=2), encoding="utf-8")
    return packet


def validate_result(base: Path, track: str, row: dict) -> dict:
    schema = load_schema(base)
    spec = schema["tracks"][track]
    missing = [k for k in spec["result_required_fields"] if k not in row]
    if missing:
        raise ValueError("missing result fields: " + ", ".join(missing))

    event_id = row["event_id"]
    get_event(base, track, event_id)
    packet_path, key_path = packet_paths(base, event_id)
    if not packet_path.exists() or not key_path.exists():
        raise ValueError("blind packet/key missing; create packet before result")

    existing = read_jsonl(base / TRACK_FILES[track][1])
    if any(x.get("event_id") == event_id for x in existing):
        raise ValueError(f"result already recorded: {event_id}")

    if row["blind_adjudication"] not in ADJUDICATION[track]:
        raise ValueError("invalid blind_adjudication")

    key = json.loads(key_path.read_text(encoding="utf-8"))
    out = dict(row)
    out["track"] = track
    out["schema_version"] = schema["schema_version"]
    out["lifecycle"] = "RESULT_RECORDED"
    out["condition_mapping"] = key["mapping"]

    if track == "RQ-A":
        vocab = set(schema["decision_vocabulary"])
        for k in ("condition_x_decision", "condition_y_decision"):
            if row[k] not in vocab:
                raise ValueError(f"invalid decision: {row[k]}")
        by_label = {"X": row["condition_x_decision"], "Y": row["condition_y_decision"]}
        for label, name in key["mapping"].items():
            if name == "LOCAL":
                out["task_local_gate_decision"] = by_label[label]
            elif name == "PARENT_ANCHORED":
                out["parent_anchored_decision"] = by_label[label]
    else:
        vocab = set(schema["claim_state_vocabulary"])
        for k in ("condition_x_claim_state", "condition_y_claim_state"):
            if row[k] not in vocab:
                raise ValueError(f"invalid claim state: {row[k]}")
        by_label = {"X": row["condition_x_claim_state"], "Y": row["condition_y_claim_state"]}
        for label, name in key["mapping"].items():
            if name == "UNBOUND":
                out["unbound_claim_state"] = by_label[label]
            elif name == "REFERENT_BOUND":
                out["bound_claim_state"] = by_label[label]

    if float(row["added_latency_seconds"]) < 0:
        raise ValueError("added_latency_seconds must be >= 0")
    if int(row["additional_tool_calls"]) < 0:
        raise ValueError("additional_tool_calls must be >= 0")
    return out


def record_result(base: Path, track: str, row: dict) -> dict:
    out = validate_result(base, track, row)
    append_jsonl(base / TRACK_FILES[track][1], out)
    return out


def study_status(base: Path) -> dict:
    schema = load_schema(base)
    out = {"schema_version": schema["schema_version"], "tracks": {}}
    for track, (events_name, results_name) in TRACK_FILES.items():
        events = read_jsonl(base / events_name)
        results = read_jsonl(base / results_name)
        target = schema["tracks"][track]["target_natural_events"]
        families = sorted({str(x.get("project_family", "")) for x in events if x.get("project_family")})
        out["tracks"][track] = {
            "events": len(events),
            "results": len(results),
            "target": target,
            "project_families": families,
            "complete": len(events) == target and len(results) == target,
        }
    return out
