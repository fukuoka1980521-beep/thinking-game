from pathlib import Path
import re

root = Path(__file__).resolve().parent / "public_release_v1_0"

patterns = {
    "local_user_path": re.compile(re.escape("C:" + "\\\\" + "Users" + "\\\\" + "user"), re.I),
    "nas_private_ip": re.compile(re.escape("192" + "." + "168" + "." + "11" + "." + "2")),
    "api_key_env_name": re.compile("OPENAI" + "_API" + "_KEY", re.I),
    "bearer_secret_shape": re.compile("Bearer" + r"\s+" + "s" + "k" + r"-[A-Za-z0-9_-]{16,}", re.I),
    "project_key_shape": re.compile("s" + "k" + "-proj-" + r"[A-Za-z0-9_-]{8,}", re.I),
}

hits=[]
for p in root.rglob("*"):
    if not p.is_file():
        continue
    try:
        text=p.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        continue
    for name,pat in patterns.items():
        if pat.search(text):
            hits.append((str(p.relative_to(root)),name))

if hits:
    print("PUBLIC_HYGIENE=FAIL")
    for x in hits[:100]:
        print(x[0],x[1])
    raise SystemExit(1)
print("PUBLIC_HYGIENE=PASS")
print("FILES_SCANNED="+str(sum(1 for p in root.rglob("*") if p.is_file())))
