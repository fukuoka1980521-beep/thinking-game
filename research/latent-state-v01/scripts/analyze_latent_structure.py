#!/usr/bin/env python3
"""Exploratory latent-structure analyzer.

Research rules:
- Natural-case JSONL only.
- Unknown structured features are represented with explicit unknown indicators.
- No external embedding API calls.
- LDA/text analysis is optional and skipped when scikit-learn is unavailable.
- Output is descriptive/hypothesis-generating, never causal.
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any

import numpy as np

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
    "human_observation_signal",
]


def load_jsonl(path: Path) -> list[dict[str, Any]]:
    if not path.exists():
        return []
    rows: list[dict[str, Any]] = []
    for lineno, raw in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
        if not raw.strip():
            continue
        row = json.loads(raw)
        if row.get("natural_case") is not True:
            raise ValueError(f"line {lineno}: natural_case must be true")
        rows.append(row)
    return rows


def structured_matrix(rows: list[dict[str, Any]]):
    cols: list[str] = []
    values = []
    for feature in CORE_FEATURES:
        cols.extend([feature, feature + "__UNKNOWN"])
    for row in rows:
        feat = row.get("observed_features") or {}
        v = []
        for feature in CORE_FEATURES:
            x = feat.get(feature, None)
            if x is None:
                v.extend([0.0, 1.0])
            elif x in (0, 1):
                v.extend([float(x), 0.0])
            else:
                raise ValueError(f"{row.get('case_id')}: invalid {feature}={x!r}")
        values.append(v)
    return np.asarray(values, dtype=float), cols


def svd_summary(matrix: np.ndarray, columns: list[str], case_ids: list[str], max_components: int = 5):
    if matrix.shape[0] < 2 or matrix.shape[1] < 2:
        return {"status": "INSUFFICIENT_ROWS"}
    centered = matrix - matrix.mean(axis=0, keepdims=True)
    if not np.any(np.abs(centered) > 0):
        return {"status": "NO_VARIANCE"}
    u, s, vt = np.linalg.svd(centered, full_matrices=False)
    k = min(max_components, len(s), max(1, matrix.shape[0] - 1))
    variance = s * s
    total = float(variance.sum()) or 1.0
    components = []
    coords = u[:, :k] * s[:k]
    for i in range(k):
        load = vt[i]
        order = np.argsort(np.abs(load))[::-1][:8]
        case_order = np.argsort(np.abs(coords[:, i]))[::-1][:5]
        components.append({
            "component": i + 1,
            "variance_fraction": float(variance[i] / total),
            "top_loadings": [
                {"feature": columns[j], "loading": float(load[j])}
                for j in order
            ],
            "extreme_cases": [
                {"case_id": case_ids[j], "coordinate": float(coords[j, i])}
                for j in case_order
            ],
        })
    return {"status": "OK", "components": components}


def embedding_groups(rows: list[dict[str, Any]]):
    groups: dict[tuple[str, int], list[dict[str, Any]]] = {}
    for row in rows:
        emb = row.get("embedding")
        model = row.get("embedding_model")
        if emb is None:
            continue
        if not model:
            raise ValueError(f"{row.get('case_id')}: embedding_model required")
        key = (model, len(emb))
        groups.setdefault(key, []).append(row)
    return groups


def embedding_summaries(rows: list[dict[str, Any]], max_components: int):
    out = []
    for (model, dim), group in embedding_groups(rows).items():
        matrix = np.asarray([r["embedding"] for r in group], dtype=float)
        ids = [r["case_id"] for r in group]
        columns = [f"embedding_dim_{i}" for i in range(dim)]
        out.append({
            "embedding_model": model,
            "dimension": dim,
            "n_cases": len(group),
            "svd": svd_summary(matrix, columns, ids, max_components),
        })
    return out


def topic_model(rows: list[dict[str, Any]], n_topics: int):
    docs, ids, modes = [], [], []
    skipped_tokenization = []
    for row in rows:
        tokens = row.get("topic_tokens")
        text = row.get("text_for_topic_model")
        if tokens:
            docs.append([str(t) for t in tokens if str(t).strip()])
            ids.append(row["case_id"])
            modes.append("TOKENS")
        elif text:
            # Raw Japanese/CJK text without a declared tokenizer is not pushed
            # through the default whitespace/word tokenizer. That would create
            # misleading topics. Use topic_tokens or semantic embeddings instead.
            if any("\u3040" <= ch <= "\u30ff" or "\u4e00" <= ch <= "\u9fff" for ch in text):
                skipped_tokenization.append(row["case_id"])
                continue
            docs.append(text)
            ids.append(row["case_id"])
            modes.append("RAW_TEXT")
    if len(docs) < max(3, n_topics):
        return {
            "status": "INSUFFICIENT_TOPIC_CASES",
            "n_cases": len(docs),
            "skipped_tokenization_required": skipped_tokenization,
        }
    try:
        from sklearn.feature_extraction.text import CountVectorizer
        from sklearn.decomposition import LatentDirichletAllocation
    except Exception:
        return {
            "status": "SKIPPED_SKLEARN_UNAVAILABLE",
            "n_cases": len(docs),
            "skipped_tokenization_required": skipped_tokenization,
        }

    if all(m == "TOKENS" for m in modes):
        vec = CountVectorizer(
            analyzer=lambda x: x,
            lowercase=False,
            token_pattern=None,
            min_df=1,
            max_df=0.95,
        )
    elif all(m == "RAW_TEXT" for m in modes):
        vec = CountVectorizer(min_df=1, max_df=0.95, stop_words="english")
    else:
        # Mixed tokenized/raw corpora are normalized into token lists.
        normalized = []
        for doc, mode in zip(docs, modes):
            normalized.append(doc if mode == "TOKENS" else str(doc).split())
        docs = normalized
        vec = CountVectorizer(
            analyzer=lambda x: x,
            lowercase=False,
            token_pattern=None,
            min_df=1,
            max_df=0.95,
        )
    x = vec.fit_transform(docs)
    if x.shape[1] < 2:
        return {"status": "INSUFFICIENT_VOCABULARY", "n_cases": len(docs)}
    k = min(n_topics, len(docs) - 1, x.shape[1])
    lda = LatentDirichletAllocation(
        n_components=k,
        random_state=0,
        learning_method="batch",
    )
    mix = lda.fit_transform(x)
    terms = np.asarray(vec.get_feature_names_out())
    topics = []
    for i, comp in enumerate(lda.components_):
        top = terms[np.argsort(comp)[::-1][:10]].tolist()
        topics.append({"topic": i + 1, "top_terms": top})
    case_mix = []
    for i, case_id in enumerate(ids):
        case_mix.append({
            "case_id": case_id,
            "topic_mixture": [float(v) for v in mix[i]],
        })
    return {
        "status": "OK",
        "topics": topics,
        "cases": case_mix,
        "skipped_tokenization_required": skipped_tokenization,
    }


def main():
    p = argparse.ArgumentParser()
    p.add_argument("jsonl", type=Path)
    p.add_argument("--max-components", type=int, default=5)
    p.add_argument("--topics", type=int, default=3)
    p.add_argument("--output", type=Path)
    args = p.parse_args()

    rows = load_jsonl(args.jsonl)
    result: dict[str, Any] = {
        "research_phase": "latent-state-reliability-v0.1",
        "causal_interpretation_allowed": False,
        "n_cases": len(rows),
    }
    if not rows:
        result["status"] = "NO_CASES"
    else:
        ids = [r["case_id"] for r in rows]
        matrix, columns = structured_matrix(rows)
        result["status"] = "OK"
        result["structured_feature_svd"] = svd_summary(
            matrix, columns, ids, args.max_components
        )
        result["embedding_svd_by_model"] = embedding_summaries(
            rows, args.max_components
        )
        result["lda_topic_mixture"] = topic_model(rows, args.topics)
        result["track_counts"] = {
            track: sum(r.get("track") == track for r in rows)
            for track in ["LTM", "ANSWER_VARIANCE", "HALLUCINATION", "MULTI_TRACK"]
        }

    rendered = json.dumps(result, ensure_ascii=False, indent=2)
    if args.output:
        args.output.write_text(rendered + "\n", encoding="utf-8")
    else:
        print(rendered)


if __name__ == "__main__":
    main()
