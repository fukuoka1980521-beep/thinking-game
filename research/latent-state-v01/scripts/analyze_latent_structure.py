#!/usr/bin/env python3
"""Exploratory OLSR analyzer v0.3.

Research rules:
- Dataset roles are explicit and never pooled implicitly.
- Unknown structured features are preserved as missingness, not encoded into the
  same semantic feature space.
- Semantic SVD and missingness SVD are reported separately.
- No external embedding API calls.
- LDA/text analysis is optional and skipped when scikit-learn is unavailable.
- Output is descriptive/hypothesis-generating, never causal.
"""
from __future__ import annotations

import argparse
import json
import math
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
    "human_observation_signal"
]

DATASET_ROLES = {"PROSPECTIVE", "HISTORICAL_NOT_PROSPECTIVE"}


def load_jsonl(path: Path, dataset_role: str) -> list[dict[str, Any]]:
    if not path.exists():
        return []
    rows: list[dict[str, Any]] = []
    for lineno, raw in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
        if not raw.strip():
            continue
        row = json.loads(raw)
        if row.get("natural_case") is not True:
            raise ValueError(f"line {lineno}: natural_case must be true")
        role = row.get("dataset_role")
        if role not in DATASET_ROLES:
            raise ValueError(f"line {lineno}: invalid or missing dataset_role")
        features = row.get("observed_features")
        if not isinstance(features, dict):
            raise ValueError(f"line {lineno}: observed_features must be an object")
        missing = [f for f in CORE_FEATURES if f not in features]
        extra = [f for f in features if f not in CORE_FEATURES]
        if missing:
            raise ValueError(f"line {lineno}: missing observed features: {missing}")
        if extra:
            raise ValueError(f"line {lineno}: unknown observed features: {extra}")
        for feature in CORE_FEATURES:
            if features[feature] not in (0, 1, None):
                raise ValueError(
                    f"line {lineno}: invalid {feature}={features[feature]!r}"
                )
        if role == dataset_role:
            rows.append(row)
    return rows


def structured_arrays(rows: list[dict[str, Any]]):
    values = np.full((len(rows), len(CORE_FEATURES)), np.nan, dtype=float)
    missingness = np.ones((len(rows), len(CORE_FEATURES)), dtype=float)
    for i, row in enumerate(rows):
        features = row["observed_features"]
        for j, feature in enumerate(CORE_FEATURES):
            value = features[feature]
            if value is None:
                continue
            values[i, j] = float(value)
            missingness[i, j] = 0.0
    return values, missingness


def coverage_summary(values: np.ndarray):
    n = max(1, values.shape[0])
    out = []
    for j, feature in enumerate(CORE_FEATURES):
        observed = ~np.isnan(values[:, j])
        observed_count = int(observed.sum())
        positives = int(np.nansum(values[:, j])) if observed_count else 0
        out.append({
            "feature": feature,
            "observed_count": observed_count,
            "coverage_fraction": observed_count / n,
            "positive_count": positives,
            "positive_fraction_among_observed":
                (positives / observed_count) if observed_count else None,
        })
    return out


def svd_summary(matrix: np.ndarray, columns: list[str], case_ids: list[str], max_components: int = 5):
    if matrix.shape[0] < 2 or matrix.shape[1] < 2:
        return {"status": "INSUFFICIENT_DIMENSIONS"}
    centered = matrix - matrix.mean(axis=0, keepdims=True)
    variable = np.std(centered, axis=0) > 0
    if not np.any(variable):
        return {"status": "NO_VARIANCE"}
    centered = centered[:, variable]
    kept_columns = [c for c, keep in zip(columns, variable) if keep]
    if centered.shape[1] == 0:
        return {"status": "NO_VARIANCE"}
    u, s, vt = np.linalg.svd(centered, full_matrices=False)
    k = min(max_components, len(s), max(1, matrix.shape[0] - 1))
    variance = s * s
    total = float(variance.sum()) or 1.0
    coords = u[:, :k] * s[:k]
    components = []
    for i in range(k):
        load = vt[i]
        order = np.argsort(np.abs(load))[::-1][:8]
        case_order = np.argsort(np.abs(coords[:, i]))[::-1][:5]
        components.append({
            "component": i + 1,
            "variance_fraction": float(variance[i] / total),
            "top_loadings": [
                {"feature": kept_columns[j], "loading": float(load[j])}
                for j in order
            ],
            "extreme_cases": [
                {"case_id": case_ids[j], "coordinate": float(coords[j, i])}
                for j in case_order
            ],
        })
    return {"status": "OK", "components": components}



def permutation_component_signal(
    matrix: np.ndarray,
    max_components: int,
    n_permutations: int = 200,
    seed: int = 0,
):
    """Column-wise permutation null preserving feature marginals."""
    if matrix.shape[0] < 8 or matrix.shape[1] < 2:
        return {
            "status": "INSUFFICIENT_DIMENSIONS",
            "n_cases": int(matrix.shape[0]),
            "n_features": int(matrix.shape[1]),
        }
    centered = matrix - matrix.mean(axis=0, keepdims=True)
    observed = np.linalg.svd(centered, compute_uv=False)
    k = min(max_components, len(observed), matrix.shape[0] - 1)
    observed = observed[:k]
    rng = np.random.default_rng(seed)
    null = np.zeros((n_permutations, k), dtype=float)
    for b in range(n_permutations):
        permuted = matrix.copy()
        for j in range(permuted.shape[1]):
            permuted[:, j] = rng.permutation(permuted[:, j])
        permuted -= permuted.mean(axis=0, keepdims=True)
        sv = np.linalg.svd(permuted, compute_uv=False)[:k]
        null[b, :len(sv)] = sv
    q95 = np.quantile(null, 0.95, axis=0)
    return {
        "status": "OK",
        "n_permutations": n_permutations,
        "seed": seed,
        "components": [
            {
                "component": i + 1,
                "observed_singular_value": float(observed[i]),
                "null_95th_percentile": float(q95[i]),
                "exceeds_null_95": bool(observed[i] > q95[i]),
            }
            for i in range(k)
        ],
        "interpretation": (
            "Exploratory permutation null preserving marginal feature frequencies; "
            "not a formal population-level significance claim."
        ),
    }


def binary_mca_lens(
    values: np.ndarray,
    case_ids: list[str],
    max_components: int,
    min_coverage: float = 0.80,
):
    """Multiple correspondence analysis on sufficiently complete binary features."""
    n = values.shape[0]
    if n < 8:
        return {"status": "INSUFFICIENT_CASES", "n_cases": n}

    feature_indices = []
    features = []
    for j, feature in enumerate(CORE_FEATURES):
        col = values[:, j]
        observed = ~np.isnan(col)
        if float(observed.mean()) < min_coverage:
            continue
        vals = np.unique(col[observed])
        if len(vals) < 2:
            continue
        feature_indices.append(j)
        features.append(feature)

    if len(features) < 2:
        return {
            "status": "INSUFFICIENT_ELIGIBLE_FEATURES",
            "eligible_features": features,
            "min_coverage": min_coverage,
        }

    selected = values[:, feature_indices]
    complete_mask = ~np.isnan(selected).any(axis=1)
    complete = selected[complete_mask]
    complete_ids = [cid for cid, keep in zip(case_ids, complete_mask) if keep]
    min_rows = max(8, 2 * len(features))
    if complete.shape[0] < min_rows:
        return {
            "status": "INSUFFICIENT_COMPLETE_CASES",
            "eligible_features": features,
            "complete_cases": int(complete.shape[0]),
            "minimum_complete_cases": min_rows,
            "min_coverage": min_coverage,
        }

    q = len(features)
    g = np.zeros((complete.shape[0], 2 * q), dtype=float)
    category_names = []
    category_features = []
    for j, feature in enumerate(features):
        g[:, 2*j] = (complete[:, j] == 0).astype(float)
        g[:, 2*j + 1] = (complete[:, j] == 1).astype(float)
        category_names.extend([f"{feature}=0", f"{feature}=1"])
        category_features.extend([feature, feature])

    total = float(g.sum())
    p = g / total
    r = p.sum(axis=1)
    c = p.sum(axis=0)
    expected = np.outer(r, c)
    denom = np.sqrt(expected)
    valid_categories = c > 0
    standardized = np.zeros_like(p)
    standardized[:, valid_categories] = (
        (p[:, valid_categories] - expected[:, valid_categories])
        / denom[:, valid_categories]
    )

    u, singular, vt = np.linalg.svd(standardized, full_matrices=False)
    k = min(max_components, len(singular), complete.shape[0] - 1)
    inertia = singular[:k] ** 2
    total_inertia = float((singular ** 2).sum()) or 1.0
    coords = u[:, :k] * singular[:k]
    components = []

    for i in range(k):
        loading = vt[i]
        agg = {}
        for name, feature, value in zip(category_names, category_features, loading):
            agg[feature] = agg.get(feature, 0.0) + abs(float(value))
        top_features = sorted(agg.items(), key=lambda x: x[1], reverse=True)[:8]
        order = np.argsort(np.abs(loading))[::-1][:10]
        case_order = np.argsort(np.abs(coords[:, i]))[::-1][:5]
        components.append({
            "component": i + 1,
            "inertia_fraction": float(inertia[i] / total_inertia),
            "top_features": [
                {"feature": name, "aggregate_abs_loading": score}
                for name, score in top_features
            ],
            "top_categories": [
                {
                    "category": category_names[j],
                    "loading": float(loading[j]),
                }
                for j in order
            ],
            "extreme_cases": [
                {
                    "case_id": complete_ids[j],
                    "coordinate": float(coords[j, i]),
                }
                for j in case_order
            ],
        })

    return {
        "status": "OK",
        "method": "MCA via correspondence analysis of complete binary indicator matrix",
        "eligible_features": features,
        "complete_cases": int(complete.shape[0]),
        "min_coverage": min_coverage,
        "components": components,
        "interpretation": (
            "Categorical-data sensitivity lens. Components are exploratory and "
            "must not be treated as causal mechanisms."
        ),
    }


def cross_method_convergence(structured: dict[str, Any], mca: dict[str, Any]):
    if structured.get("status") != "OK" or mca.get("status") != "OK":
        return {"status": "UNAVAILABLE"}
    s_components = structured.get("components") or []
    m_components = mca.get("components") or []
    if not s_components or not m_components:
        return {"status": "UNAVAILABLE"}

    svd_top = {
        x["feature"]
        for x in s_components[0].get("top_loadings", [])[:5]
    }
    mca_top = {
        x["feature"]
        for x in m_components[0].get("top_features", [])[:5]
    }
    union = svd_top | mca_top
    score = (len(svd_top & mca_top) / len(union)) if union else 0.0
    return {
        "status": "OK",
        "first_component_top5_jaccard": float(score),
        "svd_top_features": sorted(svd_top),
        "mca_top_features": sorted(mca_top),
        "candidate_convergent": bool(score >= 0.40),
        "threshold_note": (
            "Top-feature Jaccard >=0.40 is an operational convergence heuristic, "
            "not statistical proof."
        ),
    }


def prepare_semantic_matrix(values: np.ndarray, min_coverage: float):
    n = values.shape[0]
    min_observed = max(2, math.ceil(min_coverage * max(1, n)))
    keep = []
    source_indices = []
    imputed_cols = []
    for j, feature in enumerate(CORE_FEATURES):
        col = values[:, j]
        observed = ~np.isnan(col)
        if int(observed.sum()) < min_observed:
            continue
        observed_values = col[observed]
        if len(np.unique(observed_values)) < 2:
            continue
        mean = float(observed_values.mean())
        filled = np.where(observed, col, mean)
        keep.append(feature)
        source_indices.append(j)
        imputed_cols.append(filled)
    if len(imputed_cols) < 2:
        return None, keep, source_indices, min_observed
    return np.column_stack(imputed_cols), keep, source_indices, min_observed


def loading_matrix(matrix: np.ndarray, max_components: int):
    centered = matrix - matrix.mean(axis=0, keepdims=True)
    variable = np.std(centered, axis=0) > 0
    if np.count_nonzero(variable) < 2:
        return None
    reduced = centered[:, variable]
    _, s, vt = np.linalg.svd(reduced, full_matrices=False)
    k = min(max_components, len(s), max(1, matrix.shape[0] - 1))
    padded = np.zeros((k, matrix.shape[1]), dtype=float)
    padded[:, variable] = vt[:k]
    return padded, variable


def leave_one_out_component_stability(
    values: np.ndarray,
    source_indices: list[int],
    full_matrix: np.ndarray,
    max_components: int,
):
    n = values.shape[0]
    if n < 5:
        return {
            "status": "INSUFFICIENT_CASES",
            "n_cases": n,
            "minimum_cases_for_check": 5,
        }

    full = loading_matrix(full_matrix, max_components)
    if full is None:
        return {"status": "NO_STABLE_FULL_COMPONENT_SPACE"}
    full_vt, full_variable = full
    if not np.all(full_variable):
        full_vt = full_vt[:, full_variable]
        active_source_indices = [
            idx for idx, keep in zip(source_indices, full_variable) if keep
        ]
    else:
        active_source_indices = list(source_indices)

    per_component = [[] for _ in range(full_vt.shape[0])]
    valid_runs = 0

    for drop in range(n):
        subset = np.delete(values[:, active_source_indices], drop, axis=0)
        cols = []
        usable = True
        for j in range(subset.shape[1]):
            col = subset[:, j]
            observed = ~np.isnan(col)
            if int(observed.sum()) < 2:
                usable = False
                break
            observed_values = col[observed]
            if len(np.unique(observed_values)) < 2:
                usable = False
                break
            mean = float(observed_values.mean())
            cols.append(np.where(observed, col, mean))
        if not usable or len(cols) < 2:
            continue
        loo_matrix = np.column_stack(cols)
        loo = loading_matrix(loo_matrix, max_components)
        if loo is None:
            continue
        loo_vt, loo_variable = loo
        if not np.all(loo_variable):
            continue

        valid_runs += 1
        for i, full_vec in enumerate(full_vt):
            best = 0.0
            for loo_vec in loo_vt:
                denom = float(np.linalg.norm(full_vec) * np.linalg.norm(loo_vec))
                if denom == 0:
                    continue
                similarity = abs(float(np.dot(full_vec, loo_vec) / denom))
                best = max(best, similarity)
            per_component[i].append(best)

    if valid_runs == 0:
        return {"status": "NO_VALID_LEAVE_ONE_OUT_RUNS", "n_cases": n}

    components = []
    for i, sims in enumerate(per_component):
        if not sims:
            components.append({
                "component": i + 1,
                "median_abs_cosine": None,
                "minimum_abs_cosine": None,
            })
            continue
        components.append({
            "component": i + 1,
            "median_abs_cosine": float(np.median(sims)),
            "minimum_abs_cosine": float(np.min(sims)),
        })

    first = components[0]
    candidate_stable = (
        first["median_abs_cosine"] is not None
        and first["median_abs_cosine"] >= 0.75
        and first["minimum_abs_cosine"] >= 0.50
    )
    return {
        "status": "OK",
        "valid_runs": valid_runs,
        "components": components,
        "first_component_candidate_stable": candidate_stable,
        "threshold_note": (
            "0.75 median / 0.50 minimum absolute cosine are operational "
            "anti-overfit heuristics, not inferential guarantees"
        ),
    }


def semantic_structured_svd(values: np.ndarray, case_ids: list[str], max_components: int, min_coverage: float):
    n = values.shape[0]
    if n < 2:
        return {"status": "INSUFFICIENT_ROWS"}
    matrix, keep, source_indices, min_observed = prepare_semantic_matrix(
        values, min_coverage
    )
    if matrix is None:
        return {
            "status": "INSUFFICIENT_OBSERVED_VARIATION",
            "min_coverage": min_coverage,
            "min_observed": min_observed,
            "eligible_features": keep,
        }
    out = svd_summary(matrix, keep, case_ids, max_components)
    out["min_coverage"] = min_coverage
    out["min_observed"] = min_observed
    out["eligible_features"] = keep
    out["missing_value_handling"] = "feature-wise observed-mean imputation for decomposition only"
    out["leave_one_out_stability"] = leave_one_out_component_stability(
        values, source_indices, matrix, max_components
    )
    out["permutation_null"] = permutation_component_signal(
        matrix, max_components
    )
    return out


def missingness_svd(missingness: np.ndarray, case_ids: list[str], max_components: int):
    out = svd_summary(missingness, [f + "__MISSING" for f in CORE_FEATURES], case_ids, max_components)
    out["interpretation"] = "observation-coverage structure only; do not interpret as latent task semantics"
    return out


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


def analysis_readiness(
    rows: list[dict[str, Any]],
    structured: dict[str, Any],
    mca: dict[str, Any],
    convergence: dict[str, Any],
):
    n = len(rows)
    projects = len({r.get("project") for r in rows if r.get("project")})
    tracks = len({r.get("track") for r in rows if r.get("track")})
    eligible_count = len(structured.get("eligible_features") or [])
    dynamic_min_cases = max(24, 2 * max(1, eligible_count))

    stability = structured.get("leave_one_out_stability", {})
    stable = stability.get("first_component_candidate_stable") is True
    permutation = structured.get("permutation_null", {})
    permutation_components = permutation.get("components") or []
    exceeds_null = bool(
        permutation_components
        and permutation_components[0].get("exceeds_null_95") is True
    )
    mca_ok = mca.get("status") == "OK"
    convergent = convergence.get("candidate_convergent") is True

    if n < 8 or projects < 2 or tracks < 2:
        level = "ACCUMULATE_ONLY"
    elif (
        n >= dynamic_min_cases
        and projects >= 3
        and tracks >= 2
        and stable
        and exceeds_null
        and mca_ok
        and convergent
    ):
        level = "CANDIDATE_STRUCTURE_ONLY"
    else:
        level = "EXPLORATORY_ONLY"

    return {
        "level": level,
        "n_cases": n,
        "n_projects": projects,
        "n_tracks": tracks,
        "eligible_structured_features": eligible_count,
        "dynamic_min_cases_for_candidate": dynamic_min_cases,
        "checks": {
            "leave_one_out_stable": stable,
            "first_component_exceeds_permutation_null_95": exceeds_null,
            "mca_available": mca_ok,
            "cross_method_candidate_convergent": convergent,
        },
        "policy": (
            "Operational anti-overfit gate only. The dynamic case floor, "
            "permutation null, MCA sensitivity lens, and convergence threshold "
            "do not establish statistical power, validity, prevalence, or causality."
        ),
        "factor_naming_allowed": level == "CANDIDATE_STRUCTURE_ONLY",
        "development_os_promotion_allowed": False,
    }


def main():
    p = argparse.ArgumentParser()
    p.add_argument("jsonl", type=Path)
    p.add_argument("--dataset-role", choices=sorted(DATASET_ROLES), default="PROSPECTIVE")
    p.add_argument("--max-components", type=int, default=5)
    p.add_argument("--min-coverage", type=float, default=0.60)
    p.add_argument("--topics", type=int, default=3)
    p.add_argument("--mca-min-coverage", type=float, default=0.80)
    p.add_argument("--output", type=Path)
    args = p.parse_args()

    rows = load_jsonl(args.jsonl, args.dataset_role)
    result: dict[str, Any] = {
        "research_phase": "operational-latent-state-reliability-v0.3",
        "dataset_role": args.dataset_role,
        "causal_interpretation_allowed": False,
        "n_cases": len(rows),
    }
    if not rows:
        result["status"] = "NO_CASES"
    else:
        ids = [r["case_id"] for r in rows]
        values, missingness = structured_arrays(rows)
        result["status"] = "OK"
        result["feature_coverage"] = coverage_summary(values)
        result["structured_feature_svd"] = semantic_structured_svd(
            values, ids, args.max_components, args.min_coverage
        )
        result["binary_mca_lens"] = binary_mca_lens(
            values, ids, args.max_components, args.mca_min_coverage
        )
        result["cross_method_convergence"] = cross_method_convergence(
            result["structured_feature_svd"], result["binary_mca_lens"]
        )
        result["analysis_readiness"] = analysis_readiness(
            rows,
            result["structured_feature_svd"],
            result["binary_mca_lens"],
            result["cross_method_convergence"],
        )
        result["missingness_svd"] = missingness_svd(
            missingness, ids, args.max_components
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
