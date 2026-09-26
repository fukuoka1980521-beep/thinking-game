#!/usr/bin/env python3
import base64, gzip, pathlib
p = pathlib.Path(__file__).resolve().parent
src = gzip.decompress(base64.b64decode((p/"run_v06.py.gz.b64").read_text(encoding="ascii"))).decode("utf-8")
g = {"__name__":"__main__", "__file__":str(p/"run_v06.py")}
exec(compile(src, g["__file__"], "exec"), g)
