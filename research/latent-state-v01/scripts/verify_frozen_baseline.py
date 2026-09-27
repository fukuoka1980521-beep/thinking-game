#!/usr/bin/env python3
"""Verify OLSR frozen baseline file identities using Git blob SHA-1."""
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path


def git_blob_sha(data: bytes) -> str:
    header = f"blob {len(data)}\0".encode("utf-8")
    return hashlib.sha1(header + data).hexdigest()


def main():
    p = argparse.ArgumentParser()
    p.add_argument(
        "--manifest",
        type=Path,
        default=Path("research/latent-state-v01/FROZEN_BASELINE_MANIFEST.json"),
    )
    p.add_argument("--root", type=Path, default=Path("."))
    args = p.parse_args()

    manifest = json.loads(args.manifest.read_text(encoding="utf-8"))
    failures = []
    checked = 0

    for path, expected in manifest["critical_files"]:
        full = args.root / path
        if not full.exists():
            failures.append(f"MISSING {path}")
            continue
        actual = git_blob_sha(full.read_bytes())
        checked += 1
        if actual != expected:
            failures.append(
                f"DRIFT {path} expected={expected} actual={actual}"
            )

    if failures:
        print("OLSR_FROZEN_BASELINE_FAIL")
        for failure in failures:
            print(failure)
        raise SystemExit(1)

    print(f"OLSR_FROZEN_BASELINE_PASS checked={checked}")


if __name__ == "__main__":
    main()
