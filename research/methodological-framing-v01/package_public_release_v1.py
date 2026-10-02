from __future__ import annotations
import hashlib, zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SRC = ROOT / 'public_release_v1_0'
OUT = ROOT / 'Methodological_Framing_Public_Release_v1.0_20261003.zip'
FIXED_DT = (2026, 10, 3, 0, 0, 0)

if not SRC.is_dir():
    raise SystemExit('public_release_v1_0 missing')

files = sorted(p for p in SRC.rglob('*') if p.is_file() and '__pycache__' not in p.parts and p.suffix != '.pyc')
with zipfile.ZipFile(OUT, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as zf:
    for p in files:
        rel = p.relative_to(SRC).as_posix()
        info = zipfile.ZipInfo(rel, FIXED_DT)
        info.compress_type = zipfile.ZIP_DEFLATED
        info.external_attr = 0o644 << 16
        zf.writestr(info, p.read_bytes(), compress_type=zipfile.ZIP_DEFLATED, compresslevel=9)

h = hashlib.sha256(OUT.read_bytes()).hexdigest().upper()
print('DETERMINISTIC_ZIP=PASS')
print('FILES=' + str(len(files)))
print('BYTES=' + str(OUT.stat().st_size))
print('SHA256=' + h)
