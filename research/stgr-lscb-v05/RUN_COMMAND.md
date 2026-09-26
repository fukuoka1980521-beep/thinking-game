# STGR / LSCB v0.5 — Cloud Shell start command

The v0.5 design is frozen on branch `research/stgr-lscb-v05`.

Run exactly once in authenticated Google Cloud Shell:

```bash
rm -rf ~/stgr-v05-run && git clone --depth 1 --branch research/stgr-lscb-v05 https://github.com/fukuoka1980521-beep/thinking-game.git ~/stgr-v05-run && cd ~/stgr-v05-run && nohup python3 research/stgr-lscb-v05/run_v05.py > ~/stgr-v05.log 2>&1 < /dev/null & echo "STGR v0.5 PID=$!" && sleep 3 && tail -n 20 ~/stgr-v05.log
```

Expected start markers:

```text
[STGR v0.5] START — matched counterfactual 96-run pilot
[STGR v0.5] cache=...
```

The runner:
- uses the existing authenticated Cloud Shell gcloud identity;
- caches every successful exact Vertex response under `~/.stgr_lscb_v05_call_cache`;
- runs 96 model decisions under the frozen v0.5 manifest;
- uses explicit non-ambiguous action ontology;
- outputs blinded cross-model judging packets;
- uploads `STGR_LSCB_RESULTS_V0_5.zip` to the research Drive folder;
- uploads technical-failure evidence if the run fails.
