from pathlib import Path
import re
root=Path(__file__).resolve().parent/"public_release_v1_0"
patterns={
  "email": re.compile(r"\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b",re.I),
  "git_private_config": re.compile(r"\.git[/\\]|github_pat_|ghp_[A-Za-z0-9]+",re.I),
}
hits=[]
for p in root.rglob("*"):
    if not p.is_file(): continue
    try: t=p.read_text(encoding="utf-8")
    except UnicodeDecodeError: continue
    for name,pat in patterns.items():
        if pat.search(t): hits.append((str(p.relative_to(root)),name))
print("SECONDARY_PUBLIC_SCAN="+("PASS" if not hits else "FAIL"))
for h in hits[:50]: print(h)
raise SystemExit(0 if not hits else 1)
