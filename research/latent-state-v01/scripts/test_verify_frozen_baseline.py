#!/usr/bin/env python3
from __future__ import annotations

import hashlib
import json
import subprocess
import sys
import tempfile
from pathlib import Path


def blob_sha(data: bytes):
    return hashlib.sha1(f"blob {len(data)}\0".encode() + data).hexdigest()


def main():
    tool = Path(__file__).resolve().parent / "verify_frozen_baseline.py"
    with tempfile.TemporaryDirectory() as td:
        root = Path(td)
        f = root / "x.txt"
        f.write_text("abc\n", encoding="utf-8")
        manifest = root / "manifest.json"
        manifest.write_text(
            json.dumps({
                "critical_files": [["x.txt", blob_sha(f.read_bytes())]]
            }),
            encoding="utf-8",
        )

        ok = subprocess.run(
            [sys.executable, str(tool), "--manifest", str(manifest), "--root", str(root)],
            capture_output=True, text=True,
        )
        assert ok.returncode == 0
        assert "OLSR_FROZEN_BASELINE_PASS" in ok.stdout

        f.write_text("changed\n", encoding="utf-8")
        bad = subprocess.run(
            [sys.executable, str(tool), "--manifest", str(manifest), "--root", str(root)],
            capture_output=True, text=True,
        )
        assert bad.returncode != 0
        assert "DRIFT x.txt" in bad.stdout

    print("PASS: frozen baseline verifier")


if __name__ == "__main__":
    main()
